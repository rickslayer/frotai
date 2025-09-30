
import { z } from 'zod';

export type Vehicle = {
  id: string;
  manufacturer: string;
  model: string;
  version: string;
  fullName: string;
  year: number;
  quantity: number;
  region: string;
  state: string;
  city: string;
};

export type FilterOptions = {
  regions: string[];
  states: string[];
  cities: string[];
  manufacturers: string[];
  models: string[];
  versions: string[];
  years: number[];
};

export type Filters = {
  region: string;
  state: string;
  city: string;
  manufacturer: string;
  model: string[];
  version: string[];
  year: number | '';
};

// Schema for data points used in charts
export const ChartDataSchema = z.object({
    name: z.string().describe('The label for the data point (e.g., a year, a region name).'),
    quantity: z.number().describe('The value of the data point.'),
});
export type ChartData = z.infer<typeof ChartDataSchema>;


// Schema for the data structure representing fleet age distribution
export const FleetAgeBracketSchema = z.object({
  range: z.string().describe('The age range, e.g., "0-3".'),
  label: z.string().describe('The user-facing label for the age bracket, e.g., "Novos (0-3 anos)".'),
  quantity: z.number().describe('The total number of vehicles in this bracket.'),
});
export type FleetAgeBracket = z.infer<typeof FleetAgeBracketSchema>;

// Schema for regional data
export const RegionDataSchema = z.object({
    name: z.string().describe('The name of the region or state.'),
    quantity: z.number().describe('The total number of vehicles in this region/state.'),
});
export type RegionData = z.infer<typeof RegionDataSchema>;

// Persona Schema
export const PersonaSchema = z.enum(['manufacturer', 'representative', 'distributor', 'retailer', 'mechanic']);
export type Persona = z.infer<typeof PersonaSchema>;


// Types for Part Demand Prediction Flow
const PartPredictionSchema = z.object({
  partName: z.string().describe('The specific name of the auto part with high demand potential (e.g., "Kit de Embreagem", "Pastilhas de Freio Dianteiras").'),
  demandLevel: z.enum(['Alta', 'Média', 'Baixa']).describe('The predicted level of demand for this part.'),
  reason: z.string().describe('A concise explanation for why this part is in demand for the given fleet, mentioning the vehicle age or model characteristics.'),
  opportunity: z.string().describe('A scannable, one-sentence business opportunity for a parts manufacturer or distributor related to this part.'),
});

export const PredictPartsDemandInputSchema = z.object({
  persona: PersonaSchema.describe('The user profile for whom the analysis is being generated.'),
  fleetAgeBrackets: z.array(FleetAgeBracketSchema).describe('An array of objects representing the age distribution of the vehicle fleet.'),
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


// Types for Final Analysis Flow
export const AnswerFleetQuestionOutputSchema = z.object({
  executiveSummary: z.string().describe("A short executive summary of the main conclusion from the analysis."),
  ageAnalysis: z.string().describe("Analysis based on the fleet's age distribution, identifying the predominant age group and the resulting business opportunity."),
  regionalAnalysis: z.string().describe("Analysis of the regional distribution, pointing out the dominant region and its strategic implication."),
  yearAnalysis: z.string().describe("Analysis based on the manufacturing year, identifying significant peaks and connecting them to the vehicle's lifecycle."),
  strategicRecommendation: z.string().describe("2-3 actionable and direct recommendations for an auto parts manufacturer or distributor."),
});
export type AnswerFleetQuestionOutput = z.infer<typeof AnswerFleetQuestionOutputSchema>;

// Types for Comparison Analysis
export const CompareFleetDataOutputSchema = z.object({
    overview: z.string().describe("A general comparison of which scenario has the largest vehicle volume, including the percentage difference."),
    ageComparison: z.string().describe("A critical insight into which scenario has the older fleet and what this means in terms of parts opportunities."),
    regionalComparison: z.string().describe("A strategic implication of which scenario has a more geographically concentrated fleet and its advantages."),
    recommendation: z.string().describe("A final, one-sentence recommendation on which scenario represents the best immediate business opportunity and why."),
});
export type CompareFleetDataOutput = z.infer<typeof CompareFleetDataOutputSchema>;


export type AnalysisSnapshot = {
  filters: Filters;
  totalVehicles: number;
  fleetAgeBrackets: FleetAgeBracket[];
  regionalData: RegionData[];
  fleetByYearData: ChartData[];
  availableVersionsCount?: number;
};


// Main data structure returned by the aggregated API
export type TopEntity = {
  name: string;
  quantity: number;
};

export type TopModel = {
  model: string;
  quantity: number;
};

export type FleetByYear = {
  year: number;
  quantity: number;
};

export type DashboardData = {
  totalVehicles: number;
  topOverallModel: TopEntity;
  topRegion?: TopEntity | null;
  topState?: TopEntity | null;
  topCity?: TopEntity | null;
  regionalData: RegionData[];
  topModelsChart: TopModel[];
  fleetByYearChart: FleetByYear[];
  fleetAgeBrackets: Omit<FleetAgeBracket, 'label'>[];
};
