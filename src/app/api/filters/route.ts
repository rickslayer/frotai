
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

// This function now uses a single aggregation pipeline to fetch all distinct values, which is more performant.
const getAllDistinctValues = async (collection: import('mongodb').Collection, baseMatch: any) => {
    const pipeline: Document[] = [
        {
            $facet: {
                manufacturers: [{ $match: buildMatchExcept(baseMatch, ['manufacturer']) }, { $group: { _id: '$manufacturer' } }],
                models: [{ $match: buildMatchExcept(baseMatch, ['model', 'version']) }, { $group: { _id: '$model' } }],
                versions: [{ $match: buildMatchExcept(baseMatch, ['version']) }, { $group: { _id: '$version' } }],
                years: [{ $match: buildMatchExcept(baseMatch, ['year']) }, { $group: { _id: '$year' } }],
                regions: [{ $match: buildMatchExcept(baseMatch, ['region', 'state', 'city']) }, { $group: { _id: '$region' } }],
                states: [{ $match: buildMatchExcept(baseMatch, ['state', 'city']) }, { $group: { _id: '$state' } }],
                cities: [{ $match: buildMatchExcept(baseMatch, ['city']) }, { $group: { _id: '$city' } }],
            },
        },
    ];

    const results = await collection.aggregate(pipeline).toArray();
    const data = results[0];

    // Helper to process and sort the results from the facet stage
    const processFacet = (facetResult: { _id: any }[], field: string) => {
        let values = facetResult.map(item => item._id).filter(item => item !== null && item !== "");

        if (field === 'manufacturer') {
            const primaryNames = new Set<string>();
            values.forEach(val => {
                if (typeof val === 'string' && val.startsWith('MMC')) {
                    primaryNames.add('Mitsubishi');
                } else if (val) {
                    primaryNames.add(val);
                }
            });
            values = Array.from(primaryNames);
        }
        
        if (field === 'year') {
             return (values as number[]).sort((a, b) => b - a);
        }
        
        return values.sort();
    };

    return {
        manufacturers: processFacet(data.manufacturers, 'manufacturer'),
        models: processFacet(data.models, 'model'),
        versions: processFacet(data.versions, 'version'),
        years: processFacet(data.years, 'year') as number[],
        regions: processFacet(data.regions, 'region'),
        states: processFacet(data.states, 'state'),
        cities: processFacet(data.cities, 'city'),
    };
};


export async function POST(request: NextRequest) {
  try {
    const db = await connectToMongo();
    const collection = db.collection(collectionName);
    const body = await request.json();

    const manufacturer = body.manufacturer;
    const modelsParam = body.model;
    const versionsParam = body.version;
    const year = body.year;
    const region = body.region;
    const state = body.state;
    const city = body.city;
    
    // Base match query with ALL active filters
    const baseMatch: any = {};
    if (manufacturer) {
        if (manufacturer === 'Mitsubishi') {
            baseMatch.manufacturer = { $in: [/^Mitsubishi/i, /^MMC/i] };
        } else {
            baseMatch.manufacturer = manufacturer;
        }
    }
    if (modelsParam && modelsParam.length > 0) baseMatch.model = { $in: modelsParam };
    if (versionsParam && versionsParam.length > 0) baseMatch.version = { $in: versionsParam };
    if (year) baseMatch.year = parseInt(String(year));
    if (region) baseMatch.region = region;
    if (state) baseMatch.state = state;
    if (city) baseMatch.city = city;
    
    // Fetch all distinct values in a single, more efficient aggregation
    const filterOptions = await getAllDistinctValues(collection, baseMatch);

    return NextResponse.json(filterOptions);
  } catch (err) {
    console.error('Error in POST /api/filters:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error', details: errorMessage }), { status: 500 });
  }
}
