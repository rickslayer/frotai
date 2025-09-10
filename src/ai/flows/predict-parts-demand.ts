
'use server';

/**
 * @fileOverview This file defines a Genkit flow for predicting auto parts demand
 * based on vehicle fleet data and a specific parts category.
 */

import { ai } from '@/ai/genkit';
import { PredictPartsDemandInputSchema, PredictPartsDemandOutputSchema, FleetAgeBracketSchema } from '@/types';
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
  prompt: `O Frota.AI, com base em seu conhecimento da indústria de autopeças do Brasil, irá prever a demanda por peças com base nos dados da frota de veículos fornecida e em uma categoria de peças específica.

A análise é *estritamente* baseada nos dados a seguir, que representam uma frota filtrada.

Filtros Atuais Aplicados (Contexto):
- Montadora: {{{filters.manufacturer}}}
- Modelo: {{{filters.model}}}
- Categoria de Peça para Análise: {{{partCategory}}}

Distribuição da Frota por Idade (Dados para Análise):
\`\`\`json
{{{json fleetAgeBrackets}}}
\`\`\`

Instruções:
1.  Analise a distribuição da frota fornecida. Dê atenção especial às faixas etárias com o maior número de veículos (quantity). Veículos mais velhos (8-12 anos e 13+ anos) geralmente necessitam de mais peças de reposição.
2.  Foque a análise na **Categoria de Peça** informada: "{{partCategory}}". Se a categoria for ampla (ex: "freios"), sugira peças específicas (ex: "pastilhas de freio"). Se for "cabos", pense em "cabos de vela". Se nenhuma categoria for informada, use o motor de análise do Frota.AI para sugerir as 3-4 categorias de peças mais prováveis para a frota *em questão*.
3.  Para cada peça prevista, forneça uma **razão** clara e concisa, ligando a idade do veículo (com base nos dados de 'fleetAgeBrackets') à necessidade da peça.
4.  Para cada peça, formule uma **oportunidade** de negócio clara e acionável.
5.  Seja específico para o modelo do carro, se aplicável, com base nos filtros.
6.  A resposta deve ser em português.
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
