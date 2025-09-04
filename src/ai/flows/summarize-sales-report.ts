'use server';

/**
 * @fileOverview Summarizes a sales report to provide an executive summary.
 *
 * - summarizeSalesReport - A function that summarizes the sales report.
 * - SummarizeSalesReportInput - The input type for the summarizeSalesReport function.
 * - SummarizeSalesReportOutput - The return type for the summarizeSalesReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeSalesReportInputSchema = z.object({
  salesReport: z
    .string()
    .describe("The sales report to summarize, including data for various regions, time periods, and vehicle models."),
});
export type SummarizeSalesReportInput = z.infer<typeof SummarizeSalesReportInputSchema>;

const SummarizeSalesReportOutputSchema = z.object({
  summary: z.string().describe('A concise executive summary of the sales report.'),
});
export type SummarizeSalesReportOutput = z.infer<typeof SummarizeSalesReportOutputSchema>;

export async function summarizeSalesReport(input: SummarizeSalesReportInput): Promise<SummarizeSalesReportOutput> {
  return summarizeSalesReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeSalesReportPrompt',
  input: {schema: SummarizeSalesReportInputSchema},
  output: {schema: SummarizeSalesReportOutputSchema},
  prompt: `You are an expert sales analyst. Please provide a concise executive summary of the following sales report, highlighting key trends and insights.\n\nSales Report:\n{{{salesReport}}}`,
});

const summarizeSalesReportFlow = ai.defineFlow(
  {
    name: 'summarizeSalesReportFlow',
    inputSchema: SummarizeSalesReportInputSchema,
    outputSchema: SummarizeSalesReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
