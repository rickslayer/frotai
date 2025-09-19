# Documentação da Lógica de Filtros - Frota.AI

Este documento descreve o funcionamento detalhado do sistema de filtros, que é baseado em três caminhos de análise principais: **por Localização**, **por Veículo** e **por Ano**.

**Data do Ponto de Restauração:** 2024-10-28

## 1. Visão Geral e Objetivo

O sistema de filtros foi redesenhado para guiar o usuário por três fluxos de análise distintos, garantindo performance e clareza nos resultados. A interface agora destaca "Região", "Montadora" e "Ano" como pontos de partida.

A lógica de busca de dados do dashboard (`getFleetData`) é acionada somente quando uma das seguintes condições é atendida:
1.  **Análise por Localização:** `Região` **E** `Estado` estão selecionados.
2.  **Análise por Veículo:** `Montadora` **E** `Modelo` (pelo menos um) estão selecionados.
3.  **Análise por Ano:** `Ano` **E** `Região` estão selecionados.

Isso evita buscas excessivamente amplas e lentas, como consultar a frota de um ano inteiro sem especificar uma região.

## 2. Caminhos de Análise e Interação

### Caminho 1: Análise por Localização

1.  **Seleção da Região:** O usuário seleciona uma **Região**.
2.  **Seleção do Estado:** O usuário seleciona um **Estado**.
3.  **BUSCA PRINCIPAL:** A condição (`Região` + `Estado`) é atendida. A função `getFleetData` é chamada.

### Caminho 2: Análise por Veículo

1.  **Seleção da Montadora:** O usuário seleciona uma **Montadora**.
2.  **Seleção do Modelo:** O usuário seleciona um ou mais **Modelos**.
3.  **BUSCA PRINCIPAL:** A condição (`Montadora` + `Modelo`) é atendida. A função `getFleetData` é chamada.

### Caminho 3: Análise por Ano (Safra)

1.  **Seleção do Ano:** O usuário seleciona um **Ano**.
2.  **Seleção da Região:** O usuário seleciona uma **Região**.
3.  **BUSCA PRINCIPAL:** A condição (`Ano` + `Região`) é atendida. A função `getFleetData` é chamada.


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

-   **`isSearchEnabled`**: Contém a lógica condicional principal: `(region && state) || (manufacturer && model.length > 0) || (year && region)`.
-   **`getWelcomeTitleAndHighlights`**: Determina qual texto e quais filtros destacar na tela de boas-vindas para guiar o usuário na próxima seleção.
-   **Renderização Condicional:** Exibe o `WelcomePlaceholder` se nenhuma das condições de busca for atendida, guiando o usuário sobre qual filtro selecionar a seguir.

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
  - NENHUMA busca de dados.
  - Tela de boas-vindas pede para selecionar um Estado.
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
  - Renderiza o dashboard completo.
```

Esta arquitetura de múltiplos funis oferece um equilíbrio ideal entre flexibilidade, performance e experiência do usuário.
