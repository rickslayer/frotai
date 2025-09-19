# Documentação da Lógica de Filtros e Destaques - Frota.AI

Este documento descreve o funcionamento detalhado do sistema de filtros e destaques, que é baseado em três caminhos de análise principais: **por Localização**, **por Veículo** e **por Ano/Safra**.

**Data do Ponto de Restauração:** 2024-10-29

## 1. Visão Geral e Objetivo

O sistema de filtros foi redesenhado para guiar o usuário por múltiplos fluxos de análise, garantindo performance e clareza nos resultados. A interface agora destaca as próximas seleções mais lógicas para o usuário, evitando buscas excessivamente amplas.

A lógica de busca de dados do dashboard (`isSearchEnabled`) é acionada somente quando uma das seguintes condições de "pré-filtro" é atendida para garantir uma análise relevante:

1.  **Fluxo 1 (Localização -> Veículo/Ano):** `Região` + `Estado` + `Montadora` + (`Modelo` ou `Ano`).
2.  **Fluxo 2 (Veículo -> Localização):** `Montadora` + `Região` + `Modelo`.
3.  **Fluxo 3 (Ano -> Localização/Veículo):** `Ano` + `Região` + `Estado` + `Montadora` + `Modelo`.

Isso evita buscas excessivamente amplas e lentas, como consultar toda a frota de um estado sem especificar um veículo ou ano.

## 2. Caminhos de Análise e Destaques (`getWelcomeTitleAndHighlights`)

### Fluxo 01: Iniciado por Região

1.  **Tela Principal:**
    *   **Destaques:** `Ano`, `Região`, `Montadora`.

2.  **Usuário seleciona `Região`:**
    *   **Destaques:** `Estado`, `Montadora`, `Ano`.

3.  **Usuário seleciona `Estado`:**
    *   **Destaques:** `Cidade`, `Montadora`, `Ano`.

4.  **Usuário seleciona `Montadora` (dentro do Fluxo 1):**
    *   **Destaques:** `Ano`, `Modelo`.
    *   **Liberação do Dashboard:** A busca é liberada ao selecionar um `Modelo` ou um `Ano`.

### Fluxo 02: Iniciado por Montadora

1.  **Tela Principal:**
    *   **Destaques:** `Ano`, `Região`, `Montadora`.

2.  **Usuário seleciona `Montadora`:**
    *   **Destaques:** `Ano`, `Modelo`, `Região`.

3.  **Usuário seleciona `Ano`:**
    *   **Destaques:** `Região`, `Modelo`.

4.  **Usuário seleciona `Região`:**
    *   **Destaques:** `Cidade`, `Modelo`.
    *   **Liberação do Dashboard:** A busca é liberada ao selecionar um `Modelo`.

### Fluxo 03: Iniciado por Ano

1.  **Tela Principal:**
    *   **Destaques:** `Ano`, `Região`, `Montadora`.

2.  **Usuário seleciona `Ano`:**
    *   **Destaques:** `Região`, `Montadora`.

3.  **Usuário seleciona `Região`:**
    *   **Destaques:** `Estado`, `Montadora`.

4.  **Usuário seleciona `Estado`:**
    *   **Destaques:** `Montadora`, `Cidade`.

5.  **Usuário seleciona `Montadora`:**
    *   **Destaques:** `Modelo`, `Cidade`.

6.  **Usuário seleciona `Cidade`:**
    *   **Destaques:** `Modelo`.
    *   **Liberação do Dashboard:** A busca é liberada ao selecionar um `Modelo`.
```