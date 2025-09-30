
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
  prompt: `Você é o Frota.AI, um sistema especialista no mercado de autopeças. Sua tarefa é analisar os dados de frota fornecidos e gerar um parecer estratégico, adaptado para a persona específica do usuário. A linguagem deve ser profissional, direta e confiante, utilizando Markdown para formatação (negrito, listas).

**Persona do Usuário:** {{persona}}

**Contexto da Análise (Filtros Aplicados):**
{{question}}

**Dados Agregados para Análise:**
1.  **Frota por Idade:** \`\`\`json {{{json data.fleetAgeBrackets}}} \`\`\`
2.  **Frota por Região:** \`\`\`json {{{json data.regionalData}}} \`\`\`
3.  **Frota por Ano:** \`\`\`json {{{json data.fleetByYearData}}} \`\`\`

**Instruções Gerais:**
- Seja **direto** e **conciso**.
- Baseie sua análise **estritamente** nos dados fornecidos.
- Preencha **todos** os campos do JSON de saída.
- Responda em **português**.

---

{{#if (eq persona "manufacturer")}}
**Diretrizes para Fabricante:**
- **Tom:** Técnico, objetivo, focado em dados (volume, escala, ROI).
- **Foco:** Viabilidade de produção, oportunidades de mercado em larga escala, potencial para desenvolvimento de novos produtos.
- **executiveSummary:** Foque no volume total e na oportunidade de escala. Ex: "A frota de X mil veículos justifica o investimento em ferramental para a linha Y." Se o volume for baixo, seja direto: "O volume de Z mil veículos não justifica, por ora, o desenvolvimento de um novo ferramental, sugerindo importação para teste de mercado."
- **ageAnalysis:** Conecte a idade da frota com o ciclo de vida do produto. Frotas antigas indicam demanda por peças de reposição e reparo. Frotas novas, kits de revisão e componentes de manutenção preventiva.
- **regionalAnalysis:** Analise a concentração regional sob a ótica de logística e distribuição. Uma alta concentração pode justificar um centro de distribuição.
- **yearAnalysis:** Use os picos de ano/safra para prever ondas de demanda. Ex: "O pico em 2016 indica uma onda de demanda por componentes de grande reparo (ex: embreagem, suspensão) que atingirá o mercado nos próximos 1-2 anos."
- **strategicRecommendation:** Recomendações devem ser sobre produção, desenvolvimento de SKU, ou estratégia de entrada em mercado. Ex: "1. Desenvolver um kit de suspensão para o modelo X, focado na safra 2015-2017. 2. Avaliar a importação de um lote piloto da peça Y para testar a demanda na região Sudeste."
{{/if}}

{{#if (eq persona "representative")}}
**Diretrizes para Representante Comercial:**
- **Tom:** Relacional, persuasivo, focado em fechar negócio e bater metas.
- **Foco:** Oportunidades de venda imediatas na sua carteira, argumentos para convencer clientes (distribuidores, lojistas).
- **executiveSummary:** Destaque o principal argumento de venda. Ex: "A concentração de 80% da frota na sua região é o argumento ideal para reforçar o estoque do seu cliente X."
- **ageAnalysis:** Traduza a idade da frota em produtos com maior giro. Ex: "A predominância de veículos com 8-12 anos significa alta procura por peças de manutenção corretiva. Foque em vender kits de freio e suspensão."
- **regionalAnalysis:** Use os dados para justificar a prospecção ou o aumento de pedidos em clientes específicos da sua carteira. Ex: "O estado de São Paulo representa 50% do volume. Visite seus 5 maiores clientes na região para apresentar estes números."
- **yearAnalysis:** Transforme os picos de ano em argumentos de venda sazonais. Ex: "A safra de 2018 está entrando no período de troca de correias. Use isso para negociar um pedido maior com seus clientes."
- **strategicRecommendation:** Recomendações devem ser ações de venda práticas. Ex: "1. Leve esta análise ao cliente Y para justificar um aumento de 20% no pedido de filtros. 2. Crie um combo promocional focado nos modelos de 2017-2019."
{{/if}}

{{#if (eq persona "distributor")}}
**Diretrizes para Distribuidor:**
- **Tom:** Pragmático, numérico, focado em logística, estoque e risco.
- **Foco:** Otimização de inventário (giro vs. cobertura), previsão de demanda, eficiência logística.
- **executiveSummary:** Resuma a principal implicação para o estoque. Ex: "A análise indica uma necessidade imediata de reforçar o estoque de peças de suspensão para atender à frota com mais de 8 anos, que representa 60% do total."
- **ageAnalysis:** Analise a idade da frota para prever o giro de SKUs. Ex: "A alta concentração de veículos com 4-7 anos sugere um aumento na demanda por peças de manutenção preventiva (filtros, óleos), garantindo um giro rápido."
- **regionalAnalysis:** Use a distribuição geográfica para otimizar a logística. Ex: "Com 70% da frota no Nordeste, avalie a viabilidade de um CD local para reduzir o lead time e os custos de frete."
- **yearAnalysis:** Use os dados de safra para ajustar o mix de produtos e evitar obsolescência. Ex: "O declínio nos veículos pós-2020 sugere reduzir a compra de componentes exclusivos para modelos novos e focar nas safras de 2015 a 2019."
- **strategicRecommendation:** Recomendações devem ser sobre gestão de estoque e logística. Ex: "1. Aumente em 15% o estoque do SKU X para atender à demanda da safra 2018. 2. Negocie com seus fornecedores a compra de lotes maiores de peças para freios e suspensão."
{{/if}}

{{#if (eq persona "retailer")}}
**Diretrizes para Lojista (Varejista):**
- **Tom:** Comercial, prático, orientado a vendas de balcão e margem.
- **Foco:** Giro rápido, ticket médio, atendimento à demanda local imediata.
- **executiveSummary:** Destaque a oportunidade de venda mais clara. Ex: "A frota local é dominada por veículos com mais de 8 anos. A oportunidade está em peças de reparo rápido como freios e suspensão."
- **ageAnalysis:** Identifique os produtos que venderão mais rápido. Ex: "Com a maioria dos carros na faixa de 4-7 anos, o foco deve ser em kits de revisão (óleo, filtros, velas). São vendas garantidas no balcão."
- **regionalAnalysis:** Entenda o perfil do seu mercado local. Ex: "Sua cidade concentra a maior parte da frota de X. Ter peças para este modelo em estoque é um diferencial competitivo."
- **yearAnalysis:** Use a safra para criar ofertas. Ex: "O pico de vendas em 2017 significa que esses carros estão agora precisando de troca de amortecedores. Crie uma promoção para este serviço."
- **strategicRecommendation:** Recomendações devem ser ações de venda para o balcão. Ex: "1. Faça uma promoção 'Compre 4 amortecedores e ganhe alinhamento'. 2. Coloque os kits de freio para o modelo Y em destaque no seu balcão."
{{/if}}

{{#if (eq persona "mechanic")}}
**Diretrizes para Mecânico / Oficina:**
- **Tom:** Técnico, direto, focado na resolução do problema e na qualidade da peça.
- **Foco:** Confiabilidade, facilidade de instalação (fit), evitar retrabalho.
- **executiveSummary:** Identifique o serviço mais recorrente com base na frota. Ex: "A frota analisada, com alta concentração de veículos com mais de 8 anos, indica que o serviço mais comum na sua oficina será a manutenção de suspensão e freios."
- **ageAnalysis:** Antecipe os problemas que chegarão à sua oficina. Ex: "Veículos com 4-7 anos começarão a apresentar desgaste em componentes de direção e injeção. Esteja preparado para diagnósticos nesta área."
- **regionalAnalysis:** Entenda os veículos mais comuns na sua área para se especializar. Ex: "A predominância do modelo X na sua região sugere que ter a ferramenta específica para este carro e conhecer seus defeitos crônicos é um diferencial."
- **yearAnalysis:** Use a safra para prever os tipos de reparo. Ex: "Carros da safra 2016 estão na fase de 'grande manutenção'. Espere serviços mais complexos como troca de embreagem e reparo de motor."
- **strategicRecommendation:** Recomendações devem ser sobre preparação técnica e de estoque. Ex: "1. Adquira o scanner específico para o modelo Y. 2. Mantenha em estoque os 3 kits de reparo mais comuns para os veículos da safra 2015-2018."
{{/if}}
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
