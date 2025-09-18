# Documentação da Lógica de Filtros - Frota.AI

Este documento descreve o funcionamento detalhado do sistema de filtros, que é baseado em dois caminhos de análise principais: **por Localização** e **por Veículo**.

**Data do Ponto de Restauração:** 2024-10-28

## 1. Visão Geral e Objetivo

O sistema de filtros foi redesenhado para guiar o usuário a fornecer um conjunto mínimo de informações coerentes antes de disparar uma busca, garantindo performance e clareza nos resultados.

A lógica de busca de dados do dashboard (`getFleetData`) é acionada somente quando uma das seguintes condições é atendida:

1.  **Análise por Localização:** `Região` **E** `Estado` **E** (`Montadora` **OU** `Ano`) estão selecionados.
2.  **Análise por Veículo:** `Montadora` **E** `Região` estão selecionados.

Isso evita buscas excessivamente amplas e lentas (como consultar uma região inteira sem especificação de veículo) ou buscas muito genéricas (como um estado inteiro sem um tipo de veículo ou ano em foco).

## 2. Caminhos de Análise e Interação

### Caminho 1: Análise por Localização (Mais Específica)

Este fluxo é ideal para entender a frota de um tipo de veículo em uma área geográfica específica.

1.  **Seleção de Local:** O usuário seleciona uma **Região** e um **Estado**.
2.  **Seleção de Veículo/Ano:** O usuário seleciona uma **Montadora** ou um **Ano**.
3.  **BUSCA PRINCIPAL:** A condição (`região` + `estado` + `montadora`/`ano`) é atendida. A função `getFleetData` é chamada, e o dashboard é renderizado com os dados para aquele escopo.

### Caminho 2: Análise por Veículo (Mais Ampla)

Este fluxo é ideal para entender a distribuição de uma frota de veículo específica em uma grande área.

1.  **Seleção de Veículo:** O usuário seleciona uma **Montadora**.
2.  **Seleção da Região:** O usuário seleciona uma **Região**.
3.  **BUSCA PRINCIPAL:** A condição (`montadora` + `região`) é atendida. A função `getFleetData` é chamada.
    *   **Insight:** Isso permite, por exemplo, descobrir em qual **Estado** daquela região a "Fiat" tem a maior frota, uma vez que o card "Principal Estado" refletirá esse resultado sem a necessidade de pré-selecionar o estado.

## 3. Lógica de Cascata e Limpeza

A lógica de cascata hierárquica continua funcionando para garantir que apenas combinações válidas sejam exibidas nos seletores.

-   **`handleFilterChange`**: Orquestra a limpeza dos filtros "filhos" quando um "pai" é alterado.
    -   Mudar `Região` -> Limpa `Estado` e `Cidade`.
    -   Mudar `Estado` -> Limpa `Cidade`.
    -   Mudar `Montadora` -> Limpa `Modelo` e `Versão`.
    -   Mudar `Modelo` -> Limpa `Versão`.

-   **`useEffect` (para buscar opções dinâmicas)**: Monitora mudanças nos filtros e chama a API `/api/filters` para buscar as novas listas de opções (`models`, `versions`, `years`, `cities`, etc.) e atualizar o estado `filterOptions`.

## 4. Componentes e API

### Frontend: `src/components/dashboard-client.tsx`

-   **`useMemo` (isSearchEnabled)**: Contém a lógica condicional principal que determina se uma busca deve ser disparada.
-   **`useEffect` (para buscar dados do dashboard)**: Monitora `isSearchEnabled` e chama `getFleetData` quando a condição se torna verdadeira.
-   **Renderização Condicional:** Exibe o `WelcomePlaceholder` se nenhuma das duas condições de busca for atendida, guiando o usuário sobre qual filtro selecionar a seguir.

### Frontend: `src/components/dashboard/sidebar.tsx`

-   Apresenta uma lista unificada de filtros, agrupados visualmente por "Localização" e "Veículo" para melhor organização.

### API: `src/app/api/filters/route.ts` e `src/app/api/carros/route.ts`

-   As APIs continuam a funcionar como antes, respondendo às consultas com base nos filtros fornecidos. A mudança principal está no *quando* o frontend decide chamar a API de dados principais.

## 5. Fluxo de Dados (Exemplo)

**Cenário: Análise por Veículo**
```
Usuário seleciona Montadora "Fiat"
       |
       v
[Frontend]
  - Estado do dashboard: { manufacturer: 'Fiat', ... }
  - NENHUMA busca de dados principais.
  - Tela de boas-vindas pede para selecionar uma Região.
  - API /api/filters busca modelos, etc.
       |
       v
Usuário seleciona Região "Sudeste"
       |
       v
[Frontend]
  - Condição (manufacturer && region) atendida.
  - Chama getFleetData({ manufacturer: 'Fiat', region: 'Sudeste' })
       |
       v
[API] /api/carros?manufacturer=Fiat&region=Sudeste
  - Retorna dados agregados para a Fiat no Sudeste.
       |
       v
[Frontend]
  - Renderiza o dashboard completo. Card "Principal Estado" mostrará "São Paulo".
```

Esta arquitetura de duplo funil oferece um equilíbrio ideal entre flexibilidade, performance e experiência do usuário.
