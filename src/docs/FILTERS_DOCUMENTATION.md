# Documentação da Lógica de Filtros - Frota.AI

Este documento descreve o funcionamento detalhado do sistema de filtros, que é baseado em dois caminhos de análise principais: **por Localização** e **por Veículo**.

**Data do Ponto de Restauração:** 2024-10-28

## 1. Visão Geral e Objetivo

O sistema de filtros foi redesenhado para guiar o usuário por dois fluxos de análise distintos, garantindo performance e clareza nos resultados. A interface agora apresenta abas ("Local" e "Veículo") para tornar essa escolha explícita.

A lógica de busca de dados do dashboard (`getFleetData`) é acionada somente quando uma das seguintes condições é atendida:
1.  **Análise por Localização:** `Região` **E** `Estado` estão selecionados.
2.  **Análise por Veículo:** `Montadora` **E** `Região` estão selecionados.

Isso evita buscas excessivamente amplas e lentas, como consultar a frota de uma região inteira sem mais especificações.

## 2. Caminhos de Análise e Interação

### Caminho 1: Análise por Localização

Este é o fluxo ideal para entender a frota de uma área geográfica específica.

1.  **Seleção da Região:**
    *   O usuário seleciona uma **Região** na aba "Local".
    *   **Ação:** O dashboard aguarda a próxima seleção. Uma chamada é feita à API `/api/filters` para popular as opções de Estados daquela região.

2.  **Seleção do Estado:**
    *   O usuário seleciona um **Estado**.
    *   **BUSCA PRINCIPAL:** A condição (`região` + `estado`) é atendida. A função `getFleetData` é chamada, e o dashboard é renderizado com todos os dados para aquele estado.
    *   Outros filtros (cidade, montadora, etc.) podem ser aplicados para refinar ainda mais a análise.

### Caminho 2: Análise por Veículo

Este fluxo é ideal para entender a distribuição e as características de uma frota de veículos específica em uma grande área.

1.  **Seleção da Montadora:**
    *   O usuário seleciona uma **Montadora** na aba "Veículo".
    *   **Ação:** O dashboard aguarda a seleção de uma região.

2.  **Seleção da Região:**
    *   O usuário retorna à aba "Local" e seleciona uma **Região**.
    *   **BUSCA PRINCIPAL:** A condição (`montadora` + `região`) é atendida. A função `getFleetData` é chamada, e o dashboard é renderizado com os dados daquela montadora para toda a região selecionada.
    *   **Insight:** Isso permite, por exemplo, descobrir em qual **Estado** daquela região a "Fiat" tem a maior frota, uma vez que o card "Principal Estado" refletirá esse resultado.

## 3. Lógica de Cascata e Limpeza

A lógica de cascata hierárquica continua funcionando dentro de cada caminho para garantir que apenas combinações válidas sejam exibidas.

-   **`handleFilterChange`**: Orquestra a limpeza dos filtros "filhos" quando um "pai" é alterado.
    -   Mudar `Região` -> Limpa `Estado` e `Cidade`.
    -   Mudar `Estado` -> Limpa `Cidade`.
    -   Mudar `Montadora` -> Limpa `Modelo` e `Versão`.
    -   Mudar `Modelo` -> Limpa `Versão`.

-   **`useEffect` (para buscar opções dinâmicas)**: Monitora mudanças nos filtros e chama a API `/api/filters` para buscar as novas listas de opções (`models`, `versions`, `years`, `cities`, etc.) e atualizar o estado `filterOptions`.

## 4. Componentes e API

### Frontend: `src/components/dashboard-client.tsx`

-   **`useEffect` (para buscar dados do dashboard)**: Contém a lógica condicional principal: `if ((filters.region && filters.state) || (filters.manufacturer && filters.region))`.
-   **Renderização Condicional:** Exibe o `WelcomePlaceholder` se nenhuma das duas condições de busca for atendida, guiando o usuário sobre qual filtro selecionar a seguir.

### Frontend: `src/components/dashboard/sidebar.tsx`

-   Utiliza o componente `Tabs` com as abas "Local" e "Veículo" para separar visualmente os filtros e guiar o fluxo do usuário.

### API: `src/app/api/filters/route.ts` e `src/app/api/carros/route.ts`

-   As APIs continuam a funcionar como antes, respondendo às consultas com base nos filtros fornecidos. A mudança principal está no *quando* o frontend decide chamar a API de dados principais.

## 5. Fluxo de Dados (Exemplo)

**Cenário: Análise por Localização**
```
Usuário seleciona Região "Sudeste"
       |
       v
[Frontend]
  - Estado do dashboard: { region: 'Sudeste', ... }
  - NENHUMA busca de dados principais.
  - Tela de boas-vindas pede para selecionar um Estado.
  - API /api/filters busca estados do Sudeste.
       |
       v
Usuário seleciona Estado "São Paulo"
       |
       v
[Frontend]
  - Condição (region && state) atendida.
  - Chama getFleetData({ region: 'Sudeste', state: 'SP' })
       |
       v
[API] /api/carros?region=Sudeste&state=SP
  - Retorna dados agregados para SP.
       |
       v
[Frontend]
  - Renderiza o dashboard completo com os dados de SP.
```

Esta arquitetura de duplo funil oferece um equilíbrio ideal entre flexibilidade, performance e experiência do usuário.
