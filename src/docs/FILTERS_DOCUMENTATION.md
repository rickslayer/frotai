
# Documentação da Lógica de Filtros - Frota.AI

Este documento descreve o funcionamento detalhado do sistema de filtros e destaques para guiar a análise do usuário.

**Data do Ponto de Restauração:** 2024-10-28

## 1. Visão Geral e Objetivo

O sistema de filtros foi desenhado para guiar o usuário por três caminhos de análise principais: **por Localização**, **por Veículo** e **por Ano/Safra**. Para tornar a experiência mais intuitiva, a interface destaca (faz piscar) os próximos filtros recomendados em cada etapa.

A busca principal de dados (`getFleetData`) é acionada quando uma das seguintes condições é atendida para garantir performance e resultados relevantes:
1.  **Análise por Localização:** `Região` **E** `Estado` estão selecionados.
2.  **Análise por Veículo:** `Montadora` **E** `Modelo` (pelo menos um) estão selecionados.
3.  **Análise por Ano:** `Ano` **E** `Região` estão selecionados.

## 2. Lógica de Destaques (Piscadas)

A função `getWelcomeTitleAndHighlights` no frontend determina quais filtros devem piscar para guiar o usuário.

### **Estado Inicial (Tela Principal)**
- **Condição:** Nenhum filtro ativo.
- **Destaques:** `Região`, `Montadora`, `Ano`.
- **Objetivo:** Apresentar os três principais pontos de partida para a análise.

### **Caminho 1: Usuário inicia pela `Região`**
- **1.1. Selecionou `Região`:**
  - **Destaques:** `Estado`, `Montadora`, `Ano`.
  - **Lógica:** O usuário pode tanto aprofundar a localização (selecionando um `Estado`) quanto cruzar a região com uma `Montadora` ou `Ano`.
- **1.2. Selecionou `Região` e `Estado`:**
  - **Destaques:** `Cidade`, `Montadora`, `Ano`.
  - **Lógica:** Com a localização base definida, o usuário pode refinar ainda mais a cidade ou cruzar com dados de `Montadora` ou `Ano`.

### **Caminho 2: Usuário inicia pela `Montadora`**
- **2.1. Selecionou `Montadora`:**
  - **Destaques:** `Região`, `Ano`, `Modelo`.
  - **Lógica:** Pede um contexto geográfico (`Região`), de safra (`Ano`) ou de `Modelo` para continuar.
- **2.2. Selecionou `Montadora` e `Modelo`:**
  - **Destaques:** `Região`, `Ano`.
  - **Lógica:** Com o veículo definido, o próximo passo lógico é cruzar com `Região` ou `Ano`.
- **2.3. Selecionou `Montadora` e `Região`:**
  - **Destaques:** `Modelo`, `Ano`.
  - **Lógica:** Pede para especificar o `Modelo` ou cruzar com um `Ano`.

### **Caminho 3: Usuário inicia pelo `Ano`**
- **3.1. Selecionou `Ano`:**
  - **Destaques:** `Região`, `Montadora`.
  - **Lógica:** Uma safra precisa ser contextualizada por `Região` ou `Montadora`.
- **3.2. Selecionou `Ano` e `Região`:**
  - **Destaques:** `Estado`, `Montadora`.
  - **Lógica:** O usuário pode aprofundar a localização (`Estado`) ou cruzar com uma `Montadora`.
- **3.3. Selecionou `Ano` e `Montadora`:**
  - **Destaques:** `Região`, `Modelo`.
  - **Lógica:** Pede um contexto geográfico (`Região`) ou um `Modelo` específico.

Esta arquitetura guiada assegura que o usuário explore os dados de forma eficiente, seguindo os caminhos de análise mais relevantes para o negócio.

    