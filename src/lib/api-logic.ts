
import { dbConnect, getModel } from '@/lib/mongodb';
import type { Filters } from '@/types';

export async function getVehicles(filters: Partial<Filters>) {
    await dbConnect();
    const Model = getModel('vehicles');

    const query: Record<string, any> = {};

    Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
            if (key === 'state' && value) {
                query[key] = value;
            }
            if (key === 'version' && typeof value === 'string') {
                query[key] = { $in: value.split(',') };
            } else if (key === 'version' && Array.isArray(value) && value.length > 0) {
                 query[key] = { $in: value };
            } else if (key === 'year' && !isNaN(Number(value))) {
                query[key] = Number(value);
            } else if (key !== 'version' && key !== 'state') { // prevent empty version array from becoming a query
                query[key] = value;
            }
        }
    });
    
    const data = await Model.find(query);
    return JSON.parse(JSON.stringify(data)); // Serialize data to plain JSON
}
