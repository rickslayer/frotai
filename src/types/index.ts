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

// Type for the data structure representing fleet age distribution
export type FleetAgeBracket = {
  range: string;
  label: string;
  quantity: number;
};

// Types for Part Demand Prediction Flow
const PartPredictionSchema = z.object({
  partName: z.string().describe('The specific name of the auto part with high demand potential (e.g., "Kit de Embreagem", "Pastilhas de Freio Dianteiras").'),
  demandLevel: z.enum(['Alta', 'Média', 'Baixa']).describe('The predicted level of demand for this part.'),
  reason: z.string().describe('A concise explanation for why this part is in demand for the given fleet, mentioning the vehicle age or model characteristics.'),
  opportunity: z.string().describe('A scannable, one-sentence business opportunity for a parts manufacturer or distributor related to this part.'),
});

export const PredictPartsDemandInputSchema = z.object({
  fleetAgeBrackets: z.array(z.custom<FleetAgeBracket>()).describe('An array of objects representing the age distribution of the vehicle fleet.'),
  partCategory: z.string().optional().describe('An optional, user-specified category of parts to focus the analysis on (e.g., "Freios", "Suspensão", "Cabos").'),
  filters: z.object({
    manufacturer: z.string(),
    model: z.string(),
  }).describe('The current manufacturer and model filters applied.'),
});
export type PredictPartsDemandInput = z.infer<typeof PredictPartsDemandInputSchema>;

export const PredictPartsDemandOutputSchema = z.object({
    predictions: z.array(PartPredictionSchema).describe('An array of up to 3-4 key part demand predictions.'),
});
export type PredictPartsDemandOutput = z.infer<typeof PredictPartsDemandOutputSchema>;
