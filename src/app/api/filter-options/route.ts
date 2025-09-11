// src/app/api/filter-options/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { dbConnect, getModel } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    await dbConnect();
    const Model = getModel('vehicles');

    // Build the query dynamically based on the provided filters
    const query: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      if (value && value !== 'all') {
        if (key === 'version') {
          query[key] = { $in: value.split(',') };
        } else if (key === 'year') {
           query[key] = Number(value);
        } else {
          query[key] = value;
        }
      }
    });

    // Fetch distinct values for each filter field based on the current query
    const states = await Model.distinct('state'); 
    const cities = await Model.distinct('city', { ...(query.state && { state: query.state }) });
    const manufacturers = await Model.distinct('manufacturer', { ...(query.state && { state: query.state }), ...(query.city && { city: query.city }) });
    const models = await Model.distinct('model', { ...(query.state && { state: query.state }), ...(query.city && { city: query.city }), ...(query.manufacturer && { manufacturer: query.manufacturer }) });
    const versions = await Model.distinct('version', { ...(query.state && { state: query.state }), ...(query.city && { city: query.city }), ...(query.manufacturer && { manufacturer: query.manufacturer }), ...(query.model && { model: query.model }) });
    const years = await Model.distinct('year', query);


    return NextResponse.json({ 
      states: states.sort(), 
      cities: cities.sort(), 
      manufacturers: manufacturers.sort(), 
      models: models.sort(), 
      versions: (versions || []).sort(), 
      years: years.sort((a, b) => b - a) 
    });
  } catch (error) {
    console.error("API GET filter-options Error:", error);
    return NextResponse.json({ error: 'Failed to fetch filter options' }, { status: 500 });
  }
}

    