# Especificação da Estrutura de Dados e Lógica do Dashboard - Frota.AI

Este documento detalha a estrutura de dados JSON ideal para o banco de dados e como cada componente do dashboard (filtros e cards) deve interagir com esses dados. O objetivo é garantir performance, clareza e manutenibilidade.

## 1. Estrutura de Dados JSON Sugerida (`carros` collection)

Para otimizar as consultas e a clareza, sugiro a seguinte estrutura para cada documento no seu banco de dados MongoDB. Os nomes dos campos estão padronizados em inglês para consistência com o código.

```json
{
  "id": "rjykr9uyvz",
  "manufacturer": "YAMAHA",
  "model": "YZF",
  "version": "R3 WGP 60TH",
  "fullName": "YAMAHA/YZF R3 WGP 60TH",
  "year": 2022,
  "quantity": 1,
  "region": "SUDESTE",
  "state": "RJ",
  "city": "VOLTA REDONDA"
}
```

### Justificativa das Mudanças:

- **`manufacturer` (string):** Substitui "Marca".
- **`model` (string):** Contém apenas o nome base do modelo (ex: "STRADA", "ONIX"). Facilita a busca principal.
- **`version` (string):** Contém os detalhes da versão (ex: "FREEDOM 1.3", "1.0 MPFI JOY"). Permite a filtragem múltipla de versões dentro de um modelo.
- **`fullName` (string):** Mantém o nome completo do modelo para exibição (ex: "FIAT/STRADA FREEDOM 1.3").
- **`year` (number):** Substitui "Ano".
- **`quantity` (number):** Substitui "Quantidade".
- **`region` (string):** Campo adicionado para permitir a filtragem direta por região (ex: "SUDESTE").
- **`state` (string):** Substitui "UF" (ex: "SP", "RJ").
- **`city` (string):** Substitui "Município".

---

## 2. Lógica de Interação: Filtros

A seguir, a descrição funcional de cada filtro e como ele deve se comportar.

### a. Filtro de Região (`region`)
- **Ação do Usuário:** Seleciona uma região (ex: "Nordeste") ou "Todas as Regiões".
- **Lógica da API:**
  - Se uma região específica for selecionada, a consulta ao banco deve ser `db.carros.find({ region: "NORDESTE" })`.
  - Se "Todas as Regiões" for selecionado, este filtro é ignorado na consulta.
- **Lógica do Frontend:** Ao selecionar uma região, a lista de opções do filtro de **Estado** deve ser atualizada para mostrar apenas os estados daquela região.

### b. Filtro de Estado (`state`)
- **Ação do Usuário:** Seleciona um estado (ex: "BA") ou "Todos os Estados".
- **Lógica da API:**
  - A consulta deve ser `db.carros.find({ state: "BA" })`.
  - Se "Todos os Estados" for selecionado (dentro de uma região), o filtro de estado é ignorado.
- **Lógica do Frontend:** Ao selecionar um estado, a lista de opções do filtro de **Cidade** deve ser atualizada para mostrar apenas as cidades daquele estado.

### c. Filtro de Cidade (`city`)
- **Ação do Usuário:** Seleciona uma cidade (ex: "Salvador").
- **Lógica da API:**
  - A consulta deve ser `dbcarros.find({ city: "Salvador" })`.
- **Lógica do Frontend:** Nenhuma ação em cascata após este filtro.

### d. Filtro de Montadora (`manufacturer`)
- **Ação do Usuário:** Seleciona uma montadora (ex: "FIAT").
- **Lógica da API:**
  - A consulta deve ser `db.carros.find({ manufacturer: "FIAT" })`.
- **Lógica do Frontend:** Ao selecionar uma montadora, a lista de opções do filtro de **Modelo** deve ser atualizada.

### e. Filtro de Modelo (`model`)
- **Ação do Usuário:** Seleciona um modelo (ex: "STRADA").
- **Lógica da API:**
  - A consulta deve ser `db.carros.find({ model: "STRADA" })`.
- **Lógica do Frontend:** Ao selecionar um modelo, a lista de opções do filtro de **Versão** deve ser atualizada.

### f. Filtro de Versão (`version`)
- **Ação do Usuário:** Seleciona uma ou mais versões (ex: ["ENDURANCE 1.4", "FREEDOM 1.3"]).
- **Lógica da API:**
  - A consulta deve usar o operador `$in`: `db.carros.find({ version: { $in: ["ENDURANCE 1.4", "FREEDOM 1.3"] } })`.
- **Lógica do Frontend:** Permite seleção múltipla.

### g. Filtro de Ano (`year`)
- **Ação do Usuário:** Seleciona um ano de fabricação.
- **Lógica da API:**
  - A consulta deve ser `db.carros.find({ year: 2020 })`.
- **Lógica do Frontend:** Nenhuma ação em cascata.

---

## 3. Lógica de Interação: Cards de Visualização

Os cards recebem a lista de veículos já filtrada pela API e realizam agregações no frontend.

### a. Cards de Estatísticas (`StatCards`)
- **Total de Veículos:** Soma do campo `quantity` de todos os documentos recebidos.
- **Principal Localidade:** Agrega a `quantity` por `city` e identifica a cidade com a maior soma.
- **Principal Modelo:** Agrega a `quantity` por `fullName` e identifica o modelo com a maior soma.
- **Principal Região:** Agrega a `quantity` por `region` e identifica a região com a maior soma.
- **Principal Montadora no Estado:** Requer uma busca secundária no estado filtrado (se houver um selecionado), agregando a `quantity` por `manufacturer` para encontrar a principal.

### b. Gráfico de Top Modelos (`TopModelsChart`)
- **Lógica:** Agrega a `quantity` por `fullName` a partir dos dados recebidos, ordena o resultado em ordem decrescente e exibe os 5 ou 10 primeiros.

### c. Gráfico de Frota por Idade (`FleetAgeBracketChart`)
- **Lógica:** Para cada veículo recebido, calcula a idade (`ano atual - vehicle.year`). Agrupa as quantidades nas faixas etárias definidas (0-3, 4-7, 8-12, 13+ anos).

### d. Gráfico de Análise Regional (`RegionalFleetChart`)
- **Lógica:** Agrega a `quantity` por `region` a partir dos dados recebidos e exibe a distribuição percentual em um gráfico de pizza/rosca.

### e. Gráfico de Frota por Ano (`FleetByYearChart`)
- **Lógica:** Agrega a `quantity` por `year`, ordena por ano e exibe em um gráfico de linha para mostrar a evolução.

---

Esta especificação garante que o backend e o frontend "falem a mesma língua", resultando em uma aplicação mais rápida, confiável e fácil de manter.
