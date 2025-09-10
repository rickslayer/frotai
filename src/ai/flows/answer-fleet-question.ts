
'use server';

/**
 * @fileOverview This file defines a Genkit flow for answering user questions about vehicle fleet data.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { FleetAgeBracketSchema, RegionDataSchema, ChartDataSchema } from '@/types';
import type { AnswerFleetQuestionOutput } from '@/types';

const AnswerFleetQuestionInputSchema = z.object({
  question: z.string().describe("The user's question about the fleet data, including the filter context."),
  data: z.object({
    fleetAgeBrackets: z.array(FleetAgeBracketSchema).describe('An array of objects representing the age distribution of the vehicle fleet.'),
    regionalData: z.array(RegionDataSchema).describe('An array of objects representing the regional distribution of the vehicle fleet.'),
    fleetByYearData: z.array(ChartDataSchema).describe('An array of objects representing the fleet distribution by year.'),
  }),
});

export type AnswerFleetQuestionInput = z.infer<typeof AnswerFleetQuestionInputSchema>;

const AnswerFleetQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the user\'s question in Markdown format.'),
});


export async function answerFleetQuestion(
  input: AnswerFleetQuestionInput
): Promise<AnswerFleetQuestionOutput> {
  return answerFleetQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerFleetQuestionPrompt',
  input: {schema: AnswerFleetQuestionInputSchema},
  output: {schema: AnswerFleetQuestionOutputSchema},
  prompt: `Você é um especialista sênior em inteligência de mercado e engenharia automotiva para a indústria de autopeças no Brasil. Sua tarefa é fornecer uma análise crítica e aprofundada com base em um conjunto de dados de frota de veículos. A resposta deve ser assertiva, comercialmente útil e ditar os próximos passos para o mercado.

Sua análise deve ser *estritamente* baseada nos dados fornecidos.

**Contexto da Análise (Filtros Aplicados):**
{{question}}

**Dados Agregados para Análise Crítica:**

1.  **Distribuição da Frota por Idade (em JSON):**
    \`\`\`json
    {{{json data.fleetAgeBrackets}}}
    \`\`\`

2.  **Distribuição Regional da Frota (em JSON):**
    \`\`\`json
    {{{json data.regionalData}}}
    \`\`\`
    
3.  **Frota por Ano de Fabricação (em JSON):**
    \`\`\`json
    {{{json data.fleetByYearData}}}
    \`\`\`

**Instruções para a Análise Crítica e Assertiva:**

1.  **Síntese Executiva:** Comece com um parágrafo curto e direto que resuma a principal conclusão da análise. Qual é a história que os dados contam?
2.  **Análise por Idade da Frota:**
    *   Identifique a(s) faixa(s) etária(s) predominante(s) (ex: "Usados (8-12 anos)").
    *   Traduza isso em uma **oportunidade de negócio clara**. Exemplo: "A alta concentração de veículos com 8-12 anos (X mil unidades) indica uma demanda iminente e forte por peças de manutenção de alta quilometragem, como kits de embreagem, amortecedores e componentes de suspensão."
    *   Seja específico sobre o tipo de peça que essa faixa etária demanda.
3.  **Análise Regional:**
    *   Aponte a região dominante e sua representatividade percentual e absoluta (ex: "A região Sudeste concentra 80% da frota analisada, com 150.000 veículos.").
    *   Qual a **implicação estratégica** disso? Exemplo: "Isso solidifica o Sudeste como o mercado prioritário, exigindo um foco logístico e de distribuição para garantir a disponibilidade de peças para os modelos em questão."
4.  **Análise por Ano de Fabricação:**
    *   Identifique picos ou tendências significativas no gráfico de ano. Existe um ano específico com um volume muito alto?
    *   Conecte essa informação com o ciclo de vida do veículo. Exemplo: "O pico de vendas em 2016, com 30.000 veículos, significa que essa safra de carros está entrando agora na sua segunda fase de grande manutenção (pós 7-8 anos), abrindo um mercado para peças mais complexas como bombas de combustível e alternadores."
5.  **Recomendação Estratégica Final:** Conclua com 2-3 recomendações acionáveis e diretas para um fabricante ou distribuidor de autopeças. As recomendações devem ser uma consequência lógica das análises anteriores. Exemplo: "1. Priorizar o estoque de kits de correia dentada para o [Modelo do Filtro] anos 2015-2017. 2. Intensificar a distribuição e marketing na região Sudeste, com foco em centros urbanos. 3. Desenvolver campanhas promocionais para peças de freio e suspensão, que são as mais procuradas pela faixa etária dominante de 8-12 anos."

**Formato da Resposta:**
*   Use Markdown para formatar a resposta (negrito, listas).
*   A linguagem deve ser profissional, direta e confiante.
*   A resposta final deve estar em português.
`,
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
