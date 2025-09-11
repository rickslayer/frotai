// src/app/api/filter-options/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { dbConnect, getModel } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      if (value && value !== 'all') {
        if (key === 'version') {
          filters[key] = { $in: value.split(',') };
        } else if (key === 'year') {
           filters[key] = Number(value);
        }
        else {
          filters[key] = value;
        }
      }
    });

    await dbConnect();
    const Model = getModel('vehicles');

    // Build the query dynamically based on the provided filters
    const query: Record<string, any> = {};
    if (filters.state) query.state = filters.state;
    if (filters.city) query.city = filters.city;
    if (filters.manufacturer) query.manufacturer = filters.manufacturer;
    if (filters.model) query.model = filters.model;
    if (filters.version) query.version = filters.version;
    if (filters.year) query.year = filters.year;

    // Fetch distinct values for each filter field based on the current query
    // Always show all states
    const states = await Model.distinct('state', {}); 
    const cities = await Model.distinct('city', { ...(filters.state && { state: filters.state }) });
    const manufacturers = await Model.distinct('manufacturer', { ...(filters.state && { state: filters.state }), ...(filters.city && { city: filters.city }) });
    const models = await Model.distinct('model', { ...(filters.state && { state: filters.state }), ...(filters.city && { city: filters.city }), ...(filters.manufacturer && { manufacturer: filters.manufacturer }) });
    const versions = await Model.distinct('version', { ...(filters.state && { state: filters.state }), ...(filters.city && { city: filters.city }), ...(filters.manufacturer && { manufacturer: filters.manufacturer }), ...(filters.model && { model: filters.model }) });
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

    