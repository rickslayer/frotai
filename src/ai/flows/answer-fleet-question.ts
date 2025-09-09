
'use server';

/**
 * @fileOverview This file defines a Genkit flow for answering user questions about vehicle fleet data.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AnswerFleetQuestionInputSchema = z.object({
  question: z.string().describe('The user\'s question about the fleet data, including the filter context.'),
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
  prompt: `Você é um especialista em análise de mercado para a indústria de autopeças. Sua tarefa é responder a uma pergunta do usuário sobre uma frota de veículos com base em um conjunto de filtros que ele aplicou.

A pergunta do usuário, que já inclui o contexto dos filtros, é: "{{question}}"

Com base nesta pergunta, forneça uma análise de mercado clara, profissional e sucinta. A resposta deve ser em português.`,
});


const answerFleetQuestionFlow = ai.defineFlow(
  {
    name: 'answerFleetQuestionFlow',
    inputSchema: AnswerFleetQuestionInputSchema,
    outputSchema: AnswerFleetQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
