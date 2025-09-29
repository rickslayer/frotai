
'use server';

/**
 * @fileOverview This file defines a Genkit flow for answering user questions about vehicle fleet data.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { FleetAgeBracketSchema, RegionDataSchema, ChartDataSchema, AnswerFleetQuestionOutputSchema } from '@/types';
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


export async function answerFleetQuestion(
  input: AnswerFleetQuestionInput
): Promise<AnswerFleetQuestionOutput> {
  return answerFleetQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerFleetQuestionPrompt',
  input: {schema: AnswerFleetQuestionInputSchema},
  output: {schema: AnswerFleetQuestionOutputSchema},
  config: {
    maxOutputTokens: 2048,
  },
  prompt: `O Frota.AI, com sua base de conhecimento especialista no setor automotivo e de autopeças brasileiro, analisará criticamente os dados a seguir para fornecer um parecer estratégico e conciso para um gestor comercial. A análise deve ser assertiva, comercialmente útil e ditar os próximos passos para o mercado.

A análise do Frota.AI é *estritamente* baseada nos dados fornecidos. A resposta final deve ser completa e não pode ser cortada.

**Contexto da Análise (Filtros Aplicados):**
{{question}}

**Dados Agregados para Análise Crítica:**

1.  **Distribuição da Frota por Idade:** Aqui estão os dados da frota por faixas de idade. O campo 'range' representa a faixa, 'label' é a descrição e 'quantity' é o total de veículos.
    \`\`\`json
    {{{json data.fleetAgeBrackets}}}
    \`\`\`

2.  **Distribuição Regional da Frota:** Aqui estão os dados da frota por região ou estado. O campo 'name' é a localidade e 'quantity' é o total de veículos.
    \`\`\`json
    {{{json data.regionalData}}}
    \`\`\`
    
3.  **Frota por Ano de Fabricação:** Analise os dados da frota por ano de fabricação, disponíveis no input 'data.fleetByYearData'. O campo 'name' é o ano e 'quantity' é o total de veículos.

**Instruções para a Análise Crítica e Assertiva do Frota.AI (seja direto e conciso e preencha TODOS os campos do JSON de saída):**

1.  **executiveSummary:** Comece com um parágrafo curto resumindo a principal conclusão da análise.
2.  **ageAnalysis:** Identifique a faixa etária predominante e traduza isso em uma **oportunidade de negócio clara e direta**. Exemplo: "A concentração de veículos com 8-12 anos indica forte demanda por peças de manutenção de alta quilometragem (ex: embreagem, amortecedores)."
3.  **regionalAnalysis:** Aponte a região dominante e sua **implicação estratégica**. Exemplo: "O Sudeste concentra 80% da frota, exigindo foco logístico e de distribuição nesta região."
4.  **yearAnalysis:** Identifique picos significativos e conecte com o ciclo de vida do veículo. Exemplo: "O pico de vendas em 2016 significa que esta safra entra agora na fase de grande manutenção, demandando peças mais complexas."
5.  **strategicRecommendation:** Conclua com 2-3 recomendações acionáveis e diretas para um fabricante ou distribuidor de autopeças, em formato de lista (markdown).

**Formato:** Use Markdown (negrito, listas). Linguagem profissional, direta e confiante. A resposta final deve estar em português e ser concisa.
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
    if (!output) {
      throw new Error('AI failed to generate a response. The output was null.');
    }
    return output;
  }
);
