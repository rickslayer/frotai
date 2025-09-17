
import { type NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import type { FilterOptions, CityOption } from '@/types';
import { allRegions } from '@/lib/regions';

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://frotai:X7Ra8kREnBX6z6SC@frotai.bylfte3.mongodb.net/';
const dbName = 'frotai';
const collectionName = 'carros';

let client: MongoClient | null = null;

async function connectToMongo() {
  if (client && client.topology && client.topology.isConnected()) {
    return client.db(dbName);
  }
  try {
    client = new MongoClient(mongoUri);
    await client.connect();
    console.log('Connected successfully to MongoDB from /api/filters');
    return client.db(dbName);
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    client = null;
    throw new Error('Failed to connect to the database.');
  }
}

const getDistinctValues = async (collection: import('mongodb').Collection, field: string, match: any = {}) => {
  const values = await collection.distinct(field, { ...match, [field]: { $ne: null, $ne: "" } });
  return values.sort();
};

const getCitiesWithState = async (collection: import('mongodb').Collection, match: any = {}): Promise<CityOption[]> => {
    const pipeline = [
        { $match: { ...match, city: { $ne: null, $ne: "" }, state: { $ne: null, $ne: "" } } },
        { $group: { _id: { city: "$city", state: "$state" } } },
        { $sort: { "_id.city": 1 } },
        { $project: { _id: 0, name: "$_id.city", state: "$_id.state" } }
    ];
    const cities = await collection.aggregate(pipeline).toArray();
    return cities as CityOption[];
}


export async function GET(request: NextRequest) {
  try {
    const db = await connectToMongo();
    const collection = db.collection(collectionName);
    const { searchParams } = request.nextUrl;

    const region = searchParams.get('region');
    const state = searchParams.get('state');
    const manufacturer = searchParams.get('manufacturer');
    const model = searchParams.get('model');

    const match: any = {};
    if (region) match.region = region;
    if (state) match.state = state;
    if (manufacturer) match.manufacturer = manufacturer;
    if (model) match.model = model;

    const [
      manufacturers,
      models,
      versions,
      years,
      cities
    ] = await Promise.all([
      getDistinctValues(collection, 'manufacturer', region || state ? { ...(region && {region}), ...(state && {state}) } : {}),
      manufacturer ? getDistinctValues(collection, 'model', match) : [],
      model ? getDistinctValues(collection, 'version', match) : [],
      getDistinctValues(collection, 'year', {}),
      state ? getCitiesWithState(collection, { state }) : getCitiesWithState(collection) // Fetch all cities if no state
    ]);

    const filterOptions: FilterOptions = {
      regions: allRegions,
      states: [], // States are now static in the client
      cities,
      manufacturers,
      models,
      versions,
      years: (years as number[]).sort((a, b) => b - a),
    };

    return NextResponse.json(filterOptions);
  } catch (err) {
    console.error('Error in GET /api/filters:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error', details: errorMessage }), { status: 500 });
  }
}
