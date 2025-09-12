# Especificação da Estrutura de Dados e Lógica dos Componentes - Frota.AI

Este documento descreve a estrutura de dados ideal para os arquivos JSON a serem consumidos pelo dashboard Frota.AI e detalha a lógica de funcionamento de cada componente de filtro e visualização de dados. O objetivo é garantir performance, clareza e manutenibilidade.

---

## Seção 1: Estrutura Ideal do Arquivo JSON (`carros.json`)

Para otimizar as consultas e a manipulação de dados no frontend, cada registro de veículo no arquivo JSON deve seguir a estrutura abaixo. Esta estrutura é "plana", utiliza nomes de campo padronizados em inglês e separa o modelo da versão para filtragem mais precisa.

### Estrutura de um Registro de Veículo

```json
{
  "id": "12345",
  "manufacturer": "FIAT",
  "model": "STRADA",
"version": "ENDURANCE 1.4",
  "fullName": "STRADA ENDURANCE 1.4",
  "year": 2021,
  "quantity": 15,
  "state": "SP",
  "city": "São Paulo"
}
```

### Descrição de Cada Campo

| Campo          | Tipo     | Descrição                                                                                                  | Exemplo                  |
| :--------------- | :------- | :--------------------------------------------------------------------------------------------------------- | :----------------------- |
| `id`           | `string` | Identificador único para o registro (pode ser gerado a partir da combinação de outros campos, se necessário). | `"12345"`                |
| `manufacturer` | `string` | Nome da montadora do veículo, em maiúsculas.                                                               | `"FIAT"`                 |
| `model`        | `string` | Nome base do modelo do veículo, em maiúsculas.                                                             | `"STRADA"`               |
| `version`      | `string` | Detalhes da versão do veículo, em maiúsculas. Se não houver versão, o campo pode ser uma string vazia `""`.  | `"ENDURANCE 1.4"`        |
| `fullName`     | `string` | O nome completo do veículo (`model` + `version`), usado para exibição e em buscas gerais.                    | `"STRADA ENDURANCE 1.4"` |
| `year`         | `number` | Ano de fabricação do veículo.                                                                                | `2021`                   |
| `quantity`     | `number` | Quantidade de veículos para essa combinação específica de atributos.                                         | `15`                     |
| `state`        | `string` | Sigla da Unidade Federativa (UF), em maiúsculas.                                                             | `"SP"`                   |
| `city`         | `string` | Nome do município.                                                                                           | `"São Paulo"`            |

---

## Seção 2: Lógica Funcional dos Filtros

Os filtros na barra lateral são o principal meio de interação do usuário. A lógica deles funciona em cascata para refinar progressivamente os dados exibidos. A fonte de dados para as opções de cada filtro é derivada da massa de dados completa (`allData`).

1.  **Filtro de Região (`region`)**
    *   **Ação:** Filtra a lista de estados (`states`) disponíveis para exibir apenas aqueles pertencentes à região selecionada.
    *   **Lógica:** Ao selecionar uma região (ex: "Sudeste"), o filtro de Estado passa a listar apenas 'SP', 'RJ', 'MG', 'ES'. A API recebe `region=Sudeste` e busca no banco todos os documentos cujo campo `state` pertença à lista de estados daquela região. A opção "Todas as Regiões" (`value="all"`) não aplica filtro geográfico no nível da API.

2.  **Filtro de Estado (`state`)**
    *   **Ação:** Filtra a lista de cidades (`cities`) e refina os dados da aplicação.
    *   **Lógica:** Ao selecionar um estado (ex: "SP"), o filtro de Cidade passa a listar apenas as cidades daquele estado. A API recebe `state=SP` e busca no banco todos os documentos com `state: "SP"`.

3.  **Filtro de Cidade (`city`)**
    *   **Ação:** Refina os dados para mostrar apenas os de uma cidade específica.
    *   **Lógica:** A API recebe `city=São Paulo` e busca no banco todos os documentos com `city: "São Paulo"`.

4.  **Filtro de Montadora (`manufacturer`)**
    *   **Ação:** Filtra a lista de modelos (`models`) disponíveis.
    *   **Lógica:** Ao selecionar uma montadora (ex: "FIAT"), o filtro de Modelo passa a listar apenas modelos daquela montadora. A API recebe `manufacturer=FIAT` e busca no banco por `manufacturer: "FIAT"`.

5.  **Filtro de Modelo (`model`)**
    *   **Ação:** Filtra a lista de versões (`versions`) disponíveis.
    *   **Lógica:** Ao selecionar um modelo (ex: "STRADA"), o filtro de Versão passa a listar apenas as versões daquele modelo. A API recebe `model=STRADA` e busca por `model: "STRADA"`.

6.  **Filtro de Versão (`version`)**
    *   **Ação:** Permite a seleção múltipla de versões de um modelo.
    *   **Lógica:** A API recebe um array de versões (ex: `version=ENDURANCE 1.4&version=VOLCANO 1.3`) e busca no banco documentos cujo campo `version` esteja na lista fornecida.

7.  **Filtro de Ano (`year`)**
    *   **Ação:** Filtra os veículos por um ano de fabricação específico.
    *   **Lógica:** A API recebe `year=2021` e busca por `year: 2021`.

---

## Seção 3: Lógica Funcional dos Cards de Informação

Os cards no painel principal reagem aos dados filtrados (`filteredData`) para exibir métricas e visualizações.

1.  **Stat Cards (Cards de Estatísticas)**
    *   **Total de Veículos:** Soma o campo `quantity` de todos os registros em `filteredData`.
    *   **Principal Montadora no Estado:** Se um estado está selecionado, agrega os dados por `manufacturer` dentro daquele estado e exibe o que tiver a maior soma de `quantity`.
    *   **Principal Cidade:** Agrega os dados em `filteredData` por `city` e exibe a cidade com a maior soma de `quantity`.
    *   **Principal Modelo:** Agrega os dados em `filteredData` por `fullName` e exibe o modelo com a maior soma de `quantity`.
    *   **Principal Região:** Agrega os dados em `filteredData` por região (mapeando `state` para região) и exibe a região com a maior soma de `quantity`.

2.  **Análise de Frota Regional (`RegionalFleetChart`)**
    *   **Função:** Exibir a distribuição percentual e absoluta da frota (`quantity`) entre as 5 grandes regiões do Brasil.
    *   **Lógica:** O componente recebe `filteredData`. Ele itera sobre os dados, usando um mapa (`stateToRegionMap`) para associar o `state` de cada registro à sua respectiva região. Ele então soma as `quantity` para cada uma das 5 regiões e exibe os resultados em um gráfico de pizza.

3.  **Top 10 Modelos (`TopModelsChart`)**
    *   **Função:** Mostrar os 5 ou 10 modelos de veículos mais numerosos na seleção atual.
    *   **Lógica:** O componente recebe `filteredData`, agrega os veículos pelo campo `fullName` (somando as `quantity`), ordena o resultado em ordem decrescente e exibe os 5 ou 10 primeiros em um gráfico de barras horizontais.

4.  **Frota por Ano de Fabricação (`FleetByYearChart`)**
    *   **Função:** Exibir a evolução da frota ao longo dos anos.
    *   **Lógica:** Agrega os dados de `filteredData` por `year`, somando as `quantity` para cada ano. Exibe o resultado em um gráfico de linhas, com o eixo X representando o ano e o eixo Y a quantidade.

5.  **Frota por Faixa Etária (`FleetAgeBracketChart`)**
    *   **Função:** Classificar a frota em categorias de idade (Novos, Seminovos, Usados, Antigos).
    *   **Lógica:** Calcula a idade de cada veículo (`ano atual - year`). Agrupa as `quantity` nas faixas predefinidas (0-3 anos, 4-7 anos, etc.) e exibe a distribuição em um gráfico de barras.

6.  **Análise Final e Previsão de Demanda (Componentes de IA)**
    *   **Função:** Enviar os dados agregados (distribuição por idade, por região, etc.) para os fluxos de IA da Genkit.
    *   **Lógica:** Os componentes (`FinalAnalysis`, `PartDemandForecast`) coletam os dados já processados pelos outros componentes (como `fleetAgeBrackets`) e os enviam como contexto para os prompts da IA, que então retornam as análises textuais.
