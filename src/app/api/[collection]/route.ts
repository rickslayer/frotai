

// src/app/api/[collection]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getVehicles } from '@/lib/api-logic';

export async function GET(
  request: NextRequest,
  { params }: { params: { collection: string } }
) {
    if (params.collection !== 'vehicles') {
        return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

  try {
    const { searchParams } = new URL(request.url);
    const filters: Record<string, any> = {};
    searchParams.forEach((value, key) => {
        filters[key] = value;
    });

    const data = await getVehicles(filters);
    return NextResponse.json(data);
  } catch (error) {
    console.error("API GET Error:", error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
