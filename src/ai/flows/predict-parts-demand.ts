
'use server';

/**
 * @fileOverview This file defines a Genkit flow for predicting auto parts demand
 * based on vehicle fleet data and a specific parts category.
 */

import { ai } from '@/ai/genkit';
import { PredictPartsDemandInputSchema, PredictPartsDemandOutputSchema } from '@/types';
import type { PredictPartsDemandInput, PredictPartsDemandOutput } from '@/types';


export async function predictPartsDemand(
  input: PredictPartsDemandInput
): Promise<PredictPartsDemandOutput> {
  return predictPartsDemandFlow(input);
}


const prompt = ai.definePrompt({
  name: 'predictPartsDemandPrompt',
  input: { schema: PredictPartsDemandInputSchema },
  output: { schema: PredictPartsDemandOutputSchema },
  prompt: `O Frota.AI, com base em seu conhecimento da indústria de autopeças do Brasil, irá prever a demanda por peças com base nos dados da frota de veículos fornecida e em uma categoria de peças específica. A análise deve ser curta, direta e focada em valor mensurável.

A análise é *estritamente* baseada nos dados a seguir, que representam uma frota filtrada. A resposta final não pode ser cortada.

**Filtros Atuais Aplicados (Contexto):**
- Montadora: {{{filters.manufacturer}}}
- Modelo: {{{filters.model}}}
- Categoria de Peça para Análise: {{{partCategory}}}

**Distribuição da Frota por Idade (Dados para Análise):**
\`\`\`json
{{{json fleetAgeBrackets}}}
\`\`\`

**Instruções (Seja Direto e Conciso):**
1.  **Foco na Categoria:** Analise a categoria de peça "{{partCategory}}". Se for "freios", sugira "pastilhas". Se for "motor", sugira "kit de correia". Se nenhuma categoria for informada, sugira as 3 categorias mais prováveis para a frota em questão.
2.  **Conecte Dados e Demanda:** Para cada peça, forneça uma **razão** curta, ligando a idade do veículo (com base nos dados de 'fleetAgeBrackets') à necessidade da peça.
3.  **Oportunidade Clara:** Formule uma **oportunidade** de negócio em uma única frase acionável.
4.  **Sem Redundância:** Evite texto genérico. A resposta deve ser específica para os dados e filtros fornecidos, e em português.
`,
});


const predictPartsDemandFlow = ai.defineFlow(
  {
    name: 'predictPartsDemandFlow',
    inputSchema: PredictPartsDemandInputSchema,
    outputSchema: PredictPartsDemandOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
