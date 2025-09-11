
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
            } else if (key === 'city' && value) {
                 query[key] = value;
            } else if (key === 'manufacturer' && value) {
                 query[key] = value;
            } else if (key === 'model' && value) {
                 query[key] = value;
            } else if (key === 'version' && typeof value === 'string') {
                query[key] = { $in: value.split(',') };
            } else if (key === 'version' && Array.isArray(value) && value.length > 0) {
                 query[key] = { $in: value };
            } else if (key === 'year' && !isNaN(Number(value))) {
                query[key] = Number(value);
            }
        }
    });
    
    // Using lean() for better performance with plain JavaScript objects
    const data = await Model.find(query).lean();
    return JSON.parse(JSON.stringify(data)); // Serialize data
}
