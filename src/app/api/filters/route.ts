
import { type NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import type { FilterOptions } from '@/types';

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
  const query: any = { ...match };
  
  if (field !== 'year') {
    query[field] = { $ne: null, $ne: "" };
  } else {
    query[field] = { $ne: null };
  }


  const values = await collection.distinct(field, query);
  
  if (field === 'year') {
    return (values as number[]).sort((a, b) => b - a);
  }

  return values.sort();
};

export async function GET(request: NextRequest) {
  try {
    const db = await connectToMongo();
    const collection = db.collection(collectionName);
    const { searchParams } = request.nextUrl;

    const manufacturer = searchParams.get('manufacturer');
    const model = searchParams.get('model');
    const versionsParam = searchParams.getAll('version');
    
    // Base match query for dependent filters
    const baseMatch: any = {};
    if (manufacturer) baseMatch.manufacturer = manufacturer;
    if (model) baseMatch.model = model;
    if (versionsParam && versionsParam.length > 0) {
      baseMatch.version = { $in: versionsParam };
    }
    
    const [
      manufacturers,
      models,
      versions,
      years,
    ] = await Promise.all([
      // Always get all manufacturers
      getDistinctValues(collection, 'manufacturer', {}),
      // Get models only if a manufacturer is selected
      manufacturer ? getDistinctValues(collection, 'model', { manufacturer }) : [],
      // Get versions only if a model is selected
      model ? getDistinctValues(collection, 'version', { manufacturer, model }) : [],
      // Get years based on the current selection context
      getDistinctValues(collection, 'year', baseMatch),
    ]);

    const filterOptions: FilterOptions = {
      manufacturers,
      models,
      versions,
      years: years as number[],
    };

    return NextResponse.json(filterOptions);
  } catch (err) {
    console.error('Error in GET /api/filters:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error', details: errorMessage }), { status: 500 });
  }
}
