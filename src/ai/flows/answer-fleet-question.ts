'use server';

/**
 * @fileOverview This file defines a Genkit flow for answering user questions about vehicle fleet data.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerFleetQuestionInputSchema = z.object({
  question: z.string().describe('The user\'s question about the fleet data.'),
  data: z.any().describe('The fleet data (JSON array of Vehicle objects) to answer the question from.'),
});

export type AnswerFleetQuestionInput = z.infer<typeof AnswerFleetQuestionInputSchema>;

const AnswerFleetQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the user\'s question.'),
});

export type AnswerFleetQuestionOutput = z.infer<typeof AnswerFleetQuestionOutputSchema>;

export async function answerFleetQuestion(
  input: AnswerFleetQuestionInput
): Promise<AnswerFleetQuestionOutput> {
  return answerFleetQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerFleetQuestionPrompt',
  input: {schema: AnswerFleetQuestionInputSchema},
  output: {schema: AnswerFleetQuestionOutputSchema},
  prompt: `You are an expert data analyst for an auto parts market analysis platform. Your task is to answer a user's question based on a provided JSON dataset of vehicle fleet information.

The user's question is: "{{question}}"

The data, in JSON format, is as follows:
\`\`\`json
{{{json data}}}
\`\`\`

Based *only* on the data provided, answer the user's question in a clear and concise way. Provide a direct answer. If the data is insufficient to answer the question, state that you cannot answer with the available information. The response should be in the same language as the question.`,
});


const answerFleetQuestionFlow = ai.defineFlow(
  {
    name: 'answerFleetQuestionFlow',
    inputSchema: AnswerFleetQuestionInputSchema,
    outputSchema: AnswerFleetQuestionOutputSchema,
  },
  async input => {
    // Stringify the data to pass it to the prompt
    const augmentedInput = {
      ...input,
      data: JSON.stringify(input.data, null, 2),
    };
    const {output} = await prompt(augmentedInput);
    return output!;
  }
);
