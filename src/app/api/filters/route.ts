
import { type NextRequest, NextResponse } from 'next/server';
import { MongoClient, Document } from 'mongodb';
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

const buildMatchQuery = (body: any) => {
    const { manufacturer, model, version, year, region, state, city } = body;
    const match: any = {};

    if (manufacturer) {
        if (manufacturer === 'Mitsubishi') {
            match.manufacturer = { $in: [/^Mitsubishi/i, /^MMC/i] };
        } else {
            match.manufacturer = manufacturer;
        }
    }
    if (model && model.length > 0) match.model = { $in: model };
    if (version && version.length > 0) match.version = { $in: version };
    if (year) match.year = parseInt(String(year));
    if (region) match.region = region;
    if (state) match.state = state;
    if (city) match.city = city;
    
    return match;
};

const getDistinctValues = async (collection: import('mongodb').Collection, match: any, field: string) => {
    // When fetching options for a field, we don't filter by that field itself.
    const query = { ...match };
    delete query[field];

    // Special cascading logic
    if (field === 'state') delete query.city;
    if (field === 'region') { delete query.state; delete query.city; }
    if (field === 'model') delete query.version;
    if (field === 'manufacturer') { delete query.model; delete query.version; }


    try {
        const pipeline: Document[] = [
            { $match: query },
            { $group: { _id: `$${field}` } },
            { $sort: { _id: 1 } },
        ];
        const results = await collection.aggregate(pipeline, { maxTimeMS: 15000 }).toArray();
        let values = results.map(item => item._id).filter(item => item !== null && item !== "" && item !== 0);

        if (field === 'manufacturer') {
            const primaryNames = new Set<string>();
            values.forEach(val => {
                if (typeof val === 'string' && val.startsWith('MMC')) {
                    primaryNames.add('Mitsubishi');
                } else if (val) {
                    primaryNames.add(val);
                }
            });
            values = Array.from(primaryNames).sort();
        }

        if (field === 'year') {
            return (values as number[]).sort((a, b) => b - a);
        }

        return values;
    } catch (e) {
        console.error(`Error fetching distinct values for ${field}:`, e);
        return []; // Return empty array on error/timeout for this specific field
    }
};


export async function POST(request: NextRequest) {
  try {
    const db = await connectToMongo();
    const collection = db.collection(collectionName);
    const body = await request.json();
    const match = buildMatchQuery(body);

    const [manufacturers, models, versions, years, regions, states, cities] = await Promise.all([
        getDistinctValues(collection, match, 'manufacturer'),
        getDistinctValues(collection, match, 'model'),
        getDistinctValues(collection, match, 'version'),
        getDistinctValues(collection, match, 'year'),
        getDistinctValues(collection, match, 'region'),
        getDistinctValues(collection, match, 'state'),
        getDistinctValues(collection, match, 'city'),
    ]);

    const filterOptions: FilterOptions = {
      manufacturers: manufacturers as string[],
      models: models as string[],
      versions: versions as string[],
      years: years as number[],
      regions: regions as string[],
      states: states as string[],
      cities: cities as string[],
    };

    return NextResponse.json(filterOptions);
  } catch (err) {
    console.error('Error in POST /api/filters:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error', details: errorMessage }), { status: 500 });
  }
}
