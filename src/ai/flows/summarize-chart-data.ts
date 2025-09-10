
'use server';

/**
 * @fileOverview A Genkit flow to summarize chart data and provide business insights.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ChartDataSchema } from '@/types';

const SummarizeChartDataInputSchema = z.object({
  chartData: z.array(ChartDataSchema).describe('The data points from the chart as a JSON array.'),
  chartTitle: z.string().describe('The title of the chart being analyzed, providing context.'),
});
export type SummarizeChartDataInput = z.infer<typeof SummarizeChartDataInputSchema>;

const SummarizeChartDataOutputSchema = z.object({
  summary: z.string().describe('A concise, insightful summary of the chart data from the perspective of an auto parts market analyst. The language should be Portuguese.'),
});
export type SummarizeChartDataOutput = z.infer<typeof SummarizeChartDataOutputSchema>;


export async function summarizeChartData(
  input: SummarizeChartDataInput
): Promise<SummarizeChartDataOutput> {
  return summarizeChartDataFlow(input);
}


const prompt = ai.definePrompt({
  name: 'summarizeChartDataPrompt',
  input: { schema: SummarizeChartDataInputSchema },
  output: { schema: SummarizeChartDataOutputSchema },
  prompt: `Como sistema especialista na indústria de autopeças, o Frota.AI irá analisar os dados do gráfico a seguir e fornecer um resumo inteligente e acionável em português, com no máximo 2 sentenças curtas e diretas.

**Gráfico:** "{{chartTitle}}"

**Dados do Gráfico:**
\`\`\`json
{{{json chartData}}}
\`\`\`

**Instruções para a Análise (Seja Direto e Foque em Valor):**
1.  **Identifique o Ponto Principal:** Destaque o item de maior volume (a maior 'quantity') e seu valor numérico.
2.  **Gere Insight Acionável:** Qual é a principal oportunidade de negócio ou conclusão estratégica com base nesse ponto?
3.  **Seja Conciso:** A análise deve ser direta, clara e não deve ultrapassar 2 sentenças. A resposta deve ser completa.

**Exemplo (Gráfico de Regiões):**
"A região Sudeste concentra a maior parte da frota, com 150.000 veículos. Isso indica que os esforços de distribuição devem ser priorizados nesta área para maior retorno."

**Exemplo (Gráfico de Ano):**
"O pico de veículos de 2012 (25.000 unidades) sugere alta demanda iminente por peças de reposição de meia-vida, como kits de correia dentada e amortecedores."
`,
});


const summarizeChartDataFlow = ai.defineFlow(
  {
    name: 'summarizeChartDataFlow',
    inputSchema: SummarizeChartDataInputSchema,
    outputSchema: SummarizeChartDataOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
