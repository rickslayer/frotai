export type Vehicle = {
  id: string;
  manufacturer: string;
  model: string;
  year: number;
  quantity: number;
  state: string;
  city: string;
};

export type FilterOptions = {
  manufacturers: string[];
  models: string[];
  states: string[];
  cities: string[];
  years: number[];
};

export type Filters = {
  state: string;
  city: string;
  manufacturer: string;
  model: string;
  year: number | 'all';
};
