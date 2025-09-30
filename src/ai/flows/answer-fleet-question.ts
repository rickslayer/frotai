
'use server';

/**
 * @fileOverview This file defines a Genkit flow for answering user questions about vehicle fleet data.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { AnswerFleetQuestionOutputSchema, PersonaSchema } from '@/types';
import type { Persona } from '@/types';

// Simplified input schema expecting summarized data
const AnswerFleetQuestionInputSchema = z.object({
  persona: PersonaSchema.describe('The user profile for whom the analysis is being generated (e.g., manufacturer, retailer). This will tailor the language and focus of the analysis.'),
  filters: z.string().describe("A summary of the user's applied filters."),
  summary: z.object({
      totalVehicles: z.string().describe("Total number of vehicles in the filtered selection."),
      predominantAgeBracket: z.string().describe("The most common vehicle age bracket and its quantity."),
      predominantRegion: z.string().describe("The most relevant region or state and its quantity."),
      yearPeaks: z.string().describe("The most significant manufacturing years (peaks) and their quantities.")
  })
});


export type AnswerFleetQuestionInput = z.infer<typeof AnswerFleetQuestionInputSchema>;
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
  config: {
    maxOutputTokens: 2048,
  },
  prompt: `Você é o Frota.AI, um sistema especialista no mercado de autopeças. Sua tarefa é analisar os dados de frota fornecidos e gerar um parecer estratégico, adaptado para a persona específica do usuário. A linguagem deve ser profissional, direta e confiante, utilizando Markdown para formatação (negrito, listas).

**Análise Solicitada (Filtros Aplicados):**
{{filters}}

**Dados Resumidos para Análise:**
- **Volume Total:** {{summary.totalVehicles}}
- **Faixa Etária Predominante:** {{summary.predominantAgeBracket}}
- **Localização Principal:** {{summary.predominantRegion}}
- **Picos de Ano/Safra:** {{summary.yearPeaks}}

**Instruções Gerais:**
- Seja **direto** e **conciso**.
- Baseie sua análise **estritamente** nos dados fornecidos.
- Preencha **todos** os campos do JSON de saída.
- Responda em **português**.

---

**Persona do Usuário para Análise:** {{persona}}

**Diretrizes de Análise (Adapte para a persona acima):**

1.  **executiveSummary:**
    - **Fabricante:** Foque em volume e escala. Ex: "A frota justifica o investimento em ferramental."
    - **Representante:** Foque em argumentos de venda. Ex: "Use a concentração de frota para reforçar o estoque do cliente."
    - **Distribuidor:** Foque em otimização de estoque. Ex: "Necessidade de reforçar estoque de peças de suspensão."
    - **Lojista:** Foque em oportunidade de venda no balcão. Ex: "Oportunidade em peças de reparo rápido."
    - **Mecânico:** Foque no serviço mais recorrente. Ex: "Espere mais serviços de suspensão e freios."

2.  **ageAnalysis:**
    - Conecte a idade da frota com o ciclo de vida do produto. Frotas antigas = peças de reparo. Frotas novas = peças de manutenção.

3.  **regionalAnalysis:**
    - **Fabricante/Distribuidor:** Analise a concentração regional para otimização logística.
    - **Representante/Lojista:** Use os dados para justificar prospecção ou vendas na sua área.
    - **Mecânico:** Entenda os veículos mais comuns na sua região para se especializar.

4.  **yearAnalysis:**
    - Use os picos de ano/safra para prever ondas de demanda de componentes específicos. Ex: "Pico em 2016 indica futura demanda por componentes de grande reparo (embreagem, suspensão)."

5.  **strategicRecommendation:**
    - **Fabricante:** Recomendações sobre produção, desenvolvimento de SKU.
    - **Representante:** Recomendações sobre ações de venda práticas.
    - **Distribuidor:** Recomendações sobre gestão de estoque e logística.
    - **Lojista:** Recomendações sobre ações de venda para o balcão.
    - **Mecânico:** Recomendações sobre preparação técnica e de ferramentas.
`,
});

const answerFleetQuestionFlow = ai.defineFlow(
  {
    name: 'answerFleetQuestionFlow',
    inputSchema: AnswerFleetQuestionInputSchema,
    outputSchema: AnswerFleetQuestionOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate a response. The output was null.');
    }
    return output;
  }
);
