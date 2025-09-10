
'use server';

/**
 * @fileOverview This file defines a Genkit flow for comparing two different vehicle fleet datasets.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { FleetAgeBracketSchema, RegionDataSchema, ChartDataSchema } from '@/types';

// Defines the structure for a single analysis scenario to be compared
const FleetAnalysisScenarioSchema = z.object({
  filters: z.record(z.string()).describe('The filters applied for this scenario.'),
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
  prompt: `O Frota.AI, na sua função de sistema especialista em inteligência de mercado automotivo, realizará uma análise comparativa crítica e concisa entre os dois cenários de frotas de veículos a seguir. A análise identificará as diferenças mais importantes e concluirá com uma recomendação estratégica clara sobre qual cenário apresenta a maior oportunidade de negócio.

**Cenário A (Filtros: {{{json scenarioA.filters}}})**
- **Frota por Idade:** {{{json scenarioA.fleetAgeBrackets}}}
- **Frota por Região:** {{{json scenarioA.regionalData}}}
- **Frota por Ano:** {{{json scenarioA.fleetByYearData}}}

**Cenário B (Filtros: {{{json scenarioB.filters}}})**
- **Frota por Idade:** {{{json scenarioB.fleetAgeBrackets}}}
- **Frota por Região:** {{{json scenarioB.regionalData}}}
- **Frota por Ano:** {{{json scenarioB.fleetByYearData}}}

**Instruções para a Análise Comparativa Crítica e Concisa do Frota.AI:**

1.  **Visão Geral:** Compare os volumes totais. Qual cenário tem mais veículos?
2.  **Análise Comparativa de Idade:** Compare as faixas etárias predominantes. **Gere um Insight Crítico:** O que a diferença na idade média significa? Exemplo: "Cenário A tem 30% mais veículos na faixa 'Usados', indicando demanda mais imediata por peças de reposição."
3.  **Análise Comparativa Regional:** Compare a distribuição geográfica. **Gere um Insight Estratégico:** Qual a implicação logística? Exemplo: "85% da frota do Cenário B está no Sudeste, permitindo uma distribuição mais focada e de menor custo."
4.  **Análise Comparativa por Ano:** Compare os picos de produção. **Conecte com o Ciclo de Vida:** O que isso revela sobre o ciclo de manutenção? Exemplo: "O pico do Cenário A foi em 2018 (manutenção preventiva), enquanto o do Cenário B foi em 2014 (reparos complexos)."
5.  **Conclusão e Recomendação Estratégica:** Qual cenário representa a **melhor oportunidade de negócio *agora*?** Seja decisivo e justifique com base nos insights gerados.

**Formato:** Use Markdown (negrito, listas). A linguagem deve ser assertiva, profissional e concisa. A resposta deve estar em português.
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
    return output!;
  }
);
