'use server';

/**
 * @fileOverview This file defines a Genkit flow for summarizing chart data to provide insights
 * for the auto parts industry.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChartDataSchema = z.object({
  year: z.number(),
  quantity: z.number(),
});
export type ChartData = z.infer<typeof ChartDataSchema>;

const SummarizeChartDataInputSchema = z.object({
  chartData: z.array(ChartDataSchema).describe("The data points from the chart."),
  chartTitle: z.string().describe("The title of the chart being analyzed."),
});
export type SummarizeChartDataInput = z.infer<typeof SummarizeChartDataInputSchema>;

const SummarizeChartDataOutputSchema = z.object({
  summary: z.string().describe('A concise summary highlighting key trends, fleet age profile, peaks, and insights from the chart data for the auto parts market.'),
});
export type SummarizeChartDataOutput = z.infer<typeof SummarizeChartDataOutputSchema>;

export async function summarizeChartData(input: SummarizeChartDataInput): Promise<SummarizeChartDataOutput> {
  return summarizeChartDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeChartDataPrompt',
  input: {schema: SummarizeChartDataInputSchema},
  output: {schema: SummarizeChartDataOutputSchema},
  prompt: `You are an expert auto industry analyst. Your task is to provide a concise, insightful summary of the provided vehicle fleet data for an auto parts company.

Analyze the data from the chart titled "{{chartTitle}}". The data shows the quantity of vehicles by year of manufacture.

Data:
{{#each chartData}}
- Year: {{year}}, Quantity: {{quantity}}
{{/each}}

Based on this data, provide a summary that highlights:
1.  The overall trend (e.g., growing, shrinking, stable fleet).
2.  The age profile of the majority of the fleet and what it means for parts demand (e.g., older fleet needs more maintenance parts).
3.  The peak year(s) with the highest volume and what that might indicate for future demand.
4.  Any significant drop-offs or increases and potential reasons or market opportunities.

Provide the summary as a single, easy-to-read paragraph. Be clear, direct, and focus on the implications for the auto parts market.
Example: "The fleet shows a clear concentration of vehicles manufactured between 2018 and 2021, indicating a relatively young fleet with high demand for post-warranty maintenance parts. The peak in 2020 suggests a sales boom, creating a future opportunity for replacement parts, while the sharp decline in newer models could indicate a market shift or initial data collection phase."
`,
});

const summarizeChartDataFlow = ai.defineFlow(
  {
    name: 'summarizeChartDataFlow',
    inputSchema: SummarizeChartDataInputSchema,
    outputSchema: SummarizeChartDataOutputSchema,
  },
  async input => {
    // Prevent sending huge datasets to the model
    if (input.chartData.length > 100) {
        // Simple aggregation: group by 5-year intervals if too large
        const aggregatedData = input.chartData.reduce((acc, item) => {
            const fiveYearInterval = Math.floor(item.year / 5) * 5;
            const key = `${fiveYearInterval}-${fiveYearInterval+4}`;
            if (!acc[key]) {
                acc[key] = { year: fiveYearInterval, quantity: 0 };
            }
            acc[key].quantity += item.quantity;
            return acc;
        }, {} as Record<string, {year: number, quantity: number}>)
        input.chartData = Object.values(aggregatedData);
    }

    const {output} = await prompt(input);
    return output!;
  }
);
