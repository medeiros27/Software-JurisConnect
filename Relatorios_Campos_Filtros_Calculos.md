# JURISCONNECT - Relatórios Completos com Campos, Filtros e Cálculos

## 📋 ÍNDICE DE RELATÓRIOS

1. [Relatórios Financeiros](#1-relatórios-financeiros)
2. [Relatórios de Desempenho](#2-relatórios-de-desempenho)
3. [Relatórios de Operações](#3-relatórios-de-operações)
4. [Relatórios Executivos](#4-relatórios-executivos)
5. [Relatórios de Conformidade](#5-relatórios-de-conformidade)
6. [Exportação e Agendamento](#6-exportação-e-agendamento)

---

# 1. RELATÓRIOS FINANCEIROS

## 1.1 Relatório de Receita Mensal

**Descrição:** Consolidado de faturamento, receita e projeções

**Campos Principais:**

| Campo | Tipo | Origem | Cálculo |
|-------|------|--------|---------|
| Mês/Ano | Date | Sistema | - |
| Total Faturado | Currency | demandas.concluidas | SUM(valor_final) |
| Total Recebido | Currency | pagamentos.completo | SUM(valor_pago) |
| Saldo Devido | Currency | Calculado | Total Faturado - Total Recebido |
| Taxa Recebimento | % | Calculado | (Total Recebido / Total Faturado) × 100 |
| Demandas Concluídas | Integer | demandas | COUNT(status='CONCLUIDA') |
| Valor Médio/Demanda | Currency | Calculado | Total Faturado / Demandas Concluídas |

**Filtros Disponíveis:**

```
├─ Período (Date Range)
│  └─ Padrão: Mês atual
├─ Cliente (Multi-select)
│  └─ Vazio = Todos
├─ Correspondente (Multi-select)
│  └─ Vazio = Todos
├─ Especialidade (Multi-select)
│  └─ Vazio = Todas
├─ Forma Pagamento (Multi-select)
│  ├─ PIX
│  ├─ Boleto
│  ├─ Transferência
│  ├─ Cheque
│  └─ Dinheiro
└─ Status Demanda
   ├─ Concluída
   ├─ Parcial
   └─ Atrasada
```

**Fórmulas de Cálculo:**

```sql
-- Total Faturado (Demandas concluídas no período)
SELECT SUM(d.valor_final) as total_faturado
FROM demandas d
WHERE d.status = 'CONCLUIDA'
  AND d.data_conclusao BETWEEN :data_inicio AND :data_fim
  AND (:cliente_id IS NULL OR d.cliente_id = :cliente_id)
  AND (:correspondente_id IS NULL OR d.correspondente_id = :correspondente_id);

-- Total Recebido (Pagamentos completos no período)
SELECT SUM(p.valor_pago) as total_recebido
FROM pagamentos p
WHERE p.status = 'COMPLETO'
  AND p.data_recebimento BETWEEN :data_inicio AND :data_fim
  AND (:cliente_id IS NULL OR p.cliente_id = :cliente_id);

-- Saldo Devido
SELECT 
  total_faturado - total_recebido as saldo_devido,
  (total_recebido / NULLIF(total_faturado, 0)) * 100 as taxa_recebimento
FROM (
  SELECT SUM(...) total_faturado, SUM(...) total_recebido
) subquery;

-- Valor Médio por Demanda
SELECT SUM(valor_final) / COUNT(*) as valor_medio
FROM demandas
WHERE status = 'CONCLUIDA' AND data_conclusao BETWEEN...;
```

**Visualizações:**

```
┌─────────────────────────────────────────────┐
│ RECEITA MENSAL - NOVEMBRO 2025             │
├─────────────────────────────────────────────┤
│                                             │
│ Total Faturado:      R$ 125.500,00   📈    │
│ Total Recebido:      R$ 95.000,00    ✓     │
│ Saldo Devido:        R$ 30.500,00    ⚠️    │
│ Taxa Recebimento:    75,7%           📊    │
│ Demandas Concluídas: 12              📋    │
│ Valor Médio:         R$ 10.458,33    💰    │
│                                             │
├─ Gráfico Linha: Faturado vs Recebido      │
├─ Gráfico Pizza: Distribuição por cliente   │
└─ Gráfico Coluna: Demandas por especialidade│
```

**Formato de Exportação:**

```
PDF:
├─ Cabeçalho: Logo + Título + Data geração
├─ Cards resumo (coloridos)
├─ Gráficos embarcados
├─ Tabela detalhada
├─ Rodapé: Gerado em [timestamp]
└─ A4 Portrait

Excel:
├─ Aba 1: Resumo (formatada)
├─ Aba 2: Detalhe (tabela pivô)
├─ Aba 3: Gráficos (embarcados)
└─ Auto-fit colunas + Filtros

CSV:
├─ Separador: Vírgula
├─ Encoding: UTF-8
├─ Headers: Sim
└─ Simples, sem formatação
```

---

## 1.2 Relatório de Fluxo de Caixa

**Descrição:** Análise de entrada/saída por dia, semana, mês

**Período Padrão:** 90 dias

**Campos Principais:**

| Campo | Tipo | Fórmula |
|-------|------|---------|
| Data | Date | - |
| Recebimentos | Currency | SUM(pagamentos.valor_pago) |
| Faturamentos | Currency | SUM(demandas.valor_final) |
| Saldo Acumulado | Currency | Running total |
| Diferença Dia | Currency | Recebimentos - Faturamentos |
| Taxa Realização | % | (Recebimentos / Faturamentos) × 100 |

**Fórmula SQL:**

```sql
WITH diario AS (
  SELECT 
    DATE(p.data_recebimento) as data,
    SUM(p.valor_pago) as recebimentos_dia
  FROM pagamentos p
  WHERE p.data_recebimento BETWEEN :data_inicio AND :data_fim
  GROUP BY DATE(p.data_recebimento)
  
  UNION ALL
  
  SELECT 
    DATE(d.data_conclusao) as data,
    -SUM(d.valor_final) as faturamentos_dia
  FROM demandas d
  WHERE d.data_conclusao BETWEEN :data_inicio AND :data_fim
    AND d.status = 'CONCLUIDA'
  GROUP BY DATE(d.data_conclusao)
)
SELECT 
  data,
  SUM(recebimentos_dia) OVER (ORDER BY data) as acumulado,
  recebimentos_dia
FROM diario
ORDER BY data;
```

**Gráficos:**

```
Gráfico 1: Linha dupla (Recebimentos vs Faturamentos)
├─ Eixo X: Data (diário)
├─ Eixo Y: R$ (valores)
├─ Linha verde: Recebimentos (acumulado)
├─ Linha vermelha: Faturamentos (acumulado)
└─ Mostra tendência

Gráfico 2: Barras (Diferença diária)
├─ Positivo (verde): Dia com +
├─ Negativo (vermelho): Dia com -
└─ Mostra volatilidade

Gráfico 3: Área (Saldo acumulado)
├─ Área verde se positivo
├─ Área vermelha se negativo
└─ Mostra saúde financeira
```

---

## 1.3 Relatório de Cobranças em Aberto

**Descrição:** Todas as faturas pendentes, parciais ou atrasadas

**Campos:**

| Campo | Tipo | Condicional |
|-------|------|------------|
| Nº Fatura | String | - |
| Cliente | String | - |
| Correspondente | String | - |
| Data Emissão | Date | - |
| Data Vencimento | Date | - |
| Dias Atraso | Integer | IF vencida: DATEDIFF(hoje, vencimento) |
| Valor Total | Currency | - |
| Valor Recebido | Currency | - |
| Saldo | Currency | Valor Total - Valor Recebido |
| Status | Enum | PENDENTE / PARCIAL / ATRASADO |
| % Recebido | % | (Valor Recebido / Valor Total) × 100 |

**Filtros:**

```
├─ Status (Multi-select)
│  ├─ Pendente (não vencido)
│  ├─ Parcial (50-99% recebido)
│  └─ Atrasado (vencido)
├─ Data Vencimento (Range)
├─ Cliente (Multi-select)
├─ Valor (Range) em R$
└─ Ordenar por
   ├─ Dias atraso (DESC)
   ├─ Valor (DESC)
   ├─ Cliente (ASC)
   └─ Vencimento (ASC)
```

**Fórmula:**

```sql
SELECT 
  p.numero_fatura,
  c.razao_social as cliente,
  corr.nome_fantasia as correspondente,
  p.data_emissao,
  p.data_vencimento,
  CASE 
    WHEN p.data_vencimento < CURDATE() 
    THEN DATEDIFF(CURDATE(), p.data_vencimento)
    ELSE 0
  END as dias_atraso,
  p.valor_total,
  p.valor_recebido,
  (p.valor_total - p.valor_recebido) as saldo,
  CASE 
    WHEN p.status = 'COMPLETO' THEN 'RECEBIDO'
    WHEN p.valor_recebido = 0 AND p.data_vencimento >= CURDATE() THEN 'PENDENTE'
    WHEN p.valor_recebido = 0 AND p.data_vencimento < CURDATE() THEN 'ATRASADO'
    WHEN p.valor_recebido > 0 AND p.valor_recebido < p.valor_total THEN 'PARCIAL'
  END as status,
  (p.valor_recebido / NULLIF(p.valor_total, 0)) * 100 as pct_recebido
FROM pagamentos p
JOIN clientes c ON p.cliente_id = c.id
JOIN correspondentes corr ON p.correspondente_id = corr.id
WHERE p.status != 'CANCELADO'
ORDER BY dias_atraso DESC, p.valor_total DESC;
```

**Subtotais por Status:**

```
PENDENTE:
├─ Total: R$ 45.000,00
└─ Quantidade: 12 faturas

PARCIAL:
├─ Total: R$ 8.500,00 (saldo)
└─ Quantidade: 3 faturas (média 72% recebida)

ATRASADO:
├─ Total: R$ 30.500,00 (saldo)
├─ Quantidade: 5 faturas
└─ Atraso médio: 18 dias

TOTAL DEVIDO: R$ 84.000,00
```

---

## 1.4 Relatório de Receita por Correspondente

**Descrição:** Faturamento, receita e performance individual

**Campos:**

| Campo | Tipo | Cálculo |
|-------|------|---------|
| Correspondente | String | - |
| Especialidade | String | - |
| Demandas Concluídas | Integer | COUNT(status='CONCLUIDA') |
| Faturamento | Currency | SUM(valor_final) |
| Receita Recebida | Currency | SUM(pagamentos.valor_pago) |
| Saldo Aberto | Currency | Faturamento - Receita |
| Taxa Realização | % | (Receita / Faturamento) × 100 |
| Valor Médio | Currency | Faturamento / Demandas |
| Ticket Médio | Days | Dias médios para conclusão |
| Ranking | Integer | Ordenação por receita |

**Fórmula SQL:**

```sql
SELECT 
  corr.id,
  corr.nome_fantasia,
  esp.nome as especialidade,
  COUNT(DISTINCT d.id) as demandas_concluidas,
  SUM(d.valor_final) as faturamento,
  COALESCE(SUM(p.valor_pago), 0) as receita_recebida,
  SUM(d.valor_final) - COALESCE(SUM(p.valor_pago), 0) as saldo_aberto,
  ROUND((COALESCE(SUM(p.valor_pago), 0) / NULLIF(SUM(d.valor_final), 0)) * 100, 2) as taxa_realizacao,
  ROUND(SUM(d.valor_final) / NULLIF(COUNT(DISTINCT d.id), 0), 2) as valor_medio,
  ROUND(AVG(DATEDIFF(d.data_conclusao, d.data_criacao)), 0) as ticket_medio_dias,
  ROW_NUMBER() OVER (ORDER BY SUM(d.valor_final) DESC) as ranking
FROM correspondentes corr
LEFT JOIN demandas d ON corr.id = d.correspondente_id AND d.status = 'CONCLUIDA'
LEFT JOIN especialidades esp ON d.especialidade_id = esp.id
LEFT JOIN pagamentos p ON d.id = p.demanda_id AND p.status = 'COMPLETO'
WHERE d.data_conclusao BETWEEN :data_inicio AND :data_fim
GROUP BY corr.id, corr.nome_fantasia, esp.nome
ORDER BY ranking;
```

**Visualizações:**

```
Tabela Principal:
├─ Ordenação: Receita (DESC)
├─ Ranking visual (1º, 2º, 3º, etc)
└─ Cores: Verde (>80% realização), Amarelo (60-80%), Vermelho (<60%)

Gráfico 1: Barras (Receita por correspondente)
├─ Top 10 correspondentes
├─ Ordenado por receita
└─ Valor sobre barra

Gráfico 2: Linha (Taxa realização)
├─ Tendência ao longo do período
└─ Meta: 80% realização

Gráfico 3: Scatter (Demandas vs Faturamento)
├─ Bubble chart
├─ Tamanho: Classificação média
└─ Posição: Demandas vs Receita
```

---

# 2. RELATÓRIOS DE DESEMPENHO

## 2.1 Relatório de Performance Correspondente (Individual)

**Descrição:** Análise detalhada de um correspondente específico

**Período:** Últimos 90 dias (customizável)

**Seções:**

### Seção 1: KPIs Principais

```
┌─────────────────────────────────────┐
│ PERFORMANCE - [Nome Correspondente] │
├─────────────────────────────────────┤
│                                     │
│ Demandas Concluídas: 12       ✓     │
│ Taxa Conclusão: 92%           ✈️    │
│ Tempo Médio: 18 dias          ⏱️    │
│ Classificação: 4.7★           ⭐    │
│ Receita Gerada: R$ 125.500    💰    │
│ Taxa Recebimento: 85%         📈    │
│                                     │
└─────────────────────────────────────┘
```

### Seção 2: Tabela de Demandas

```
| Protocolo | Cliente | Especialidade | Início | Conclusão | Valor | Status |
|-----------|---------|---------------|--------|-----------|-------|--------|
| DEM-0001  | XYZ Inc | Civil         | 01/Nov | 18/Nov   | R$ 5.5k | Paga |
| DEM-0005  | ABC Co  | Criminal      | 03/Nov | 15/Nov   | R$ 7.2k | Pendente |
```

### Seção 3: Evolução Temporal

```
SQL:
SELECT 
  DATE_TRUNC('week', d.data_conclusao) as semana,
  COUNT(*) as demandas,
  SUM(d.valor_final) as receita,
  AVG(DATEDIFF(d.data_conclusao, d.data_criacao)) as dias_medio
FROM demandas d
WHERE d.correspondente_id = :id
  AND d.status = 'CONCLUIDA'
  AND d.data_conclusao >= CURDATE() - INTERVAL 90 DAY
GROUP BY DATE_TRUNC('week', d.data_conclusao)
ORDER BY semana;
```

### Seção 4: Análise por Especialidade

```
Especialidade | Demandas | Receita | Taxa Sucesso | Tempo Médio
Civil         | 8        | R$ 85k  | 95%          | 16 dias
Penal         | 3        | R$ 32k  | 87%          | 22 dias
Trabalhista   | 1        | R$ 8.5k | 100%         | 12 dias
```

---

## 2.2 Relatório de Avaliações de Clientes

**Descrição:** Avaliações e satisfação por correspondente

**Campos:**

| Campo | Tipo | Fonte |
|-------|------|-------|
| Correspondente | String | - |
| Demandas Avaliadas | Integer | COUNT(avaliacoes) |
| Classificação Média | Decimal | AVG(estrelas) 1-5 |
| Distribuição Estrelas | % | Contagem por nível |
| Aspecto Qualidade | % | Média satisfação |
| Aspecto Prazo | % | Média satisfação |
| Aspecto Comunicação | % | Média satisfação |
| Aspecto Valor | % | Média satisfação |

**Fórmula:**

```sql
SELECT 
  corr.nome_fantasia,
  COUNT(DISTINCT av.id) as avaliados,
  ROUND(AVG(av.estrelas), 2) as media_estrelas,
  ROUND(COUNT(CASE WHEN av.estrelas = 5 THEN 1 END) * 100.0 / COUNT(*), 1) as pct_5_estrelas,
  ROUND(COUNT(CASE WHEN av.estrelas = 4 THEN 1 END) * 100.0 / COUNT(*), 1) as pct_4_estrelas,
  ROUND(COUNT(CASE WHEN av.estrelas = 3 THEN 1 END) * 100.0 / COUNT(*), 1) as pct_3_estrelas,
  ROUND(COUNT(CASE WHEN av.estrelas <= 2 THEN 1 END) * 100.0 / COUNT(*), 1) as pct_negativas,
  ROUND(AVG(CASE WHEN av.aspecto = 'QUALIDADE' THEN av.estrelas END), 2) as avg_qualidade,
  ROUND(AVG(CASE WHEN av.aspecto = 'PRAZO' THEN av.estrelas END), 2) as avg_prazo,
  ROUND(AVG(CASE WHEN av.aspecto = 'COMUNICACAO' THEN av.estrelas END), 2) as avg_comunicacao,
  ROUND(AVG(CASE WHEN av.aspecto = 'VALOR' THEN av.estrelas END), 2) as avg_valor
FROM correspondentes corr
LEFT JOIN avaliacoes av ON corr.id = av.correspondente_id
WHERE av.data_criacao BETWEEN :data_inicio AND :data_fim
GROUP BY corr.id, corr.nome_fantasia
ORDER BY media_estrelas DESC;
```

**Visualizações:**

```
Gráfico 1: Barras horizontais (Média por correspondente)
├─ Ordenado por classificação (DESC)
├─ Cor: Verde (>4.0), Amarelo (3-4), Vermelho (<3)
└─ Mostra quantidade de avaliações

Gráfico 2: Radar chart (Aspectos)
├─ Qualidade
├─ Prazo
├─ Comunicação
├─ Valor
└─ Comparação entre correspondentes

Gráfico 3: Pizza (Distribuição estrelas)
├─ 5 estrelas (verde escuro)
├─ 4 estrelas (verde claro)
├─ 3 estrelas (amarelo)
├─ 2 estrelas (laranja)
└─ 1 estrela (vermelho)
```

---

# 3. RELATÓRIOS DE OPERAÇÕES

## 3.1 Relatório de Demandas por Status

**Descrição:** Análise de distribuição de demandas por estado

**Campos:**

| Status | Quantidade | % Total | Tempo Médio | Valor Total | Ação |
|--------|-----------|---------|-------------|------------|------|
| ABERTA | 15 | 12% | - | - | Iniciar |
| EM_PROGRESSO | 28 | 22% | 14 dias | R$ 285k | Monitorar |
| AGUARD_CLIENTE | 8 | 6% | 8 dias | R$ 92k | Follow-up |
| CONCLUIDA | 65 | 52% | 18 dias | R$ 682k | Faturar |
| CANCELADA | 8 | 6% | - | - | Arquivar |
| SUSPENSA | 1 | 2% | - | - | Reativar |

**Fórmula SQL:**

```sql
SELECT 
  d.status,
  COUNT(*) as quantidade,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as pct_total,
  ROUND(AVG(DATEDIFF(CURDATE(), d.data_criacao)), 0) as dias_medio,
  SUM(d.valor_final) as valor_total
FROM demandas d
WHERE d.data_criacao >= CURDATE() - INTERVAL 90 DAY
GROUP BY d.status
ORDER BY quantidade DESC;
```

---

## 3.2 Relatório de Diligências Críticas

**Descrição:** Diligências próximas a vencer ou atrasadas

**Campos:**

| Prioridade | Diligência | Demanda | Responsável | Prazo | Dias Restantes | Status |
|-----------|-----------|--------|------------|-------|---|--------|
| 🔴 CRÍTICO | Parecer | DEM-0001 | João Silva | 02/Nov | -1 dia | ATRASADA |
| 🟠 URGENTE | Petição | DEM-0005 | Maria Santos | 04/Nov | +1 dia | VENCE HOJE |
| 🟡 AVISO | Despacho | DEM-0010 | Pedro Costa | 08/Nov | +5 dias | PENDENTE |

**Fórmula:**

```sql
SELECT 
  CASE 
    WHEN data_prazo < CURDATE() THEN 'ATRASADA'
    WHEN data_prazo = CURDATE() THEN 'VENCE_HOJE'
    WHEN DATEDIFF(data_prazo, CURDATE()) <= 3 THEN 'URGENTE'
    ELSE 'NORMAL'
  END as status,
  DATEDIFF(data_prazo, CURDATE()) as dias_restantes,
  * 
FROM diligencias
WHERE status IN ('PENDENTE', 'EM_PROGRESSO', 'ATRASADA')
ORDER BY data_prazo ASC;
```

---

## 3.3 Relatório de Prazos Processuais

**Descrição:** Controle de prazos por tipo de ação

**Campos:**

| Tipo Ação | Prazo Máximo | Demandas | No Prazo | Atrasadas | % Cumprimento |
|-----------|-------------|----------|---------|----------|---|
| Ação de Cobrança | 180 dias | 12 | 11 | 1 | 91% |
| Ação de Despejo | 120 dias | 8 | 8 | 0 | 100% |
| Defesa | 90 dias | 15 | 13 | 2 | 87% |
| Revisão Contrato | 60 dias | 6 | 6 | 0 | 100% |
| Parecer Jurídico | 30 dias | 22 | 20 | 2 | 91% |

**Fórmula:**

```sql
SELECT 
  d.tipo_acao,
  CASE 
    WHEN d.tipo_acao = 'COBRANCA' THEN 180
    WHEN d.tipo_acao = 'DESPEJO' THEN 120
    WHEN d.tipo_acao = 'DEFESA' THEN 90
    WHEN d.tipo_acao = 'REVISAO_CONTRATO' THEN 60
    WHEN d.tipo_acao = 'PARECER' THEN 30
  END as prazo_maximo_dias,
  COUNT(*) as total_demandas,
  COUNT(CASE WHEN dias_duracao <= prazo_maximo THEN 1 END) as no_prazo,
  COUNT(CASE WHEN dias_duracao > prazo_maximo THEN 1 END) as atrasadas,
  ROUND(COUNT(CASE WHEN dias_duracao <= prazo_maximo THEN 1 END) * 100.0 / COUNT(*), 1) as pct_cumprimento
FROM demandas d
WHERE d.status = 'CONCLUIDA'
GROUP BY d.tipo_acao;
```

---

# 4. RELATÓRIOS EXECUTIVOS

## 4.1 Dashboard Executivo (Resumo)

**Descrição:** KPIs principais do negócio em uma página

**Seções:**

### 1. Cards Métricas Principais

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ FATURAMENTO  │  │ RECEITA      │  │ SALDO DEVIDO │
│ R$ 125.500   │  │ R$ 95.000    │  │ R$ 30.500    │
│ 📈 +18% mês  │  │ ✓ +12% mês   │  │ ⚠️ -5% mês   │
└──────────────┘  └──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ DEMANDAS     │  │ TAXA         │  │ TICKET MÉDIO │
│ 12 concluídas│  │ 75,7% receita│  │ R$ 10.458    │
│ 28 em andamento  │ 📊 Status OK │  │ ⏱️ 18 dias   │
└──────────────┘  └──────────────┘  └──────────────┘
```

### 2. Gráficos de Contexto

```
Gráfico 1: Linha (Receita últimos 30 dias)
├─ Linha com pontos
├─ Média móvel (7 dias)
└─ Projeção para fim de mês

Gráfico 2: Pizza (Demandas por status)
├─ Concluída: 52% (verde)
├─ Em progresso: 22% (azul)
├─ Aberta: 12% (amarelo)
├─ Cancelada: 6% (vermelho)
└─ Outros: 8% (cinza)

Gráfico 3: Barras (Top 5 correspondentes)
├─ Por receita
├─ Últimas 4 semanas
└─ Comparação mês anterior
```

### 3. Tabelas Resumidas

```
Top Clientes por Faturamento:
1. Escritório XYZ - R$ 45.000
2. Empresa ABC - R$ 28.500
3. Dept Jurídico - R$ 22.000
...

Demandas Críticas (próximas vencer):
- Parecer Civil (João Silva) - Vence 02/Nov
- Petição Criminal (Maria) - Vence 03/Nov
- Despacho (Pedro) - Vence 05/Nov
...
```

---

## 4.2 Relatório de Análise Comparativa (Mês vs Mês)

**Descrição:** Comparação de performance entre períodos

**Estrutura:**

```
Métrica          | Nov 2025 | Out 2025 | Variação | %
-----------------|----------|----------|----------|---
Faturamento      | R$ 125k  | R$ 110k  | +R$ 15k  | +13,6%
Receita          | R$ 95k   | R$ 82k   | +R$ 13k  | +15,9%
Demandas Concl   | 12       | 11       | +1       | +9,1%
Taxa Realização  | 75,7%    | 74,5%    | +1,2pp   | +1,6%
Correspondentes  | 8        | 7        | +1       | +14,3%
Ticket Médio     | 18 dias  | 19 dias  | -1 dia   | -5,3%
```

**Fórmula:**

```sql
WITH mes_atual AS (
  -- Cálculos para mês atual (Nov 2025)
  SELECT 
    SUM(d.valor_final) as faturamento,
    COALESCE(SUM(p.valor_pago), 0) as receita,
    COUNT(DISTINCT d.id) as demandas,
    ...
  FROM demandas d
  LEFT JOIN pagamentos p ON d.id = p.demanda_id
  WHERE MONTH(d.data_conclusao) = 11 AND YEAR(d.data_conclusao) = 2025
),
mes_anterior AS (
  -- Cálculos para mês anterior (Out 2025)
  ...
  WHERE MONTH(d.data_conclusao) = 10 AND YEAR(d.data_conclusao) = 2025
)
SELECT 
  atual.faturamento,
  anterior.faturamento,
  atual.faturamento - anterior.faturamento as variacao,
  ROUND(((atual.faturamento - anterior.faturamento) / anterior.faturamento) * 100, 1) as pct_variacao
FROM mes_atual atual, mes_anterior anterior;
```

---

# 5. RELATÓRIOS DE CONFORMIDADE

## 5.1 Relatório de Auditoria (Logs de Acesso)

**Descrição:** Rastreamento de todas as ações no sistema

**Campos:**

| Data | Hora | Usuário | Ação | Recurso | Resultado | IP | Duração |
|------|------|---------|------|---------|-----------|-----|---------|
| 02/Nov | 14:30 | João Silva | CREATE | Demanda | SUCESSO | 192.168.1.100 | 245ms |
| 02/Nov | 14:35 | Maria Santos | UPDATE | Diligência | SUCESSO | 192.168.1.105 | 187ms |
| 02/Nov | 14:40 | Admin | DELETE | Cliente | FALHA | 192.168.1.110 | 142ms |

**Filtros:**

```
├─ Período (Date Range)
├─ Usuário (Select)
├─ Tipo Ação (CREATE, READ, UPDATE, DELETE)
├─ Resultado (SUCESSO, FALHA)
├─ Recurso (Demanda, Cliente, Correspondente, etc)
└─ Severidade (CRÍTICA, ALTA, MÉDIA, BAIXA)
```

---

## 5.2 Relatório de Conformidade LGPD

**Descrição:** Rastreamento de dados pessoais e consentimentos

**Campos:**

| Tipo Dado | Total Registros | Com Consentimento | Sem Consentimento | Criptografado | Status |
|-----------|-----------------|-------------------|-------------------|---|--------|
| CPF | 245 | 245 | 0 | ✓ | OK |
| Email | 312 | 310 | 2 | ✓ | ALERTA |
| Telefone | 289 | 285 | 4 | ✓ | ALERTA |
| Endereço | 312 | 305 | 7 | ✓ | ALERTA |

**SQL:**

```sql
SELECT 
  tipo_dado,
  COUNT(*) as total,
  COUNT(CASE WHEN consentimento = 1 THEN 1 END) as com_consentimento,
  COUNT(CASE WHEN consentimento = 0 THEN 1 END) as sem_consentimento,
  COUNT(CASE WHEN criptografado = 1 THEN 1 END) as criptografados,
  CASE 
    WHEN COUNT(CASE WHEN consentimento = 0 THEN 1 END) = 0 THEN 'OK'
    ELSE 'ALERTA'
  END as status
FROM dados_pessoais
GROUP BY tipo_dado;
```

---

# 6. EXPORTAÇÃO E AGENDAMENTO

## 6.1 Formatos de Exportação Suportados

### PDF

```
├─ Renderização: Server-side (HeadlessChrome / Puppeteer)
├─ Tamanho página: A4 / Carta
├─ Orientação: Portrait / Landscape
├─ Cabeçalho: Logo + Título + Período
├─ Rodapé: Número página + Data geração
├─ Gráficos: Embarcados (PNG)
├─ Tabelas: Formatadas com cores
├─ Assinatura digital: Opcional
└─ Tamanho arquivo: Típico 2-10MB
```

### Excel (XLSX)

```
├─ Biblioteca: ExcelJS / OpenPyXL
├─ Abas: 
│  ├─ Aba 1: Resumo (formatado)
│  ├─ Aba 2: Detalhes (tabela com filtros)
│  ├─ Aba 3: Gráficos
│  └─ Aba 4: Dados brutos (se > 100k linhas)
├─ Formatação:
│  ├─ Headers em azul + bold
│  ├─ Moeda em R$ com 2 decimais
│  ├─ Percentual em %
│  ├─ Data em dd/mm/yyyy
│  └─ Células mescladas em resumo
├─ Validação dados: Sim (ranges)
├─ Gráficos: Embarcados
└─ Tamanho: Típico 500KB - 5MB
```

### CSV

```
├─ Encoding: UTF-8 BOM
├─ Separador: Vírgula (,)
├─ Aspas: Campos com vírgula/quebra
├─ Headers: Sim (primeira linha)
├─ Formatação: Nenhuma (dados puros)
├─ Moeda: Numérica sem símbolo
├─ Compatibilidade: Excel / Google Sheets / Python
└─ Tamanho: Mínimo (dados brutos)
```

### JSON

```
├─ Estrutura:
│  {
│    "relatorio": "Receita Mensal",
│    "periodo": "2025-11-01 a 2025-11-30",
│    "data_geracao": "2025-11-02T14:30:00Z",
│    "resumo": { ... },
│    "dados": [ ... ],
│    "graficos": [ ... ]
│  }
├─ Uso: API / Integração sistemas
├─ Validação: Schema JSON
└─ Encoding: UTF-8
```

---

## 6.2 Agendamento de Relatórios

**Descrição:** Geração e envio automático de relatórios

**Configuração:**

```
Relatório:     [Receita Mensal]
Frequência:    [Mensal] / [Semanal] / [Diário]
Dia/Hora:      [1º dia mês às 08:00]
Destinatários: [user@company.com; admin@company.com]
Formato:       [PDF] [Excel] [CSV]
Filtros:       
  ├─ Cliente: [Todos]
  ├─ Especialidade: [Civil, Trabalhista]
  └─ Status: [Concluída]
```

**Implementação:**

```javascript
// Cron job exemplo (node-cron)
const cron = require('node-cron');

// Executar todo 1º dia do mês às 08:00
cron.schedule('0 8 1 * *', async () => {
  const relatorio = await gerarRelatorioReceitaMensal({
    data_inicio: primeiroDiaDoMes(),
    data_fim: ultimoDiaDoMes()
  });
  
  const pdf = await exportarPDF(relatorio);
  const excel = await exportarExcel(relatorio);
  
  await enviarEmail({
    destinatarios: ['user@company.com', 'admin@company.com'],
    assunto: `Relatório Receita - ${mesAtual()}`,
    corpo: 'Veja em anexo os relatórios gerados automaticamente.',
    anexos: [pdf, excel]
  });
  
  // Log sucesso
  await LogAgendamento.create({
    tipo_relatorio: 'RECEITA_MENSAL',
    data_execucao: new Date(),
    status: 'SUCESSO',
    destinatarios_enviados: 2
  });
});
```

**Opções Avançadas:**

```
├─ Notificação de erro: Sim / Não
├─ Retenção: 30 / 90 / 365 dias
├─ Compactação: ZIP se > 5MB
├─ Criptografia PDF: Opcional (senha)
├─ Marca d'água: "CONFIDENCIAL" (opcional)
├─ Retry automático: Sim (3 tentativas)
└─ Log de execução: Sempre mantém
```

---

## 6.3 API de Relatórios

**Endpoints:**

```
GET /api/relatorios/:tipo
  └─ Retorna relatório mais recente
  └─ Query params: formato (pdf, excel, csv, json)

POST /api/relatorios/:tipo/gerar
  ├─ Body: { data_inicio, data_fim, filtros }
  └─ Retorna: { url_download, id_relatorio }

GET /api/relatorios/:id/download
  └─ Download direto do arquivo

GET /api/relatorios/:tipo/agendados
  └─ Lista relatórios agendados

POST /api/relatorios/:tipo/agendar
  ├─ Body: { frequencia, dia, hora, formato, destinatarios }
  └─ Retorna: { id_agendamento, proxima_execucao }

DELETE /api/relatorios/:id/agendar
  └─ Cancela agendamento
```

---

**Relatórios Completos - Especificação v1.0** ✅