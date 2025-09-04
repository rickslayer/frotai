export type Sale = {
  id: string;
  manufacturer: string;
  model: string;
  version: string;
  category: 'Sedan' | 'SUV' | 'Hatchback' | 'Pickup' | 'Van' | 'Truck';
  state: string;
  city: string;
  quantity: number;
  date: string; // YYYY-MM-DD
};

export type FilterOptions = {
  manufacturers: string[];
  models: string[];
  versions: string[];
  states: string[];
  cities: string[];
  categories: string[];
};

export type Filters = {
  state: string;
  city: string;
  manufacturer: string;
  model: string;
  version: string;
  category: string;
  dateRange: { from: Date | undefined; to: Date | undefined };
};
