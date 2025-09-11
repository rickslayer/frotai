// src/app/api/filter-options/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { dbConnect, getModel } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    await dbConnect();
    const Model = getModel('carros');

    const query: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      if (value && value !== 'all') {
        if (key === 'version') {
          if (value.includes(',')) {
            query[key] = { $in: value.split(',') };
          } else {
            query[key] = value;
          }
        } else if (key === 'year' && !isNaN(Number(value))) {
           query[key] = Number(value);
        } else {
          query[key] = value;
        }
      }
    });

    const states = await Model.distinct('state', {});
    const cities = await Model.distinct('city', query.state ? { state: query.state } : {});
    const manufacturers = await Model.distinct('manufacturer', query);
    const models = await Model.distinct('model', query);
    const versions = await Model.distinct('version', query);
    const years = await Model.distinct('year', query);

    return NextResponse.json({
      states: states.sort(),
      cities: cities.sort(),
      manufacturers: manufacturers.sort(),
      models: models.sort(),
      versions: (versions || []).sort(),
      years: years.sort((a, b) => b - a),
    });
  } catch (error) {
    console.error("API GET filter-options Error:", error);
    return NextResponse.json({ error: 'Failed to fetch filter options' }, { status: 500 });
  }
}
