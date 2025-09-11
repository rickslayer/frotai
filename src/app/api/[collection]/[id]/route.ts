// src/app/api/[collection]/[id]/route.ts
import { NextResponse } from 'next/server';
import { dbConnect, getModel } from '@/lib/mongodb';

export async function GET(
  request: Request,
  { params }: { params: { collection: string; id: string } }
) {
  try {
    await dbConnect();
    const Model = getModel(params.collection);
    const data = await Model.findById(params.id);
    if (!data) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { collection: string; id: string } }
) {
  try {
    const body = await request.json();
    await dbConnect();
    const Model = getModel(params.collection);
    const updatedData = await Model.findByIdAndUpdate(params.id, body, { new: true });
    if (!updatedData) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    return NextResponse.json(updatedData);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { collection: string; id: string } }
) {
  try {
    await dbConnect();
    const Model = getModel(params.collection);
    const deletedData = await Model.findByIdAndDelete(params.id);
    if (!deletedData) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
