
'use server';

/**
 * @fileOverview This file defines a Genkit flow for comparing two different vehicle fleet datasets.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { FleetAgeBracketSchema, RegionDataSchema, ChartDataSchema } from '@/types';

// Defines the explicit schema for the filters
const ComparisonFilterSchema = z.object({
  state: z.string(),
  city: z.string(),
  manufacturer: z.string(),
  model: z.string(),
  version: z.array(z.string()),
  year: z.string(),
});

// Defines the structure for a single analysis scenario to be compared
const FleetAnalysisScenarioSchema = z.object({
  filters: ComparisonFilterSchema.describe('The filters applied for this scenario.'),
  fleetAgeBrackets: z.array(FleetAgeBracketSchema).describe('Age distribution data for this scenario.'),
  regionalData: z.array(RegionDataSchema).describe('Regional distribution data for this scenario.'),
  fleetByYearData: z.array(ChartDataSchema).describe('Fleet by manufacturing year data for this scenario.'),
});

// Defines the input for the comparison flow
const CompareFleetDataInputSchema = z.object({
  scenarioA: FleetAnalysisScenarioSchema,
  scenarioB: FleetAnalysisScenarioSchema,
});

export type CompareFleetDataInput = z.infer<typeof CompareFleetDataInputSchema>;

// Defines the output of the comparison flow
const CompareFleetDataOutputSchema = z.object({
  comparison: z.string().describe('A detailed, critical, and insightful comparison of the two scenarios in Markdown format.'),
});

export type CompareFleetDataOutput = z.infer<typeof CompareFleetDataOutputSchema>;

export async function compareFleetData(
  input: CompareFleetDataInput
): Promise<CompareFleetDataOutput> {
  return compareFleetDataFlow(input);
}


const prompt = ai.definePrompt({
  name: 'compareFleetDataPrompt',
  input: {schema: CompareFleetDataInputSchema},
  output: {schema: CompareFleetDataOutputSchema},
  config: {
    maxOutputTokens: 2048,
  },
  prompt: `A Frota.AI, apresenta uma análise direta e focada nas oportunidades:

**Cenário A (Filtros: {{{json scenarioA.filters}}})**
- **Frota por Idade:** {{{json scenarioA.fleetAgeBrackets}}}
- **Frota por Região:** {{{json scenarioA.regionalData}}}

**Cenário B (Filtros: {{{json scenarioB.filters}}})**
- **Frota por Idade:** {{{json scenarioB.fleetAgeBrackets}}}
- **Frota por Região:** {{{json scenarioB.regionalData}}}

**Instruções para sua Análise Estratégica (Seja Conciso):**

1.  **Visão Geral:** Qual cenário tem o maior volume de veículos? Destaque a diferença percentual.
2.  **Análise Comparativa de Idade:** Qual cenário tem a frota mais antiga? **Gere um Insight Crítico:** O que isso significa em termos de oportunidade de peças? (Ex: "Cenário A, com 40% de sua frota na faixa 'Usados', indica uma demanda imediata e forte por peças de manutenção e reparo, como suspensão e freios.")
3.  **Análise Comparativa Regional:** Qual cenário possui uma frota mais concentrada geograficamente? **Gere uma Implicação Estratégica:** Qual a vantagem disso? (Ex: "A concentração de 80% da frota do Cenário B no Sudeste simplifica a logística e permite uma estratégia de distribuição mais agressiva e de menor custo.")
4.  **Conclusão e Recomendação Final:** Com base nos pontos acima, qual cenário representa a **melhor oportunidade de negócio *agora* para um fabricante de autopeças?** Justifique sua recomendação em uma única frase.

**Formato:** Use Markdown (negrito, listas). A linguagem deve ser profissional, assertiva e extremamente concisa. A resposta deve ser completa, não pode ser cortada e deve estar em português.
`,
});

const compareFleetDataFlow = ai.defineFlow(
  {
    name: 'compareFleetDataFlow',
    inputSchema: CompareFleetDataInputSchema,
    outputSchema: CompareFleetDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate a comparison. The response was empty.');
    }
    return output;
  }
);
