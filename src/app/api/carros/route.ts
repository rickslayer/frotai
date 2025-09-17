
import { type NextRequest, NextResponse } from 'next/server';
import { MongoClient, WithId, Document } from 'mongodb';
import type { Filters, DashboardData, TopEntity } from '@/types';
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
        if (value && value !== 'all' && (Array.isArray(value) ? value.length > 0 : value !== '')) {
            sortedFilters[key] = Array.isArray(value) ? [...value].sort() : value;
        }
    });
    return JSON.stringify(sortedFilters);
};


// Helper function for a single aggregation
const aggregateData = async (collection: import('mongodb').Collection, pipeline: Document[]) => {
    return collection.aggregate(pipeline, { maxTimeMS: 20000 }).toArray(); // 20 second timeout
};

const findTopEntity = async (
    collection: import('mongodb').Collection,
    query: any,
    field: string
): Promise<TopEntity | null> => {
    try {
        const pipeline = [
          {
            $match: {
              ...query,
              [field]: { $ne: null, $ne: "" }
            }
          },
          { $group: { _id: `$${field}`, total: { $sum: '$quantity' } } },
          { $sort: { total: -1 } },
          { $limit: 1 }
        ];

        const topResult = await aggregateData(collection, pipeline);

        if (topResult.length > 0 && topResult[0]._id) {
            return { name: topResult[0]._id, quantity: topResult[0].total };
        }
        return null;
    } catch (err) {
        console.error(`Error finding top entity for field "${field}":`, err);
        return null; // Return null on error to not break the entire response
    }
}


export async function GET(request: NextRequest) {
  try {
    const db = await connectToMongo();
    const collection = db.collection(collectionName);
    const { searchParams } = request.nextUrl;

    const filters: Partial<Filters> = {};
    for (const [key, value] of searchParams.entries()) {
      if (value && value !== 'all') {
        const filterKey = key as keyof Filters;
        if (filterKey === 'model' || filterKey === 'version') {
           if (!filters[filterKey]) {
             (filters[filterKey] as string[]) = [];
           }
           (filters[filterKey] as string[]).push(value);
        } else if (filterKey === 'year') {
            filters.year = parseInt(value, 10);
        } else {
           (filters as any)[filterKey] = value;
        }
      }
    }
    
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

        if (Array.isArray(filterValue) && filterValue.length > 0) {
            query[filterKey] = { $in: filterValue };
        } else if (typeof filterValue === 'string' && filterValue !== '') {
            query[key] = filterValue;
        } else if (typeof filterValue === 'number') {
            query[key] = filterValue;
        }
    }
    
    const currentYear = new Date().getFullYear();
    const matchStage = { $match: query };

    // Run all aggregations in parallel
    const [
        totalVehiclesResult,
        topModel,
        topManufacturer,
        topRegion,
        topState,
        topCity,
        regionalData,
        topModelsChart,
        fleetByYearChart,
        fleetAgeBrackets,
    ] = await Promise.all([
        aggregateData(collection, [matchStage, { $group: { _id: null, total: { $sum: '$quantity' } } }]).catch(() => [{ total: 0 }]),
        aggregateData(collection, [matchStage, { $group: { _id: '$fullName', total: { $sum: '$quantity' } } }, { $sort: { total: -1 } }, { $limit: 1 }]).catch(() => [null]),
        findTopEntity(collection, query, 'manufacturer'),
        findTopEntity(collection, query, 'region'),
        findTopEntity(collection, query, 'state'),
        findTopEntity(collection, query, 'city'),
        aggregateData(collection, [matchStage, { $group: { _id: '$region', total: { $sum: '$quantity' } } }]).catch(() => []),
        aggregateData(collection, [matchStage, { $group: { _id: '$fullName', total: { $sum: '$quantity' } } }, { $sort: { total: -1 } }, { $limit: 10 }]).catch(() => []),
        aggregateData(collection, [matchStage, { $group: { _id: '$year', total: { $sum: '$quantity' } } }, { $sort: { _id: 1 } }]).catch(() => []),
        aggregateData(collection, [
            { $match: { ...query, year: { $ne: 0 } } },
            { $project: { quantity: '$quantity', age: { $subtract: [currentYear, '$year'] } } },
            {
              $bucket: {
                groupBy: '$age',
                boundaries: [0, 4, 8, 13, Infinity],
                default: 'old',
                output: { total: { $sum: '$quantity' } }
              }
            },
        ]).catch(() => []),
    ]);
    
    const totalVehicles = totalVehiclesResult[0]?.total || 0;

    const dashboardData: DashboardData = {
        totalVehicles,
        topModel: { name: topModel[0]?._id || '-', quantity: topModel[0]?.total || 0 },
        topManufacturer,
        topRegion,
        topState,
        topCity,
        regionalData: allRegions.map(region => {
            const found = regionalData.find((r: any) => r._id === region);
            return { name: region, quantity: found?.total || 0 };
        }),
        topModelsChart: topModelsChart.map((d: any) => ({ model: d._id, quantity: d.total })),
        fleetByYearChart: fleetByYearChart.map((d: any) => ({ year: d._id, quantity: d.total })).filter(d => d.year !== 0),
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
