# Documentação da Lógica de Filtros - Frota.AI

Este documento descreve o funcionamento detalhado do sistema de filtros, que é baseado em dois caminhos de análise principais: **por Localização** e **por Veículo**.

**Data do Ponto de Restauração:** 2024-10-28

## 1. Visão Geral e Objetivo

O sistema de filtros foi redesenhado para guiar o usuário por dois fluxos de análise distintos, garantindo performance e clareza nos resultados. A interface agora apresenta abas ("Local" e "Veículo") para tornar essa escolha explícita.

A lógica de busca de dados do dashboard (`getFleetData`) é acionada somente quando uma das seguintes condições é atendida:
1.  **Análise por Localização:** `Região` **E** `Estado` **E** (`Modelo` **ou** `Ano`) estão selecionados.
2.  **Análise por Veículo:** `Montadora` **E** `Região` **E** `Modelo` (pelo menos um) estão selecionados.

Isso evita buscas excessivamente amplas e lentas, como consultar a frota de uma região inteira sem mais especificações.

## 2. Caminhos de Análise e Interação

### Caminho 1: Análise por Localização

Este é o fluxo ideal para entender a frota de uma área geográfica específica.

1.  **Seleção da Região:**
    *   O usuário seleciona uma **Região**.
    *   **Ação:** O dashboard aguarda a seleção de um estado.

2.  **Seleção do Estado:**
    *   O usuário seleciona um **Estado**.
    *   **Ação:** O dashboard agora aguarda a seleção de um `Modelo` ou `Ano` para iniciar a busca.

3.  **Seleção do Modelo ou Ano:**
    *   O usuário seleciona um **Modelo** ou um **Ano**.
    *   **BUSCA PRINCIPAL:** A condição (`região` + `estado` + `modelo`/`ano`) é atendida. A função `getFleetData` é chamada, e o dashboard é renderizado.

### Caminho 2: Análise por Veículo

Este fluxo é ideal para entender a distribuição e as características de uma frota de veículos específica em uma grande área.

1.  **Seleção da Montadora:**
    *   O usuário seleciona uma **Montadora**.
    *   **Ação:** O dashboard aguarda a seleção de uma região.

2.  **Seleção da Região:**
    *   O usuário seleciona uma **Região**.
    *   **Ação:** O dashboard aguarda a seleção de um modelo.

3.  **Seleção do Modelo:**
    *   O usuário seleciona um ou mais **Modelos**.
    *   **BUSCA PRINCIPAL:** A condição (`montadora` + `região` + `modelo`) é atendida. A função `getFleetData` é chamada.

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

-   **`isSearchEnabled`**: Contém a lógica condicional principal: `(region && state && (model.length > 0 || year)) || (manufacturer && region && model.length > 0)`.
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
  - Estado do dashboard: { region: 'Sudeste', state: 'SP', ... }
  - NENHUMA busca de dados.
  - Tela de boas-vindas pede para selecionar um Modelo ou Ano.
       |
       v
Usuário seleciona Ano "2020"
       |
       v
[Frontend]
  - Condição (region && state && year) atendida.
  - Chama getFleetData({ region: 'Sudeste', state: 'SP', year: 2020 })
       |
       v
[API] /api/carros?region=Sudeste&state=SP&year=2020
  - Retorna dados agregados para SP no ano de 2020.
       |
       v
[Frontend]
  - Renderiza o dashboard completo.
```

Esta arquitetura de duplo funil oferece um equilíbrio ideal entre flexibilidade, performance e experiência do usuário.

    