# Documentação da Lógica de Filtros - Frota.AI

Este documento descreve o funcionamento detalhado do sistema de filtros e destaques, que é baseado em três caminhos de análise principais: **por Localização**, **por Veículo** e **por Ano/Safra**.

**Data do Ponto de Restauração:** 2024-10-28

## 1. Visão Geral e Objetivo

O sistema de filtros foi redesenhado para guiar o usuário por múltiplos fluxos de análise, garantindo performance e clareza nos resultados. A interface agora destaca as próximas seleções mais lógicas para o usuário, evitando buscas excessivamente amplas.

A lógica de busca de dados do dashboard (`isSearchEnabled`) é acionada somente quando uma das seguintes condições é atendida:
1.  **Análise por Localização:** `Região` + `Estado`.
2.  **Análise por Veículo:** `Montadora` + `Modelo`.
3.  **Análise por Safra:** `Ano` + `Região`.


## 2. Caminhos de Análise e Destaques (`getWelcomeTitleAndHighlights`)

### Tela Principal (Nenhum Filtro)
-   **Destaques:** `Região`, `Montadora`, `Ano`.

---

### Caminho 1: Análise por Localização (Iniciado com `Região`)

1.  **Usuário seleciona `Região`:**
    *   **Destaques:** `Estado`, `Montadora`, `Ano`.

2.  **Usuário seleciona `Estado`:**
    *   **Destaques:** `Cidade`, `Montadora`, `Ano`.

---

### Caminho 2: Análise por Veículo (Iniciado com `Montadora`)

1.  **Usuário seleciona `Montadora`:**
    *   **Destaques:** `Região`, `Ano`, `Modelo`.

2.  **Seleciona `Modelo`:**
    *   **Destaques:** `Região`, `Ano`.

3.  **Seleciona `Região`:**
    *   **Destaques:** `Modelo`, `Ano`.

4.  **Seleciona `Ano`:**
    *   **Destaques:** `Região`, `Modelo`.

---

### Caminho 3: Análise por Safra (Iniciado com `Ano`)

1.  **Usuário seleciona `Ano`:**
    *   **Destaques:** `Região`, `Montadora`.

2.  **Seleciona `Região`:**
    *   **Destaques:** `Estado`, `Montadora`.

3.  **Seleciona `Montadora`:**
    *   **Destaques:** `Região`, `Modelo`.
---