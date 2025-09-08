import { z } from 'zod';

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

// Schema for data points used in charts
export const ChartDataSchema = z.object({
    year: z.number().describe('The manufacturing year.'),
    quantity: z.number().describe('The total number of vehicles for that year.'),
});
export type ChartData = z.infer<typeof ChartDataSchema>;
