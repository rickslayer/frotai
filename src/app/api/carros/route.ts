
import { type NextRequest, NextResponse } from 'next/server';
import { MongoClient, WithId, Document } from 'mongodb';
import { Filters, DashboardData } from '@/types';
import { allRegions } from '@/lib/regions';

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://frotai:X7Ra8kREnBX6z6SC@frotai.bylfte3.mongodb.net/';
const dbName = 'frotai';
const collectionName = 'carros';
const cacheCollectionName = 'api_cache';

let client: MongoClient | null = null;
let db: import('mongodb').Db;

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
    client = null; 
    throw new Error('Failed to connect to the database.');
  }
}

const generateCacheKey = (filters: Partial<Filters>): string => {
    const sortedFilters: any = {};
    Object.keys(filters).sort().forEach(key => {
        const filterKey = key as keyof Filters;
        const value = filters[filterKey];
        if (value && (Array.isArray(value) ? value.length > 0 : value !== '')) {
            sortedFilters[filterKey] = Array.isArray(value) ? [...value].sort() : value;
        }
    });
    return JSON.stringify(sortedFilters);
};

export async function GET(request: NextRequest) {
  try {
    const db = await connectToMongo();
    const { searchParams } = request.nextUrl;

    const filters: Partial<Filters> = {};
    searchParams.forEach((value, key) => {
        if (key === 'year') {
            (filters as any)[key] = value === '' ? '' : parseInt(value, 10);
        } else if (key === 'version') {
             if (!filters.version) filters.version = [];
             filters.version.push(value);
        }
        else {
            (filters as any)[key] = value;
        }
    });
    
    const cacheKey = generateCacheKey(filters);
    const cacheCollection = db.collection(cacheCollectionName);

    const cachedResult = await cacheCollection.findOne({ _id: cacheKey });
    if (cachedResult) {
      console.log(`Cache HIT for key: ${cacheKey}`);
      return NextResponse.json(cachedResult.data);
    }
    
    console.log(`Cache MISS for key: ${cacheKey}. Running aggregation.`);

    const query: any = {};
    if (filters.region) query.region = filters.region.toUpperCase();
    if (filters.state) query.state = filters.state;
    if (filters.city) query.city = filters.city;
    if (filters.manufacturer) query.manufacturer = filters.manufacturer;
    if (filters.model) query.model = filters.model;
    if (filters.year) query.year = filters.year;
    if (filters.version && Array.isArray(filters.version) && filters.version.length > 0) {
        query.version = { $in: filters.version };
    }

    const currentYear = new Date().getFullYear();

    const aggregationPipeline: Document[] = [
      { $match: query },
      {
        $facet: {
          totalVehicles: [
            { $group: { _id: null, total: { $sum: '$quantity' } } }
          ],
          topCity: [
            { $group: { _id: '$city', total: { $sum: '$quantity' } } },
            { $sort: { total: -1 } },
            { $limit: 1 },
            { $project: { name: '$_id', quantity: '$total' } }
          ],
          topModel: [
            { $group: { _id: '$fullName', total: { $sum: '$quantity' } } },
            { $sort: { total: -1 } },
            { $limit: 1 },
            { $project: { name: '$_id', quantity: '$total' } }
          ],
          topManufacturer: [
              { $group: { _id: '$manufacturer', total: { $sum: '$quantity' } } },
              { $sort: { total: -1 } },
              { $limit: 1 },
              { $project: { name: '$_id', quantity: '$total' } }
          ],
          regionalData: [
            { $group: { _id: '$region', total: { $sum: '$quantity' } } },
            { $project: { name: '$_id', quantity: '$total' } }
          ],
          topModelsChart: [
            { $group: { _id: '$fullName', total: { $sum: '$quantity' } } },
            { $sort: { total: -1 } },
            { $limit: 10 },
            { $project: { model: '$_id', quantity: '$total' } }
          ],
          fleetByYearChart: [
            { $group: { _id: '$year', total: { $sum: '$quantity' } } },
            { $sort: { _id: 1 } },
            { $project: { year: '$_id', quantity: '$total' } }
          ],
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
    
    const aggregatedData = result[0];
    
    const dashboardData: DashboardData = {
        totalVehicles: aggregatedData.totalVehicles[0]?.total || 0,
        topCity: aggregatedData.topCity[0] || { name: '-', quantity: 0 },
        topModel: aggregatedData.topModel[0] || { name: '-', quantity: 0 },
        topManufacturer: aggregatedData.topManufacturer?.[0] || null,
        regionalData: allRegions.map(region => {
            const found = aggregatedData.regionalData.find((r: any) => r.name === region);
            return { name: region, quantity: found?.quantity || 0 };
        }),
        topModelsChart: aggregatedData.topModelsChart,
        fleetByYearChart: aggregatedData.fleetByYearChart,
        fleetAgeBrackets: aggregatedData.fleetAgeBrackets.map((b: any) => ({...b, label: ''})), // Label is set on client
    };
    
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
