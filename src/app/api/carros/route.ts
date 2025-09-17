
import { type NextRequest, NextResponse } from 'next/server';
import { MongoClient, WithId, Document } from 'mongodb';
import type { Filters, DashboardData, TopEntity, RegionData, TopModel, FleetByYear, FleetAgeBracket } from '@/types';
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
    const filterKeys = Object.keys(filters).sort() as (keyof Filters)[];

    filterKeys.forEach(key => {
        const value = filters[key];
        if (value && (Array.isArray(value) ? value.length > 0 : value !== '')) {
            sortedFilters[key] = Array.isArray(value) ? [...value].sort() : value;
        }
    });
    return JSON.stringify(sortedFilters);
};

// Helper function for a single aggregation
const aggregateData = async (collection: import('mongodb').Collection, matchQuery: any, groupStage: any, sortStage?: any, limit?: number) => {
    const pipeline: Document[] = [{ $match: matchQuery }];
    pipeline.push(groupStage);
    if (sortStage) pipeline.push(sortStage);
    if (limit) pipeline.push({ $limit: limit });
    return collection.aggregate(pipeline).toArray();
};

export async function GET(request: NextRequest) {
  try {
    const db = await connectToMongo();
    const collection = db.collection(collectionName);
    const { searchParams } = request.nextUrl;

    const filters: Partial<Filters> = {};
    searchParams.forEach((value, key) => {
        const filterKey = key as keyof Filters;
        if (filterKey === 'year' && value) {
            filters.year = parseInt(value, 10);
        } else if (filterKey === 'version' && value) {
            if (!filters.version) filters.version = [];
            filters.version.push(value);
        } else if (value && filterKey !== 'year' && filterKey !== 'version') {
            (filters as any)[filterKey] = value;
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
    for (const key in filters) {
        const filterKey = key as keyof Filters;
        const filterValue = filters[filterKey];

        if (filterValue && (Array.isArray(filterValue) ? filterValue.length > 0 : filterValue !== '')) {
            if (filterKey === 'version' && Array.isArray(filterValue) && filterValue.length > 0) {
                 query.version = { $in: filterValue };
            } else if (filterKey !== 'version') {
                query[key] = filterValue;
            }
        }
    }
    
    const currentYear = new Date().getFullYear();

    // Run aggregations in parallel
    const [
        totalVehicles,
        topModel,
        topManufacturer,
        regionalData,
        topModelsChart,
        fleetByYearChart,
        fleetAgeBrackets,
    ] = await Promise.all([
        // Total Vehicles
        collection.countDocuments(query),
        // Top Model
        aggregateData(collection, query, { $group: { _id: '$fullName', total: { $sum: '$quantity' } } }, { $sort: { total: -1 } }, 1),
        // Top Manufacturer
        aggregateData(collection, query, { $group: { _id: '$manufacturer', total: { $sum: '$quantity' } } }, { $sort: { total: -1 } }, 1),
        // Regional Data
        aggregateData(collection, query, { $group: { _id: '$region', total: { $sum: '$quantity' } } }),
        // Top Models Chart
        aggregateData(collection, query, { $group: { _id: '$fullName', total: { $sum: '$quantity' } } }, { $sort: { total: -1 } }, 10),
        // Fleet by Year Chart
        aggregateData(collection, query, { $group: { _id: '$year', total: { $sum: '$quantity' } } }, { $sort: { _id: 1 } }),
        // Fleet Age Brackets
        collection.aggregate([
            { $match: query },
            { $project: { quantity: '$quantity', age: { $subtract: [currentYear, '$year'] } } },
            {
              $bucket: {
                groupBy: '$age',
                boundaries: [0, 4, 8, 13, Infinity],
                default: 'old',
                output: { total: { $sum: '$quantity' } }
              }
            },
        ]).toArray(),
    ]);

    const dashboardData: DashboardData = {
        totalVehicles: totalVehicles || 0,
        topModel: { name: topModel[0]?._id || '-', quantity: topModel[0]?.total || 0 },
        topManufacturer: topManufacturer[0] ? { name: topManufacturer[0]._id, quantity: topManufacturer[0].total } : null,
        regionalData: allRegions.map(region => {
            const found = regionalData.find((r: any) => r._id === region);
            return { name: region, quantity: found?.total || 0 };
        }),
        topModelsChart: topModelsChart.map((d: any) => ({ model: d._id, quantity: d.total })),
        fleetByYearChart: fleetByYearChart.map((d: any) => ({ year: d.year, quantity: d.total })),
        fleetAgeBrackets: fleetAgeBrackets.map((b: any) => {
            const rangeMap: Record<number, string> = { 0: '0-3', 4: '4-7', 8: '8-12', 13: '13+' };
            return {
                range: rangeMap[b._id as number] || '13+',
                quantity: b.total,
            }
        }),
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
