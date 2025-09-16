
import { type NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import type { FilterOptions } from '@/types';

// MongoDB Connection String
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://frotai:X7Ra8kREnBX6z6SC@frotai.bylfte3.mongodb.net/';
const dbName = 'frotai';
const collectionName = 'carros';

let client: MongoClient | null = null;

// Function to connect to MongoDB, reusing the client connection
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
    client = null; // Reset client on connection failure
    throw new Error('Failed to connect to the database.');
  }
}

// Helper function to get distinct, sorted, non-empty values for a field
const getDistinctValues = async (collection: import('mongodb').Collection, field: string, match: any = {}) => {
  const values = await collection.distinct(field, { ...match, [field]: { $ne: null, $ne: "" } });
  return values.sort();
};


export async function GET(request: NextRequest) {
  try {
    const db = await connectToMongo();
    const collection = db.collection(collectionName);
    const { searchParams } = request.nextUrl;

    const manufacturer = searchParams.get('manufacturer');
    const model = searchParams.get('model');
    
    // For cascading filters: if a manufacturer is selected, only show its models.
    const modelMatch = manufacturer && manufacturer !== 'all' ? { manufacturer } : {};
    
    // If a model is selected, only show its versions.
    const versionMatch = model && model !== 'all' ? { model } : (manufacturer && manufacturer !== 'all' ? { manufacturer } : {});

    // Parallelize distinct queries
    const [
      manufacturers,
      models,
      versions,
      states,
      cities,
      years
    ] = await Promise.all([
      getDistinctValues(collection, 'manufacturer'),
      getDistinctValues(collection, 'model', modelMatch),
      getDistinctValues(collection, 'version', versionMatch),
      getDistinctValues(collection, 'state'),
      getDistinctValues(collection, 'city'), // Note: might be slow, consider limiting by state if one is passed
      getDistinctValues(collection, 'year')
    ]);

    const filterOptions: FilterOptions = {
      regions: [], // This is static, so not fetched here
      manufacturers,
      models,
      versions,
      states,
      cities,
      years: (years as number[]).sort((a, b) => b - a),
    };

    return NextResponse.json(filterOptions);
  } catch (err) {
    console.error('Error in GET /api/filters:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error', details: errorMessage }), { status: 500 });
  }
}
