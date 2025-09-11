
import { NextRequest, NextResponse } from 'next/server';
import { getFilterOptions } from '@/lib/api-logic';
import type { Filters } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filters: Partial<Filters> = {};
    
    if (searchParams.has('state')) filters.state = searchParams.get('state')!;
    if (searchParams.has('manufacturer')) filters.manufacturer = searchParams.get('manufacturer')!;
    if (search_params.has('model')) filters.model = searchParams.get('model')!;

    const options = await getFilterOptions(filters);
    return NextResponse.json(options);
  } catch (error) {
    console.error('Error in /api/filter-options:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
