# Documentação da Lógica de Filtros e Destaques - Frota.AI

Este documento descreve o funcionamento detalhado do sistema de filtros e destaques, que é baseado em três caminhos de análise principais: **por Localização**, **por Veículo** e **por Ano/Safra**.

**Data do Ponto de Restauração:** 2024-10-29

## 1. Visão Geral e Objetivo

O sistema de filtros foi redesenhado para guiar o usuário por múltiplos fluxos de análise, garantindo performance e clareza nos resultados. A interface agora destaca as próximas seleções mais lógicas para o usuário, evitando buscas excessivamente amplas.

A lógica de busca de dados do dashboard (`isSearchEnabled`) é acionada somente quando uma das seguintes condições de "pré-filtro" é atendida para garantir uma análise relevante:

1.  **Fluxo por Localização:** `Região` + `Estado` estão selecionados.
2.  **Fluxo por Veículo:** `Montadora` + `Modelo` (pelo menos um) estão selecionados.
3.  **Fluxo por Ano:** `Ano` + `Região` estão selecionados.


Isso evita buscas excessivamente amplas e lentas, mas permite uma exploração inicial mais flexível.

## 2. Caminhos de Análise e Destaques (`getWelcomeTitleAndHighlights`)

Quando nenhuma busca está ativa, o sistema destaca os três pontos de partida: `Região`, `Montadora` e `Ano`.

### Fluxo 01: Iniciado por Região

1.  **Tela Principal:**
    *   **Destaques:** `Ano`, `Região`, `Montadora`.

2.  **Usuário seleciona `Região`:**
    *   **Destaques:** `Estado`, `Montadora`, `Ano`.

3.  **Usuário seleciona `Estado`:**
    *   O dashboard é liberado.
    *   **Destaques sugeridos (mas não obrigatórios):** `Cidade`, `Montadora`, `Ano`.

### Fluxo 02: Iniciado por Montadora

1.  **Tela Principal:**
    *   **Destaques:** `Ano`, `Região`, `Montadora`.

2.  **Usuário seleciona `Montadora`:**
    *   **Destaques:** `Ano`, `Modelo`, `Região`.

3.  **Usuário seleciona `Modelo`:**
    *   O dashboard é liberado.
    *   **Destaques sugeridos:** `Região`, `Ano`.

### Fluxo 03: Iniciado por Ano

1.  **Tela Principal:**
    *   **Destaques:** `Ano`, `Região`, `Montadora`.

2.  **Usuário seleciona `Ano`:**
    *   **Destaques:** `Região`, `Montadora`.

3.  **Usuário seleciona `Região`:**
    *   O dashboard é liberado.
    *   **Destaques sugeridos:** `Estado`, `Montadora`.

Esta abordagem simplificada prioriza a estabilidade, permitindo que a funcionalidade de destaques seja reconstruída de forma incremental e segura.
