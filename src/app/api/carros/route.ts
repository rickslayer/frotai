
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
const aggregateData = async (collection: import('mongodb').Collection, pipeline: Document[]) => {
    return collection.aggregate(pipeline).toArray();
};

const findTopLocation = async (collection: import('mongodb').Collection, matchStage: any): Promise<TopEntity | null> => {
    // 1. Try to find by City and State (most specific)
    const topCityState = await aggregateData(collection, [
      { $match: { ...matchStage.$match, city: { $ne: null, $ne: "" }, state: { $ne: null, $ne: "" } } },
      { $group: { _id: { city: '$city', state: '$state' }, total: { $sum: '$quantity' } } },
      { $sort: { total: -1 } },
      { $limit: 1 }
    ]);

    if (topCityState.length > 0 && topCityState[0]._id.city && topCityState[0]._id.state) {
        return { name: `${topCityState[0]._id.city}, ${topCityState[0]._id.state}`, quantity: topCityState[0].total };
    }

    // 2. Fallback to State
    const topState = await aggregateData(collection, [
       matchStage, // Use the original match stage
       { $match: { state: { $ne: null, $ne: "" } } }, // Add a condition to ensure state is not null
       { $group: { _id: '$state', total: { $sum: '$quantity' } } },
       { $sort: { total: -1 } },
       { $limit: 1 }
    ]);

    if (topState.length > 0 && topState[0]._id) {
        return { name: topState[0]._id, quantity: topState[0].total };
    }
    
    // 3. Fallback to Region
    const topRegion = await aggregateData(collection, [
       matchStage, // Use the original match stage
       { $match: { region: { $ne: null, $ne: "" } } }, // Add a condition to ensure region is not null
       { $group: { _id: '$region', total: { $sum: '$quantity' } } },
       { $sort: { total: -1 } },
       { $limit: 1 }
    ]);

    if (topRegion.length > 0 && topRegion[0]._id) {
        return { name: topRegion[0]._id, quantity: topRegion[0].total };
    }

    return null;
}


export async function GET(request: NextRequest) {
  try {
    const db = await connectToMongo();
    const collection = db.collection(collectionName);
    const { searchParams } = request.nextUrl;

    const filters: Partial<Filters> = {};
    searchParams.forEach((value, key) => {
        const filterKey = key as keyof Filters;
        if (key === 'year' && value && value !== 'all' && Number.isInteger(Number(value))) {
            filters.year = parseInt(value, 10);
        } else if (key === 'version' && value) {
            if (!filters.version) filters.version = [];
            filters.version.push(value);
        } else if (value && value !== 'all' && !['year', 'version'].includes(key)) {
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
            } else if (filterKey === 'year' && (filterValue === 0 || filterValue)) {
                query.year = filterValue;
            }
            else if (filterKey !== 'version' && filterKey !== 'year') {
                query[key] = filterValue;
            }
        }
    }
    
    const currentYear = new Date().getFullYear();
    const matchStage = { $match: query };

    const topLocation = await findTopLocation(collection, matchStage);

    // Run other aggregations in parallel
    const [
        totalVehiclesResult,
        topModel,
        topManufacturer,
        regionalData,
        topModelsChart,
        fleetByYearChart,
        fleetAgeBrackets,
    ] = await Promise.all([
        aggregateData(collection, [matchStage, { $group: { _id: null, total: { $sum: '$quantity' } } }]),
        aggregateData(collection, [matchStage, { $group: { _id: '$fullName', total: { $sum: '$quantity' } } }, { $sort: { total: -1 } }, { $limit: 1 }]),
        aggregateData(collection, [matchStage, { $group: { _id: '$manufacturer', total: { $sum: '$quantity' } } }, { $sort: { total: -1 } }, { $limit: 1 }]),
        aggregateData(collection, [matchStage, { $group: { _id: '$region', total: { $sum: '$quantity' } } }]),
        aggregateData(collection, [matchStage, { $group: { _id: '$fullName', total: { $sum: '$quantity' } } }, { $sort: { total: -1 } }, { $limit: 10 }]),
        aggregateData(collection, [matchStage, { $group: { _id: '$year', total: { $sum: '$quantity' } } }, { $sort: { _id: 1 } }]),
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
        ]),
    ]);
    
    const totalVehicles = totalVehiclesResult[0]?.total || 0;

    const dashboardData: DashboardData = {
        totalVehicles,
        topModel: { name: topModel[0]?._id || '-', quantity: topModel[0]?.total || 0 },
        topManufacturer: topManufacturer[0] ? { name: topManufacturer[0]._id, quantity: topManufacturer[0].total } : null,
        mainLocation: topLocation,
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
