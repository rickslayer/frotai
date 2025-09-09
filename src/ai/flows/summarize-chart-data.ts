'use server';

/**
 * @fileOverview A Genkit flow to summarize chart data and provide business insights.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ChartDataItemSchema = z.object({
    name: z.string().describe('The label for the data point (e.g., a year, a region name).'),
    quantity: z.number().describe('The value of the data point.'),
});

const SummarizeChartDataInputSchema = z.object({
  chartData: z.array(ChartDataItemSchema).describe('The data points from the chart as a JSON array.'),
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
  prompt: `Você é um analista de mercado sênior, especialista na indústria de autopeças no Brasil. Sua tarefa é analisar os dados de um gráfico e fornecer um resumo inteligente e acionável em português, com no máximo 3 sentenças curtas.

O gráfico se chama: "{{chartTitle}}"

Os dados do gráfico, que representam o resultado de uma consulta específica de frota, são:
\`\`\`json
{{{json chartData}}}
\`\`\`

Instruções para a Análise:
1.  **Contextualize:** Comece sua análise mencionando o ponto principal revelado pelo gráfico no contexto do título.
2.  **Identifique o Principal Ponto de Dados:** Destaque o item de maior volume (a maior 'quantity'). Qual região, ano ou modelo se destaca?
3.  **Gere Insight Acionável:** Com base no ponto de maior volume, qual é a principal oportunidade de negócio? Por exemplo, se a região Sudeste domina, a oportunidade é focar a distribuição lá. Se veículos de 8-12 anos são a maioria, a oportunidade está em peças de manutenção para esses modelos.
4.  **Seja Conciso:** A análise deve ser direta, clara e fácil de ler. Use frases curtas. Não ultrapasse 3 sentenças.

Exemplo de Saída para um gráfico de Regiões:
"A análise regional mostra que a região Sudeste concentra a maior parte da frota, com 150.000 veículos. Isso indica que os esforços de distribuição e venda de peças para os modelos filtrados devem ser priorizados nesta região para maior retorno."

Exemplo de Saída para um gráfico de Frota por Ano:
"O gráfico de frota por ano revela um pico significativo de veículos fabricados em 2012, totalizando 25.000 unidades. Isso sugere uma alta demanda iminente por peças de reposição e manutenção de meia-vida, como kits de correia dentada e amortecedores, para os modelos deste ano."

Fale diretamente com o usuário (um profissional do setor). Forneça insights que ajudem na tomada de decisão sobre estoque, vendas ou fabricação, com base *apenas* nos dados visíveis no gráfico.`,
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
