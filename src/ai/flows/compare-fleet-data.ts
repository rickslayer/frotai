
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
  prompt: `O Frota.AI, na sua função de sistema especialista em inteligência de mercado automotivo, realizará uma análise comparativa crítica entre os dois cenários de frotas de veículos a seguir. A análise identificará as diferenças mais importantes e concluirá com uma recomendação estratégica clara sobre qual cenário apresenta a maior oportunidade de negócio.

**Cenário A (Filtros: {{{json scenarioA.filters}}})**
- **Frota por Idade:** {{{json scenarioA.fleetAgeBrackets}}}
- **Frota por Região:** {{{json scenarioA.regionalData}}}
- **Frota por Ano:** {{{json scenarioA.fleetByYearData}}}

**Cenário B (Filtros: {{{json scenarioB.filters}}})**
- **Frota por Idade:** {{{json scenarioB.fleetAgeBrackets}}}
- **Frota por Região:** {{{json scenarioB.regionalData}}}
- **Frota por Ano:** {{{json scenarioB.fleetByYearData}}}

**Instruções para a Análise Comparativa Crítica do Frota.AI:**

1.  **Visão Geral Quantitativa:** Compare os volumes totais. Qual cenário tem mais veículos? Qual a diferença percentual?

2.  **Análise Comparativa de Idade da Frota:**
    *   Compare as faixas etárias predominantes (ex: Novos, Usados) entre os dois cenários.
    *   **Gere um Insight Crítico:** O que a diferença na idade média da frota significa? Exemplo: "O Cenário A, apesar de menor em volume, possui uma concentração 30% maior de veículos na faixa 'Usados (8-12 anos)'. Isso indica uma demanda mais imediata e previsível por peças de reposição de alta quilometragem, como embreagens e suspensão, em comparação com o Cenário B, que é dominado por veículos mais novos."

3.  **Análise Comparativa Regional:**
    *   Compare a distribuição geográfica. Um cenário é mais concentrado regionalmente que o outro?
    *   **Gere um Insight Estratégico:** Qual a implicação logística e de distribuição disso? Exemplo: "Enquanto o Cenário A está pulverizado pelo país, 85% da frota do Cenário B está na região Sudeste. Isso permite uma estratégia de distribuição mais focada e de menor custo para o Cenário B, otimizando o estoque nos centros de distribuição de SP e RJ."

4.  **Análise Comparativa por Ano de Fabricação:**
    *   Compare os picos de produção. Os anos de maior volume são diferentes?
    *   **Conecte com o Ciclo de Vida do Produto:** O que isso revela sobre o ciclo de manutenção? Exemplo: "O pico do Cenário A foi em 2018, indicando que esses veículos estão entrando agora na fase de troca de itens de manutenção preventiva. Já o pico do Cenário B, em 2014, aponta para uma demanda por peças de reparo mais complexas e de maior valor agregado."

5.  **Conclusão e Recomendação Estratégica:**
    *   Com base em todos os pontos anteriores, qual cenário representa a **melhor oportunidade de negócio *agora*?**
    *   Seja decisivo. Justifique a escolha com base nos insights gerados. Exemplo: "Conclusão: Embora o Cenário A tenha um volume total maior, o Cenário B representa uma oportunidade de negócio superior e mais imediata. A combinação de uma frota mais velha e uma forte concentração geográfica no Sudeste permite uma operação mais rentável e com menor risco de estoque. Recomenda-se priorizar o desenvolvimento de produtos e a distribuição para atender às demandas específicas da frota do Cenário B."

**Formato:** Use Markdown (negrito, listas). A linguagem deve ser assertiva e profissional, como a de um sistema especialista. A resposta deve estar em português.
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
