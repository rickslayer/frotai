
import { type NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import type { FilterOptions } from '@/types';

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://frotai:X7Ra8kREnBX6z6SC@frotai.bylfte3.mongodb.net/';
const dbName = 'frotai';
const collectionName = 'carros';

let client: MongoClient | null = null;

const manufacturerAliases: Record<string, string> = {
    "MMC": "Mitsubishi"
};


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

// Helper to build the match object, excluding certain fields
const buildMatchExcept = (baseMatch: any, exclude: string[]) => {
    const match: any = {};
    for (const key in baseMatch) {
        if (!exclude.includes(key)) {
            match[key] = baseMatch[key];
        }
    }
    return match;
};

const getDistinctValues = async (collection: import('mongodb').Collection, field: string, match: any = {}) => {
  const query: any = { ...match };
  
  if (field !== 'year') {
    query[field] = { $ne: null, $ne: "" };
  } else {
    // Allows year 0 to be included if it exists for the selection
    query[field] = { $ne: null };
  }
  
  let values = await collection.distinct(field, query);

  // Handle manufacturer aliases: Replace aliases with the primary name and remove duplicates
  if (field === 'manufacturer') {
    const primaryNamesToKeep = new Set<string>();
    const aliasesToMap: Record<string, string> = {};
    for (const alias in manufacturerAliases) {
        aliasesToMap[alias] = manufacturerAliases[alias];
    }
    
    values.forEach(val => {
        const primaryName = aliasesToMap[val];
        if (primaryName) {
            primaryNamesToKeep.add(primaryName);
        } else {
            primaryNamesToKeep.add(val);
        }
    });

    values = Array.from(primaryNamesToKeep);
  }

  if (field === 'year') {
    // Sort years descending, keeping 0 if it exists
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
    const modelsParam = searchParams.getAll('model');
    const versionsParam = searchParams.getAll('version');
    const year = searchParams.get('year');
    const region = searchParams.get('region');
    const state = searchParams.get('state');
    const city = searchParams.get('city');
    
    // Base match query with ALL active filters
    const baseMatch: any = {};
    if (manufacturer) {
        const allNames = Array.from(new Set([manufacturer, ...(Object.keys(manufacturerAliases).filter(key => manufacturerAliases[key] === manufacturer)), ...((Object.entries(manufacturerAliases).find(([,v]) => v === manufacturer) || [])[0] ? [(Object.entries(manufacturerAliases).find(([,v]) => v === manufacturer) || [])[0]] : []) ]));
        const finalNames = Array.from(new Set(allNames.flat()));
        baseMatch.manufacturer = { $in: finalNames };
    }
    if (modelsParam && modelsParam.length > 0) baseMatch.model = { $in: modelsParam };
    if (versionsParam && versionsParam.length > 0) baseMatch.version = { $in: versionsParam };
    if (year) baseMatch.year = parseInt(year);
    if (region) baseMatch.region = region;
    if (state) baseMatch.state = state;
    if (city) baseMatch.city = city;
    
    // Each field's options should be filtered by all OTHER active filters
    const [
      manufacturers,
      models,
      versions,
      years,
      regions,
      states,
      cities,
    ] = await Promise.all([
      getDistinctValues(collection, 'manufacturer', buildMatchExcept(baseMatch, ['manufacturer'])),
      getDistinctValues(collection, 'model', buildMatchExcept(baseMatch, ['model', 'version'])),
      getDistinctValues(collection, 'version', buildMatchExcept(baseMatch, ['version'])),
      getDistinctValues(collection, 'year', buildMatchExcept(baseMatch, ['year'])),
      getDistinctValues(collection, 'region', buildMatchExcept(baseMatch, ['region', 'state', 'city'])),
      getDistinctValues(collection, 'state', buildMatchExcept(baseMatch, ['state', 'city'])),
      getDistinctValues(collection, 'city', buildMatchExcept(baseMatch, ['city'])),
    ]);

    const filterOptions: FilterOptions = {
      manufacturers,
      models,
      versions,
      years: years as number[],
      regions,
      states,
      cities,
    };

    return NextResponse.json(filterOptions);
  } catch (err) {
    console.error('Error in GET /api/filters:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error', details: errorMessage }), { status: 500 });
  }
}
