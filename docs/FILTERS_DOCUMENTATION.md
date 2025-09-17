# Documentação da Lógica de Filtros - Frota.AI

Este documento descreve o funcionamento detalhado do sistema de filtros de Veículo (Montadora, Modelo, Versão) e Ano de Fabricação, incluindo a lógica de cascata, interações no frontend e a comunicação com a API.

**Data do Ponto de Restauração:** 2024-10-27

## 1. Visão Geral e Objetivo

O sistema de filtros foi projetado para permitir que o usuário explore a base de dados de frotas de maneira intuitiva e precisa. A principal característica é a **lógica de cascata hierárquica**, que garante que o usuário veja apenas combinações de filtros válidas, prevenindo seleções que resultariam em zero veículos.

A hierarquia é a seguinte:
`Montadora` > `Modelo` > `Versão` / `Ano`

## 2. Lógica de Cascata e Interação do Usuário

O comportamento dos filtros é regido por uma lógica estrita de limpeza e atualização, implementada principalmente no componente `src/components/dashboard-client.tsx`.

### Fluxo de Interação:

1.  **Seleção da Montadora:**
    *   O usuário seleciona uma **Montadora**.
    *   **Ação de Limpeza:** Os filtros `model`, `version`, e `year` são imediatamente resetados (definidos como `''` ou `[]`). As opções (`filterOptions`) para `models`, `versions`, e `years` também são limpas.
    *   **Busca de Dados:** Uma chamada é feita para a API `/api/filters` passando apenas a `manufacturer`.
    *   **Resultado:** A API retorna a lista de `models` e `years` pertencentes àquela montadora. O frontend atualiza o estado para exibir essas novas opções.

2.  **Seleção do Modelo:**
    *   O usuário seleciona um **Modelo**.
    *   **Ação de Limpeza:** Os filtros `version` e `year` são resetados.
    *   **Busca de Dados:** Uma chamada é feita para a API `/api/filters` passando a `manufacturer` e o `model`.
    *   **Resultado:** A API retorna a lista de `versions` e `years` específicas para aquele modelo. O frontend exibe as novas opções. A lista de anos agora é mais refinada do que na etapa anterior.

3.  **Seleção da Versão:**
    *   O usuário seleciona uma ou mais **Versões**.
    *   **Busca de Dados:** Uma chamada é feita para a API `/api/filters` passando `manufacturer`, `model`, e a(s) `version`(s).
    *   **Resultado:** A API retorna uma lista de `years` ainda mais refinada, mostrando apenas os anos de fabricação existentes para a(s) versão(ões) selecionada(s).

4.  **Seleção do Ano:**
    *   O usuário seleciona um **Ano**.
    *   **Busca de Dados:** Uma chamada é feita para a API `/api/filters` passando `manufacturer`, `model`, e o `year`.
    *   **Resultado:** A API retorna a lista de `versions` que foram fabricadas naquele ano específico para o modelo selecionado.

Este fluxo garante que, a cada passo, o universo de opções é reduzido para refletir apenas combinações válidas.

## 3. Componentes e Lógica

### Frontend: `src/components/dashboard-client.tsx`

-   **`handleFilterChange`**: Esta é a função central que orquestra a lógica de cascata. Ela contém a lógica de limpeza dos filtros "filhos" sempre que um filtro "pai" é modificado.
-   **`useEffect` (para buscar opções dinâmicas)**: Este hook monitora as mudanças nos filtros `filters.manufacturer`, `filters.model`, e `filters.version`. Quando um deles muda, ele dispara uma nova chamada à função `getInitialFilterOptions` (que por sua vez chama a API `/api/filters`) para buscar as novas listas de opções (`models`, `versions`, `years`) e atualiza o estado `filterOptions`.

### API: `src/app/api/filters/route.ts`

-   **`GET(request)`**: O endpoint da API recebe os filtros atuais como parâmetros de URL (`manufacturer`, `model`, `version`, `year`).
-   **`getDistinctValues`**: Esta função interna monta e executa as consultas no MongoDB. Ela constrói dinamicamente um objeto de `match` com base nos filtros recebidos para buscar os valores distintos de cada campo. A lógica principal é:
    -   A busca por `models` usa apenas `manufacturer`.
    -   A busca por `versions` usa `manufacturer` e `model`.
    -   A busca por `years` usa `manufacturer`, `model`, e `version` (se disponíveis), garantindo a máxima precisão.

## 4. Casos Especiais

### Tratamento do Ano "0" como "Indefinido"

-   **API (`/api/filters/route.ts`):** A busca na API não exclui mais o ano `0`. Ela retorna o valor `0` junto com os outros anos.
-   **Frontend (`src/components/dashboard/sidebar.tsx`):** Ao renderizar o componente `SelectItem` para o filtro de ano, há uma condição que verifica se o valor é `0`. Se for, ele exibe a string "Indefinido" para o usuário. Caso contrário, exibe o número do ano.

## 5. Fluxo de Dados (Simplificado)

```
Usuário seleciona Montadora "Audi"
       |
       v
[Frontend] handleFilterChange:
  - Limpa model, version, year
  - Chama getInitialFilterOptions({ manufacturer: 'Audi' })
       |
       v
[API] /api/filters?manufacturer=Audi:
  - Busca `models` para 'Audi'
  - Busca `years` para 'Audi'
  - Retorna { models: [...], years: [...] }
       |
       v
[Frontend]
  - Atualiza o estado `filterOptions`
  - Renderiza os novos modelos e anos no sidebar

----------------------------------------------------

Usuário seleciona Modelo "80"
       |
       v
[Frontend] handleFilterChange:
  - Limpa version, year
  - Chama getInitialFilterOptions({ manufacturer: 'Audi', model: '80' })
       |
       v
[API] /api/filters?manufacturer=Audi&model=80:
  - Busca `versions` para 'Audi 80'
  - Busca `years` para 'Audi 80'
  - Retorna { versions: [...], years: [...] }
       |
       v
[Frontend]
  - Atualiza o estado `filterOptions`
  - Renderiza as novas versões e a lista de anos refinada

```

Esta arquitetura garante uma experiência de usuário robusta, previsível e livre de erros, servindo como uma base sólida para a implementação de novos filtros.
