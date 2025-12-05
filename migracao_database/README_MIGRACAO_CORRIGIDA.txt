
╔══════════════════════════════════════════════════════════════════════════════╗
║             MIGRAÇÃO CORRIGIDA - JURISCONNECT 2025                           ║
║                   (Estrutura Real do Banco)                                   ║
╚══════════════════════════════════════════════════════════════════════════════╝

⚠️  IMPORTANTE: ENUMS DO BANCO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Antes de executar os scripts, verifique os valores ENUM permitidos no seu banco:

1. enum_demandas_tipo_demanda
   → No script está como 'audiencia'
   → Verifique: SELECT unnest(enum_range(NULL::enum_demandas_tipo_demanda));

2. enum_demandas_status
   → Usei: 'em_andamento', 'concluida', 'cancelada'
   → Verifique: SELECT unnest(enum_range(NULL::enum_demandas_status));

3. enum_demandas_prioridade
   → Usei: 'media'
   → Verifique: SELECT unnest(enum_range(NULL::enum_demandas_prioridade));

Se os valores não baterem, edite os scripts ou ajuste os ENUMs antes de executar.

📋 ESTRUTURA DOS DADOS MIGRADOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. CLIENTES (223 registros)
   - nome_fantasia: Nome do solicitante/cliente
   - telefone: Telefone principal
   - cidade: Cidade extraída da planilha
   - estado: UF (quando disponível)
   - ativo: true (padrão)
   - created_at/updated_at: NOW()

2. CORRESPONDENTES (510 registros)
   - nome_fantasia: Nome do correspondente
   - telefone: Telefone de contato
   - cidade_sediado: Cidade sede
   - estado_sediado: UF da sede
   - cidades_atendidas: Mesma da sede (pode ser expandido depois)
   - ativo: true (padrão)
   - created_at/updated_at: NOW()

3. DEMANDAS (1409 registros)
   - numero: Gerado no formato "YYYY-MM-SSSS" (ano-mês-sequencial)
   - titulo: Tipo da diligência da planilha
   - descricao: Processo + Local (quando disponíveis)
   - tipo_demanda: 'audiencia' (VERIFICAR ENUM!)
   - status: 'em_andamento', 'concluida' ou 'cancelada'
   - prioridade: 'media'
   - data_prazo: Data agendada da planilha
   - data_inicio: Mesma data agendada
   - data_conclusao: Preenchida se status='concluida'
   - valor_estimado: Valor cliente
   - valor_cobrado: Valor cliente
   - valor_custo: Custo correspondente
   - cidade/estado: Extraídos da planilha
   - observacoes: Nº Doc (quando disponível)
   - cliente_id: FK para clientes (posição sequencial)
   - correspondente_id: FK para correspondentes (ou NULL se interno)
   - created_at/updated_at: NOW()

🔧 COMO EXECUTAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PASSO 1: Verifique os ENUMs
────────────────────────────
No SQL Editor do Supabase, execute:

SELECT unnest(enum_range(NULL::enum_demandas_tipo_demanda));
SELECT unnest(enum_range(NULL::enum_demandas_status));
SELECT unnest(enum_range(NULL::enum_demandas_prioridade));

Anote os valores permitidos e, se necessário, edite os scripts SQL
substituindo 'audiencia', 'em_andamento', 'media' pelos valores corretos.

PASSO 2: Execute os scripts na ordem
─────────────────────────────────────
1. 01_migracao_clientes_CORRIGIDO.sql
2. 02_migracao_correspondentes_CORRIGIDO.sql
3. 03_migracao_demandas_CORRIGIDO.sql

Ou execute o arquivo único:
4. MIGRACAO_COMPLETA_CORRIGIDA.sql

PASSO 3: Valide os dados
─────────────────────────
-- Contar registros
SELECT 'clientes' as tabela, COUNT(*) as total FROM clientes
UNION ALL
SELECT 'correspondentes', COUNT(*) FROM correspondentes
UNION ALL
SELECT 'demandas', COUNT(*) FROM demandas;

-- Verificar integridade referencial
SELECT COUNT(*) as demandas_sem_cliente
FROM demandas
WHERE cliente_id NOT IN (SELECT id FROM clientes);
-- Esperado: 0

-- Top 5 clientes
SELECT c.nome_fantasia, COUNT(d.id) as total_demandas
FROM clientes c
LEFT JOIN demandas d ON c.id = d.cliente_id
GROUP BY c.id, c.nome_fantasia
ORDER BY total_demandas DESC
LIMIT 5;

📊 ESTATÍSTICAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Clientes:        223 registros
Correspondentes: 510 registros
Demandas:        1.409 registros

Faturamento total: R$ 290.565,03
Custos totais:     R$ 117.779,41
Lucro bruto:       R$ 172.785,62

Top 3 Clientes:
  1. Jessica (191 demandas)
  2. Vinicius Andrade (179 demandas)
  3. LACOSTA ADVOGADOS (70 demandas)

Top 3 Correspondentes:
  1. Geiciele Paula da Rosa (154 demandas)
  2. Joao Tomaz da Silva (90 demandas)
  3. Amanda Pivott (51 demandas)

╔══════════════════════════════════════════════════════════════════════════════╗
║                         FIM DA DOCUMENTAÇÃO                                   ║
╚══════════════════════════════════════════════════════════════════════════════╝
