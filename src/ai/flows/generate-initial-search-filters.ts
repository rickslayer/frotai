'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting initial search filters for vehicle searches
 * based on popular trends and historical data.
 *
 * @module src/ai/flows/generate-initial-search-filters
 * @typedef {Object} InitialSearchFilters - An object containing initial search filters for vehicle searches.
 * @property {string} state - The state to filter by.
 * @property {string} city - The city to filter by.
 * @property {string} manufacturer - The manufacturer to filter by.
 * @property {string} model - The model to filter by.
 * @property {string} version - The version to filter by.
 * @property {string} timePeriod - The time period to filter by.
 *
 * @function generateInitialSearchFilters - A function that generates initial search filters for vehicle searches.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InitialSearchFiltersSchema = z.object({
  state: z.string().describe('The state to filter by.'),
  city: z.string().describe('The city to filter by.'),
  manufacturer: z.string().describe('The manufacturer to filter by.'),
  model: z.string().describe('The model to filter by.'),
  version: z.string().describe('The version to filter by.'),
  timePeriod: z.string().describe('The time period to filter by.'),
});

export type InitialSearchFilters = z.infer<typeof InitialSearchFiltersSchema>;

const GenerateInitialSearchFiltersInputSchema = z.object({
  userLocation: z.string().describe('The current location of the user (e.g., city, state).'),
  recentSearchHistory: z.string().describe('A summary of the user\'s recent search history.'),
});

export type GenerateInitialSearchFiltersInput = z.infer<typeof GenerateInitialSearchFiltersInputSchema>;

const GenerateInitialSearchFiltersOutputSchema = z.array(InitialSearchFiltersSchema);

export type GenerateInitialSearchFiltersOutput = z.infer<typeof GenerateInitialSearchFiltersOutputSchema>;

export async function generateInitialSearchFilters(
  input: GenerateInitialSearchFiltersInput
): Promise<GenerateInitialSearchFiltersOutput> {
  return generateInitialSearchFiltersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInitialSearchFiltersPrompt',
  input: {schema: GenerateInitialSearchFiltersInputSchema},
  output: {schema: GenerateInitialSearchFiltersOutputSchema},
  prompt: `You are an AI assistant designed to suggest initial search filters for vehicle searches based on popular trends and historical data.

  Given the user's current location and recent search history, suggest three relevant filter combinations that the user might be interested in.

  User Location: {{{userLocation}}}
  Recent Search History: {{{recentSearchHistory}}}

  Format the response as a JSON array of InitialSearchFilters objects.

  Example:
  [
    {
      "state": "California",
      "city": "Los Angeles",
      "manufacturer": "Toyota",
      "model": "Camry",
      "version": "LE",
      "timePeriod": "Last 3 months"
    },
    {
      "state": "California",
      "city": "San Francisco",
      "manufacturer": "Honda",
      "model": "Civic",
      "version": "EX",
      "timePeriod": "Last 6 months"
    },
    {
      "state": "California",
      "city": "San Diego",
      "manufacturer": "Ford",
      "model": "F-150",
      "version": "XLT",
      "timePeriod": "Last 12 months"
    }
  ]
  `,
});

const generateInitialSearchFiltersFlow = ai.defineFlow(
  {
    name: 'generateInitialSearchFiltersFlow',
    inputSchema: GenerateInitialSearchFiltersInputSchema,
    outputSchema: GenerateInitialSearchFiltersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
