'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting initial search filters for vehicle fleet analysis
 * based on common analysis scenarios.
 *
 * @module src/ai/flows/generate-initial-search-filters
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InitialSearchFiltersSchema = z.object({
  state: z.string().describe('The state to filter by (e.g., "São Paulo").'),
  city: z.string().describe('The city to filter by (e.g., "São Paulo").'),
  manufacturer: z.string().describe('The manufacturer to filter by (e.g., "Fiat").'),
  model: z.string().describe('The model to filter by (e.g., "Strada").'),
  description: z.string().describe('A short, user-facing description of the suggestion (e.g., "Analisar a frota de Fiat Strada em São Paulo").'),
});

export type InitialSearchFilters = z.infer<typeof InitialSearchFiltersSchema>;

const GenerateInitialSearchFiltersInputSchema = z.object({
  userRegion: z.string().describe('The current region of the user for context (e.g., "Sudeste").'),
  commonModels: z.array(z.string()).describe('A list of common vehicle models in the dataset.'),
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
  prompt: `You are an AI assistant for an auto parts market analysis platform. Your goal is to suggest three relevant and interesting starting points for fleet analysis.

Given the user's region and a list of common vehicle models, create three filter suggestions. Each suggestion should focus on a specific, actionable analysis scenario.

User's Region: {{{userRegion}}}
Common Models: {{{commonModels}}}

- Each suggestion should have a clear, concise description in Portuguese.
- Pick a relevant state and city for the analysis.
- Focus on popular models that are relevant for the auto parts market (e.g., high volume, older models).

Example Output (as a JSON array of InitialSearchFilters objects):
[
  {
    "state": "São Paulo",
    "city": "São Paulo",
    "manufacturer": "Fiat",
    "model": "Strada",
    "description": "Analisar a frota de Fiat Strada em São Paulo"
  },
  {
    "state": "Rio de Janeiro",
    "city": "Rio de Janeiro",
    "manufacturer": "Chevrolet",
    "model": "Onix",
    "description": "Chevrolet Onix no Rio de Janeiro"
  },
  {
    "state": "Minas Gerais",
    "city": "Belo Horizonte",
    "manufacturer": "Volkswagen",
    "model": "Polo",
    "description": "Potencial do VW Polo em Minas Gerais"
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
