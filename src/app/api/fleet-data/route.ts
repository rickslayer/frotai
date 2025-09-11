
import { NextRequest, NextResponse } from 'next/server';
import { getFleetData } from '@/lib/api-logic';
import type { Filters } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filters: Partial<Filters> = {};

    if (searchParams.has('state')) filters.state = searchParams.get('state')!;
    if (searchParams.has('city')) filters.city = searchParams.get('city')!;
    if (searchParams.has('manufacturer')) filters.manufacturer = searchParams.get('manufacturer')!;
    if (searchParams.has('model')) filters.model = searchParams.get('model')!;
    if (searchParams.has('version')) filters.version = searchParams.get('version')!.split(',');
    if (searchParams.has('year')) {
        const year = searchParams.get('year')!;
        filters.year = year === 'all' ? 'all' : parseInt(year, 10);
    }
    
    const data = await getFleetData(filters);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/fleet-data:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
