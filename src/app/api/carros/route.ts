
import { type NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// MongoDB Connection String - it's recommended to move this to environment variables
const mongoUri = 'mongodb+srv://frotai:X7Ra8kREnBX6z6SC@frotai.bylfte3.mongodb.net/';
const dbName = 'frotai';
const collectionName = 'carros';

let db;

// Function to connect to MongoDB
async function connectToMongo() {
  if (db) {
    return db;
  }
  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    console.log('Connected successfully to MongoDB from API Route');
    db = client.db(dbName);
    return db;
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    throw new Error('Failed to connect to the database.');
  }
}

// API Endpoint: GET /api/carros
export async function GET(request: NextRequest) {
  try {
    const db = await connectToMongo();
    const { searchParams } = request.nextUrl;

    const query: any = {};
    const region = searchParams.get('region');
    const state = searchParams.get('state');
    const city = searchParams.get('city');
    const manufacturer = searchParams.get('manufacturer');
    const model = searchParams.get('model');
    const year = searchParams.get('year');
    const versions = searchParams.getAll('version');

    if (region && region !== 'all') {
      query.region = region.toUpperCase();
    }
    
    if (state && state !== 'all') {
      query.state = state;
    }
    if (city && city !== 'all') {
      query.city = city;
    }
    if (manufacturer && manufacturer !== 'all') {
      query.manufacturer = manufacturer;
    }
    if (year && year !== 'all') {
      query.year = parseInt(year, 10);
    }
    
    if (model && model !== 'all') {
      query.model = model;
      
      if (versions.length > 0) {
        // If specific versions are selected, they must be in the 'version' field
         query.version = { $in: versions };
      }
    }

    console.log("Executing query on MongoDB:", JSON.stringify(query));
    
    const limit = 10000;
    const carros = await db.collection(collectionName).find(query).limit(limit).toArray();
    
    console.log(`Query returned ${carros.length} documents.`);
    return NextResponse.json(carros);

  } catch (err) {
    console.error('Error in GET /api/carros:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error', details: errorMessage }), { status: 500 });
  }
}
