# Documentação da Lógica de Filtros - Frota.AI

Este documento descreve o funcionamento detalhado do sistema de filtros e destaques, que é baseado em três caminhos de análise principais: **por Localização**, **por Veículo** e **por Ano/Safra**.

**Data do Ponto de Restauração:** 2024-10-28

## 1. Visão Geral e Objetivo

O sistema de filtros foi redesenhado para guiar o usuário por múltiplos fluxos de análise, garantindo performance e clareza nos resultados. A interface agora destaca as próximas seleções mais lógicas para o usuário, evitando buscas excessivamente amplas.

A lógica de busca de dados do dashboard (`isSearchEnabled`) é acionada somente quando uma das seguintes condições é atendida:
1.  **Análise por Localização:** `Região` + `Estado` + (`Modelo` ou `Ano`).
2.  **Análise por Veículo (Geral):** `Montadora` + `Região` + `Modelo`.
3.  **Análise por Veículo (Detalhada):** `Montadora` + `Região` + `Estado` + `Modelo` + (`Ano` ou `Versão`).


## 2. Caminhos de Análise e Destaques (`getWelcomeTitleAndHighlights`)

### Tela Principal (Nenhum Filtro)
-   **Destaques:** `Região`, `Montadora`, `Ano`.

---

### Caminho 1: Análise por Localização (Iniciado com `Região`)

1.  **Usuário seleciona `Região`:**
    *   **Destaques:** `Estado`, `Montadora`, `Ano`.
    *   O dashboard aguarda a próxima seleção.

2.  **Usuário seleciona `Região` -> `Estado`:**
    *   **Destaques:** `Modelo`, `Ano`.
    *   O dashboard aguarda um detalhe de veículo para refinar a busca.

---

### Caminho 2: Análise por Veículo (Iniciado com `Montadora`)

1.  **Usuário seleciona `Montadora`:**
    *   **Destaques:** `Modelo`, `Região`, `Ano`.

2.  **Seleciona `Região`:**
    *   **Destaques:** `Modelo`, `Estado`, `Ano`.

3.  **Seleciona `Estado`:**
    *   **Destaques:** `Modelo`, `Cidade`, `Ano`.

4.  **Seleciona `Modelo`:**
    *   **Destaques:** `Ano`, `Versão`, `Cidade`.

5.  **Seleciona `Cidade`:**
    *   **Destaques:** `Ano`, `Versão`.

---

### Caminho 3: Análise por Safra (Iniciado com `Ano`)

1.  **Usuário seleciona `Ano`:**
    *   **Destaques:** `Região`, `Montadora`.

---

## 3. Condições para Liberação da Dashboard (`isSearchEnabled`)

A busca principal que renderiza o dashboard só é disparada quando uma das seguintes combinações é satisfeita:

1.  **`Região` E `Estado` E (`Modelo` > 0 OU `Ano`)**
2.  **`Montadora` E `Região` E `Modelo` > 0**
3.  **`Montadora` E `Região` E `Estado` E `Modelo` > 0 E (`Ano` OU `Versão` > 0)**

Esta arquitetura de múltiplos funis guiados oferece um equilíbrio ideal entre flexibilidade, performance e experiência do usuário.

    