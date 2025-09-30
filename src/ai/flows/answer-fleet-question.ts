
'use server';

/**
 * @fileOverview This file defines a Genkit flow for answering user questions about vehicle fleet data.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { FleetAgeBracketSchema, RegionDataSchema, ChartDataSchema, AnswerFleetQuestionOutputSchema, PersonaSchema } from '@/types';
import type { AnswerFleetQuestionOutput } from '@/types';

const AnswerFleetQuestionInputSchema = z.object({
  persona: PersonaSchema.describe('The user profile for whom the analysis is being generated (e.g., manufacturer, retailer). This will tailor the language and focus of the analysis.'),
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
  prompt: `O Frota.AI, com sua base de conhecimento especialista no setor automotivo, analisará os dados a seguir para fornecer um parecer estratégico para um(a) **{{persona}}**. A análise deve ser assertiva, comercialmente útil e adaptada à perspectiva dessa persona.

A análise do Frota.AI é *estritamente* baseada nos dados fornecidos. A resposta final deve ser completa e não pode ser cortada.

**Contexto da Análise (Filtros Aplicados):**
{{question}}

**Dados Agregados para Análise:**

1.  **Distribuição da Frota por Idade:** Dados da frota por faixas de idade.
    \`\`\`json
    {{{json data.fleetAgeBrackets}}}
    \`\`\`

2.  **Distribuição Regional da Frota:** Dados da frota por região ou estado.
    \`\`\`json
    {{{json data.regionalData}}}
    \`\`\`
    
3.  **Frota por Ano de Fabricação:** Dados da frota por ano de fabricação.
    \`\`\`json
    {{{json data.fleetByYearData}}}
    \`\`\`

**Instruções para a Análise (seja direto, conciso e adapte a linguagem para a persona "{{persona}}"):**

1.  **executiveSummary:** Resuma a principal conclusão da análise em um parágrafo curto, focando no que é mais importante para um(a) **{{persona}}**.
2.  **ageAnalysis:** Identifique a faixa etária predominante e traduza isso em uma **oportunidade de negócio clara para a persona**. Exemplo para Lojista: "A concentração de veículos com 8-12 anos indica forte demanda no balcão por peças de manutenção (ex: embreagem, amortecedores)." Exemplo para Fabricante: "A frota jovem sugere oportunidade para desenvolver kits de revisão para concessionárias."
3.  **regionalAnalysis:** Aponte a região dominante e sua **implicação estratégica para a persona**. Exemplo para Representante: "O Sudeste concentra 80% da frota, indicando a necessidade de fortalecer a carteira de clientes nessa região." Exemplo para Distribuidor: "A pulverização no Nordeste pode exigir um centro de distribuição local para agilizar a entrega."
4.  **yearAnalysis:** Identifique picos significativos no histórico de anos e conecte com o ciclo de vida do veículo, **sob a ótica da persona**. Exemplo para Mecânico: "O pico de vendas em 2016 significa que esta safra chega agora na oficina para grande manutenção, demandando serviços mais complexos."
5.  **strategicRecommendation:** Conclua com 2-3 recomendações acionáveis e diretas para a persona **{{persona}}**, em formato de lista (markdown).

**Formato:** Use Markdown (negrito, listas). Linguagem profissional, direta e confiante. A resposta final deve estar em português.
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
