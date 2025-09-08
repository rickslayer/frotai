'use server';

/**
 * @fileOverview This file defines a Genkit flow for predicting auto parts demand
 * based on vehicle fleet data and a specific parts category.
 */

import { ai } from '@/ai/genkit';
import { PredictPartsDemandInputSchema, PredictPartsDemandOutputSchema, type PredictPartsDemandInput, type PredictPartsDemandOutput } from '@/types';


export async function predictPartsDemand(
  input: PredictPartsDemandInput
): Promise<PredictPartsDemandOutput> {
  return predictPartsDemandFlow(input);
}


const prompt = ai.definePrompt({
  name: 'predictPartsDemandPrompt',
  input: { schema: PredictPartsDemandInputSchema },
  output: { schema: PredictPartsDemandOutputSchema },
  prompt: `Você é um engenheiro automotivo e analista de mercado sênior, especialista na indústria de autopeças do Brasil. Sua tarefa é prever a demanda por peças com base nos dados da frota de veículos fornecida e em uma categoria de peças específica.

Filtros Atuais:
- Montadora: {{{filters.manufacturer}}}
- Modelo: {{{filters.model}}}
- Categoria de Peça para Análise: {{{partCategory}}}

Distribuição da Frota por Idade:
\`\`\`json
{{{json fleetAgeBrackets}}}
\`\`\`

Instruções:
1.  Analise a distribuição da frota. Preste atenção especial às faixas etárias com o maior número de veículos (quantity). Veículos mais velhos (8-12 anos e 13+ anos) geralmente necessitam de peças de reposição de desgaste natural.
2.  Foque sua análise na **Categoria de Peça** informada: "{{partCategory}}". Se a categoria for ampla, como "freios", sugira peças específicas como "pastilhas de freio" ou "discos de freio". Se for "cabos", pense em "cabos de vela" ou "cabos de embreagem".
3.  Se a categoria não for informada, use seu conhecimento para sugerir as 3-4 categorias de peças mais prováveis para a frota em questão (ex: freios, suspensão, motor, ignição).
4.  Para cada peça prevista, forneça uma **razão** clara e concisa, ligando a idade do veículo à necessidade da peça. Ex: "Veículos com mais de 8 anos geralmente requerem a troca do kit de embreagem devido ao desgaste natural."
5.  Para cada peça, formule uma **oportunidade** de negócio clara e acionável. Ex: "Focar em kits de embreagem para [Modelo do Carro] pode capturar uma grande fatia do mercado de reposição."
6.  Seja específico para o modelo do carro, se aplicável.
7.  A resposta deve ser em português.
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
