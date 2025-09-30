
'use server';

/**
 * @fileOverview This file defines a Genkit flow for predicting auto parts demand
 * based on vehicle fleet data and a specific parts category.
 */

import { ai } from '@/ai/genkit';
import { PredictPartsDemandInputSchema, PredictPartsDemandOutputSchema, PersonaSchema } from '@/types';
import type { PredictPartsDemandInput, PredictPartsDemandOutput } from '@/types';
import { z } from 'zod';

const InternalPredictPartsDemandInputSchema = PredictPartsDemandInputSchema.extend({
    persona: z.object({
        manufacturer: z.boolean().optional(),
        representative: z.boolean().optional(),
        distributor: z.boolean().optional(),
        retailer: z.boolean().optional(),
        mechanic: z.boolean().optional(),
    }).describe('The user profile for whom the analysis is being generated.'),
});


export async function predictPartsDemand(
  input: PredictPartsDemandInput
): Promise<PredictPartsDemandOutput> {
  return predictPartsDemandFlow(input);
}


const prompt = ai.definePrompt({
  name: 'predictPartsDemandPrompt',
  input: { schema: InternalPredictPartsDemandInputSchema },
  output: { schema: PredictPartsDemandOutputSchema },
  prompt: `Você é o Frota.AI, um sistema especialista na indústria de autopeças. Sua tarefa é prever a demanda por peças para a frota filtrada, gerando insights acionáveis e adaptados para a persona do usuário.

**Filtros Atuais:**
- Montadora: {{{filters.manufacturer}}}
- Modelo: {{{filters.model}}}
- Categoria de Peça (Opcional): {{{partCategory}}}

**Dados da Frota por Idade:**
\`\`\`json
{{{json fleetAgeBrackets}}}
\`\`\`

**Instruções Gerais:**
- Analise a categoria de peça "{{partCategory}}". Se for "freios", sugira "pastilhas". Se for "motor", "kit de correia". Se nenhuma categoria for informada, sugira as 3 categorias mais prováveis para a frota em questão.
- Para cada peça, forneça uma **razão** curta, ligando a idade do veículo à necessidade da peça.
- A resposta deve ser específica para os dados e filtros, e em português.

---

{{#if persona.manufacturer}}
**Diretrizes para Fabricante:**
- **Tom:** Focado em escala e oportunidade de produção.
- **Oportunidade (opportunity):** Formule a oportunidade em termos de desenvolvimento de produto ou market share. Ex: "Desenvolver uma linha de kits de correia com preço competitivo para esta faixa de frota" ou "Oportunidade para aumentar a participação no mercado de amortecedores para veículos com mais de 5 anos."
{{/if}}

{{#if persona.representative}}
**Diretrizes para Representante Comercial:**
- **Tom:** Focado em argumentos de venda e metas.
- **Oportunidade (opportunity):** Formule a oportunidade como um argumento para o cliente. Ex: "Argumento chave para convencer o distribuidor a aumentar o pedido de pastilhas de freio em 15%."
{{/if}}

{{#if persona.distributor}}
**Diretrizes para Distribuidor:**
- **Tom:** Focado em giro de estoque e logística.
- **Oportunidade (opportunity):** Formule a oportunidade em termos de gestão de inventário. Ex: "Reforçar o estoque de kits de embreagem para garantir o fill rate e aproveitar a demanda sazonal."
{{/if}}

{{#if persona.retailer}}
**Diretrizes para Lojista (Varejista):**
- **Tom:** Focado em vendas de balcão e margem.
- **Oportunidade (opportunity):** Formule a oportunidade como uma ação de venda direta. Ex: "Aumentar o estoque de pastilhas de freio para atender donos de veículos com 5+ anos, garantindo venda rápida no balcão."
{{/if}}

{{#if persona.mechanic}}
**Diretrizes para Mecânico / Oficina:**
- **Tom:** Focado em serviço e qualidade técnica.
- **Oportunidade (opportunity):** Formule a oportunidade em termos de serviço a ser oferecido. Ex: "Oferecer ativamente a troca do kit de correias para veículos desta faixa de frota que chegarem para revisão."
{{/if}}
`,
});


const predictPartsDemandFlow = ai.defineFlow(
  {
    name: 'predictPartsDemandFlow',
    inputSchema: PredictPartsDemandInputSchema,
    outputSchema: PredictPartsDemandOutputSchema,
  },
  async (input) => {
    const internalInput: z.infer<typeof InternalPredictPartsDemandInputSchema> = {
      ...input,
      persona: {
        [input.persona]: true,
      }
    };

    const { output } = await prompt(internalInput);
    if (!output) {
      throw new Error('AI failed to generate a response. The output was null.');
    }
    return output!;
  }
);

    