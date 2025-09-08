export type Vehicle = {
  id: string;
  manufacturer: string;
  model: string;
  version: string;
  category: string; // Permitindo qualquer string, já que não temos uma lista fixa.
  state: string;
  city: string;
  quantity: number;
  year: number;
};

export type FilterOptions = {
  manufacturers: string[];
  models: string[];
  versions: string[];
  states: string[];
  cities: string[];
  categories: string[];
  years: number[];
};

export type Filters = {
  state: string;
  city: string;
  manufacturer: string;
  model: string;
  version: string;
  category: string;
  year: number | 'all';
};
