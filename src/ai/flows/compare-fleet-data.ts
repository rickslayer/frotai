
'use server';

/**
 * @fileOverview This file defines a Genkit flow for comparing two different vehicle fleet datasets.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { CompareFleetDataOutputSchema } from '@/types';
import type { CompareFleetDataOutput } from '@/types';

// Defines the structure for a single analysis scenario to be compared
const FleetAnalysisScenarioSchema = z.object({
  filters: z.string().describe('The filters applied for this scenario as a string (e.g., "State: SP; City: São Paulo").'),
  totalVehicles: z.number().describe('The total number of vehicles in this scenario.'),
  topAgeBracket: z.string().describe('The most predominant age bracket and its total count (e.g., "Used (8-12 years): 50,000 vehicles).'),
  topRegion: z.string().describe('The main region or state and its total count (e.g., "Southeast: 100,000 vehicles).')
});

// Defines the input for the comparison flow
const CompareFleetDataInputSchema = z.object({
  scenarioA: FleetAnalysisScenarioSchema,
  scenarioB: FleetAnalysisScenarioSchema,
});

export type CompareFleetDataInput = z.infer<typeof CompareFleetDataInputSchema>;


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
  prompt: `Você é o Frota.AI, um analista de mercado especialista. Sua tarefa é comparar os dois cenários de frota de veículos a seguir e gerar insights estratégicos. Seja direto, conciso e use Markdown para formatação.

**Cenário A (Filtros: {{scenarioA.filters}})**
- **Total de Veículos:** {{scenarioA.totalVehicles}}
- **Principal Faixa Etária:** {{scenarioA.topAgeBracket}}
- **Principal Localização:** {{scenarioA.topRegion}}


**Cenário B (Filtros: {{scenarioB.filters}})**
- **Total de Veículos:** {{scenarioB.totalVehicles}}
- **Principal Faixa Etária:** {{scenarioB.topAgeBracket}}
- **Principal Localização:** {{scenarioB.topRegion}}

---

**Instruções para sua Análise Estratégica (Preencha TODOS os campos do JSON de saída):**

1.  **overview:** Qual cenário tem o maior volume de veículos? Destaque a diferença percentual de forma clara. (Ex: "O Cenário A possui 50.000 veículos, 25% a mais que o Cenário B.")
2.  **ageComparison:** Qual cenário tem a frota mais antiga (baseado na "Principal Faixa Etária")? **Gere um Insight Crítico:** O que isso significa em termos de oportunidade de peças? (Ex: "Cenário A, com a maioria da frota na faixa 'Usados', indica uma demanda imediata e forte por peças de manutenção e reparo, como suspensão e freios.")
3.  **regionalComparison:** Qual cenário possui uma frota mais concentrada geograficamente (baseado na "Principal Localização")? **Gere uma Implicação Estratégica:** Qual a vantagem disso? (Ex: "A concentração de 80% da frota do Cenário B no Sudeste simplifica a logística e permite uma estratégia de distribuição mais agressiva e de menor custo.")
4.  **recommendation:** Com base nos pontos acima, qual cenário representa a **melhor oportunidade de negócio *agora* para um fabricante de autopeças?** Justifique sua recomendação em uma única frase.

Responda em **português**. A resposta deve ser completa.
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
