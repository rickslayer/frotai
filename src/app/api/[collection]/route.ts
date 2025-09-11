// src/app/api/[collection]/route.ts
import { NextResponse } from 'next/server';
import { dbConnect, getModel } from '@/lib/mongodb';

export async function GET(
  request: Request,
  { params }: { params: { collection: string } }
) {
  try {
    await dbConnect();
    const Model = getModel(params.collection);
    const data = await Model.find({});
    return NextResponse.json(data);
  } catch (error) {
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
