
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
    const state = searchParams.get('state');
    const city = searchParams.get('city');
    const manufacturer = searchParams.get('manufacturer');
    const model = searchParams.get('model');
    const year = searchParams.get('year');
    const versions = searchParams.getAll('version');

    if (state && state !== 'all') {
      query.UF = state;
    }
    if (city && city !== 'all') {
      query['Município'] = city;
    }
    if (manufacturer && manufacturer !== 'all') {
      query.Marca = manufacturer;
    }
    if (year && year !== 'all') {
      query.Ano = parseInt(year, 10);
    }
    
    // Complex handling for model and version
    if (model && model !== 'all') {
        const modelRegex = new RegExp(`^${model}`, 'i');
        
        if (versions.length > 0) {
            const versionRegexes = versions.map(v => new RegExp(v.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i'));
            query.$and = [
              { 'Modelo': modelRegex },
              { $or: versionRegexes.map(r => ({'Modelo': r})) }
            ];
        } else {
            query['Modelo'] = modelRegex;
        }
    }

    console.log("Executing query on MongoDB:", JSON.stringify(query));
    
    // Using a larger limit as the options are derived from this.
    // A more scalable solution would be to have dedicated aggregation endpoints for filter options.
    const limit = Object.keys(query).length > 0 ? 500 : 10000;
    const carros = await db.collection(collectionName).find(query).limit(limit).toArray();
    
    console.log(`Query returned ${carros.length} documents.`);
    return NextResponse.json(carros);

  } catch (err) {
    console.error('Error in GET /api/carros:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error', details: errorMessage }), { status: 500 });
  }
}
