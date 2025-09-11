
// src/app/api/[collection]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { dbConnect, getModel } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { collection: string } }
) {
  try {
    await dbConnect();
    const Model = getModel(params.collection);
    
    const { searchParams } = new URL(request.url);
    const query: Record<string, any> = {};

    searchParams.forEach((value, key) => {
        if (value && value !== 'all') {
            if (key === 'version') {
                // Handle comma-separated versions
                query[key] = { $in: value.split(',') };
            } else if (key === 'year' && !isNaN(Number(value))) {
                query[key] = Number(value);
            }
             else {
                query[key] = value;
            }
        }
    });
    
    const data = await Model.find(query);
    return NextResponse.json(data);
  } catch (error) {
    console.error("API GET Error:", error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { collection: string } }
) {
  try {
    const body = await request.json();
    await dbConnect();
    const Model = getModel(params.collection);
    const newData = new Model(body);
    await newData.save();
    return NextResponse.json(newData, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}
