
import { type NextRequest, NextResponse } from 'next/server';
import { MongoClient, WithId, Document } from 'mongodb';
import { Filters, DashboardData } from '@/types';
import { allRegions } from '@/lib/regions';

// MongoDB Connection String
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://frotai:X7Ra8kREnBX6z6SC@frotai.bylfte3.mongodb.net/';
const dbName = 'frotai';
const collectionName = 'carros';
const cacheCollectionName = 'api_cache';

let client: MongoClient | null = null;
let db: import('mongodb').Db;

// Function to connect to MongoDB, reusing the client connection
async function connectToMongo() {
  if (client && client.topology && client.topology.isConnected()) {
    return client.db(dbName);
  }
  try {
    client = new MongoClient(mongoUri);
    await client.connect();
    console.log('Connected successfully to MongoDB from API Route');
    db = client.db(dbName);
    return db;
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    client = null; // Reset client on connection failure
    throw new Error('Failed to connect to the database.');
  }
}

// Generates a consistent key from filter parameters.
const generateCacheKey = (filters: Partial<Filters>): string => {
    const sortedFilters: any = {};
    Object.keys(filters).sort().forEach(key => {
        const filterKey = key as keyof Filters;
        const value = filters[filterKey];
        if (value && (Array.isArray(value) ? value.length > 0 : value !== '' && value !== 'all')) {
            sortedFilters[filterKey] = Array.isArray(value) ? [...value].sort() : value;
        }
    });
    return JSON.stringify(sortedFilters);
};

// API Endpoint: GET /api/carros
export async function GET(request: NextRequest) {
  try {
    const db = await connectToMongo();
    const { searchParams } = request.nextUrl;

    const filters: Partial<Filters> = {};
    searchParams.forEach((value, key) => {
        const existing = filters[key as keyof Filters];
        if (existing) {
            if(Array.isArray(existing)) {
                (existing as string[]).push(value);
            } else {
                (filters as any)[key] = [existing, value];
            }
        } else {
            if (key === 'year') {
                (filters as any)[key] = value === 'all' ? 'all' : parseInt(value, 10);
            } else if (key === 'version') {
                 (filters as any)[key] = [value];
            }
            else {
                (filters as any)[key] = value;
            }
        }
    });
    
    // Generate a cache key from the filters
    const cacheKey = generateCacheKey(filters);
    const cacheCollection = db.collection(cacheCollectionName);

    // 1. Try to find the result in the cache first
    const cachedResult = await cacheCollection.findOne({ _id: cacheKey });
    if (cachedResult) {
      console.log(`Cache HIT for key: ${cacheKey}`);
      return NextResponse.json(cachedResult.data);
    }
    
    console.log(`Cache MISS for key: ${cacheKey}. Running aggregation.`);


    // 2. If not in cache, run the aggregation pipeline
    const query: any = {};
    if (filters.region && filters.region !== 'all') query.region = filters.region.toUpperCase();
    if (filters.state && filters.state !== 'all') query.state = filters.state;
    if (filters.city && filters.city !== 'all') query.city = filters.city;
    if (filters.manufacturer && filters.manufacturer !== 'all') query.manufacturer = filters.manufacturer;
    if (filters.model && filters.model !== 'all') query.model = filters.model;
    if (filters.year && filters.year !== 'all') query.year = filters.year;
    if (filters.version && Array.isArray(filters.version) && filters.version.length > 0) {
        query.version = { $in: filters.version };
    }


    const currentYear = new Date().getFullYear();

    const aggregationPipeline: Document[] = [
      { $match: query },
      {
        $facet: {
          // Total vehicles
          totalVehicles: [
            { $group: { _id: null, total: { $sum: '$quantity' } } }
          ],
          // Top city
          topCity: [
            { $group: { _id: '$city', total: { $sum: '$quantity' } } },
            { $sort: { total: -1 } },
            { $limit: 1 },
            { $project: { name: '$_id', quantity: '$total' } }
          ],
          // Top model (using fullName)
          topModel: [
            { $group: { _id: '$fullName', total: { $sum: '$quantity' } } },
            { $sort: { total: -1 } },
            { $limit: 1 },
            { $project: { name: '$_id', quantity: '$total' } }
          ],
           // Top manufacturer in state (only if state is filtered)
          ...(filters.state && filters.state !== 'all' ? {
              topStateManufacturer: [
                  { $match: { state: filters.state } },
                  { $group: { _id: '$manufacturer', total: { $sum: '$quantity' } } },
                  { $sort: { total: -1 } },
                  { $limit: 1 },
                  { $project: { name: '$_id', quantity: '$total' } }
              ]
          } : {}),
          // Regional data
          regionalData: [
            { $group: { _id: '$region', total: { $sum: '$quantity' } } },
            { $project: { name: '$_id', quantity: '$total' } }
          ],
           // Top models for chart
          topModelsChart: [
            { $group: { _id: '$fullName', total: { $sum: '$quantity' } } },
            { $sort: { total: -1 } },
            { $limit: 10 },
            { $project: { model: '$_id', quantity: '$total' } }
          ],
          // Fleet by year data for chart
          fleetByYearChart: [
            { $group: { _id: '$year', total: { $sum: '$quantity' } } },
            { $sort: { _id: 1 } },
            { $project: { year: '$_id', quantity: '$total' } }
          ],
          // Fleet age brackets data for chart
          fleetAgeBrackets: [
            {
              $project: {
                quantity: '$quantity',
                age: { $subtract: [currentYear, '$year'] }
              }
            },
            {
              $bucket: {
                groupBy: '$age',
                boundaries: [0, 4, 8, 13, Infinity],
                default: 'old',
                output: {
                  total: { $sum: '$quantity' }
                }
              }
            },
            {
              $project: {
                range: {
                  $switch: {
                    branches: [
                      { case: { $eq: ['$_id', 0] }, then: '0-3' },
                      { case: { $eq: ['$_id', 4] }, then: '4-7' },
                      { case: { $eq: ['$_id', 8] }, then: '8-12' },
                      { case: { $eq: ['$_id', 13] }, then: '13+' },
                    ],
                    default: '13+'
                  }
                },
                quantity: '$total'
              }
            }
          ]
        }
      }
    ];

    const result = await db.collection(collectionName).aggregate(aggregationPipeline).toArray();
    
    // 3. Process the aggregation result and save it to the cache
    const aggregatedData = result[0];
    
    const dashboardData: DashboardData = {
        totalVehicles: aggregatedData.totalVehicles[0]?.total || 0,
        topCity: aggregatedData.topCity[0] || { name: '-', quantity: 0 },
        topModel: aggregatedData.topModel[0] || { name: '-', quantity: 0 },
        topStateManufacturer: aggregatedData.topStateManufacturer?.[0] || null,
        regionalData: allRegions.map(region => {
            const found = aggregatedData.regionalData.find((r: any) => r.name === region);
            return { name: region, quantity: found?.quantity || 0 };
        }),
        topModelsChart: aggregatedData.topModelsChart,
        fleetByYearChart: aggregatedData.fleetByYearChart,
        fleetAgeBrackets: aggregatedData.fleetAgeBrackets.map((b: any) => ({...b, label: ''})), // Label is set on client
    };
    
    // Save to cache
    await cacheCollection.updateOne(
      { _id: cacheKey },
      { $set: { data: dashboardData, createdAt: new Date() } },
      { upsert: true }
    );

    console.log(`Aggregation complete. Result cached for key: ${cacheKey}`);

    return NextResponse.json(dashboardData);

  } catch (err) {
    console.error('Error in GET /api/carros:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error', details: errorMessage }), { status: 500 });
  }
}

    