'use server';

/**
 * @fileOverview A Genkit flow to summarize chart data and provide business insights.
 */

import { ai } from '@/ai/genkit';
import { ChartDataSchema } from '@/types';
import { z } from 'zod';

const SummarizeChartDataInputSchema = z.object({
  chartData: z.array(ChartDataSchema).describe('The data points from the chart as a JSON array.'),
  chartTitle: z.string().describe('The title of the chart being analyzed.'),
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
  prompt: `Você é um analista de mercado especialista na indústria de autopeças. Sua tarefa é analisar os dados de um gráfico e fornecer um resumo inteligente e acionável em português.

O gráfico se chama: "{{chartTitle}}"

Os dados do gráfico, que representam o resultado de uma consulta específica de frota, são:
\`\`\`json
{{{json chartData}}}
\`\`\`

Baseie sua análise *estritamente* nos dados fornecidos. Não faça suposições sobre dados fora deste conjunto.
Analise os dados e identifique as principais tendências, picos, quedas e oportunidades de mercado. Por exemplo, um grande número de veículos com 8-12 anos pode indicar uma alta demanda por peças de reposição e manutenção. Um pico em um ano específico pode sugerir uma oportunidade para peças daquele modelo/ano.

Fale diretamente com o usuário (um profissional do setor). Seja conciso e direto ao ponto. Forneça insights que ajudem na tomada de decisão sobre estoque, vendas ou fabricação, com base *apenas* nos dados visíveis no gráfico.`,
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
