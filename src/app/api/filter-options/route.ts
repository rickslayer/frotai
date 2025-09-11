// src/app/api/filter-options/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getVehicles } from '@/lib/api-logic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: Record<string, any> = {};
    searchParams.forEach((value, key) => {
        filters[key] = value;
    });

    const data = await getVehicles(filters);

    const states = [...new Set(data.map((item: { state: any; }) => item.state))].sort();
    const cities = [...new Set(data.map((item: { city: any; }) => item.city))].sort();
    const manufacturers = [...new Set(data.map((item: { manufacturer: any; }) => item.manufacturer))].sort();
    const models = [...new Set(data.map((item: { model: any; }) => item.model))].sort();
    const versions = [...new Set(data.map((item: { version: any; }) => item.version || 'base'))].sort();
    const years = [...new Set(data.map((item: { year: any; }) => item.year))].sort((a, b) => b - a);

    return NextResponse.json({ states, cities, manufacturers, models, versions, years });
  } catch (error) {
    console.error("API GET filter-options Error:", error);
    return NextResponse.json({ error: 'Failed to fetch filter options' }, { status: 500 });
  }
}
