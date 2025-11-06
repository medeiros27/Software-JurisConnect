# JURISCONNECT - Especificação Funcional Completa (PRD)

## 📋 ÍNDICE EXECUTIVO

**Versão:** 1.0  
**Data:** 02 de Novembro de 2025  
**Público:** Advogados, Escritórios, Departamentos Jurídicos Brasileiros  
**Status:** Pronto para Desenvolvimento

---

## 📊 MÓDULOS DO SISTEMA

1. **Gestão de Clientes (CRM)** - 25 funcionalidades
2. **Gestão de Correspondentes** - 22 funcionalidades
3. **Gestão de Demandas** - 35 funcionalidades
4. **Módulo Financeiro** - 28 funcionalidades
5. **Agenda e Controle de Prazos** - 18 funcionalidades
6. **Dashboard e Relatórios** - 20 funcionalidades
7. **Gestão Documental com OCR** - 15 funcionalidades

**TOTAL: 163 Funcionalidades Implementadas**

---

# 1. GESTÃO DE CLIENTES (CRM) - 25 Funcionalidades

## 1.1 Cadastro de Cliente

### 1.1.1 Funcionalidade: Registrar Novo Cliente

**Descrição:** Permitir registro completo de novo cliente (escritório, empresa, departamento jurídico)

**User Story:**
```
Como gerenciador do sistema,
Eu quero registrar um novo cliente com informações completas,
Para manter base de dados atualizada e segmentada por tipo
```

**Campos de Formulário:**

| Campo | Tipo | Obrigatório | Validação | Máx | Nota |
|-------|------|---|---|---|---|
| Tipo Cliente | Dropdown | Sim | - | - | Escritório, Empresa, Dept. Jurídico, PJ, Pessoa Física |
| Razão Social | Text | Sim | Min 3 carac | 255 | Nome legal |
| Nome Fantasia | Text | Não | - | 255 | Nome comercial |
| CNPJ/CPF | Text | Sim | Validação dígitos | 20 | Máscara: XX.XXX.XXX/XXXX-XX ou XXX.XXX.XXX-XX |
| Inscrição Estadual | Text | Não | - | 50 | Opcional para PJ |
| Email Principal | Email | Sim | RFC 5322 | 255 | Recebe notificações |
| Telefone Comercial | Phone | Sim | Validação DD | 20 | Máscara: (XX) XXXXX-XXXX |
| Whatsapp | Phone | Não | Validação DD | 20 | Com número internacional +55 |
| Estado Sediado | Dropdown | Sim | 27 UFs | - | Estados brasileiros |
| Cidade | Text | Sim | - | 100 | Autocomplete de IBGE |
| CEP | Text | Sim | Regex XXXXX-XXX | 10 | Busca automática endereço |
| Rua | Text | Sim | - | 255 | Via pública |
| Número | Text | Sim | - | 10 | Número predial |
| Complemento | Text | Não | - | 255 | Apto, sala, bloco |
| Bairro | Text | Sim | - | 100 | - |
| Referência Jurídica | Text | Não | - | 500 | Contexto da captação |
| Ramo Atuação | Dropdown | Sim | 30+ opções | - | Civil, Trabalhista, Penal, etc |
| Tamanho | Dropdown | Sim | - | - | Pequeno, Médio, Grande |
| Contato Principal | Text | Sim | - | 100 | Nome responsável |
| Email Contato | Email | Sim | RFC 5322 | 255 | Email direto |
| Telefone Contato | Phone | Sim | Validação | 20 | Direto para contato |
| Classificação Risco | Dropdown | Sim | Baixo/Médio/Alto | - | Análise prévia |
| Limite Crédito | Currency | Não | > 0 | - | R$ máximo |
| Dias Prazo Pagamento | Number | Sim | 1-90 | - | Padrão: 30 dias |
| Observações | Textarea | Não | - | 2000 | Notas internas |

**Critérios de Aceitação:**

```
✓ DADO que um usuário preenche formulário de novo cliente
  E todos os campos obrigatórios são preenchidos
  QUANDO clica "Salvar"
  ENTÃO cliente é criado com sucesso
  E recebe ID único no sistema
  E dispara notificação "Cliente criado"

✓ DADO CNPJ/CPF fornecido
  QUANDO valida-se com algoritmo de dígito verificador
  ENTÃO verifica se não existe duplicata
  E bloqueia registro duplicado com mensagem específica

✓ DADO CEP fornecido
  QUANDO clica-se em buscar
  ENTÃO puxa dados de API ViaCEP automaticamente
  E preenche: rua, bairro, cidade, estado

✓ DADO cliente com tipo "Pessoa Física"
  QUANDO salva-se registro
  ENTÃO Inscrição Estadual fica VAZIA (não obrigatória)
  E CNPJ validado como CPF
```

**Regras de Negócio Específicas Jurídicas:**

1. **Classificação de Risco:** Algoritmo automático baseado em:
   - Histórico de pagamentos
   - Volume de demandas
   - Tempo de relacionamento
   - Avaliação do especialista jurídico

2. **Limite de Crédito:** Cálculo automático:
   - Baixo (< 3 meses): Limite = (Volume médio mensal × 1)
   - Médio (3-12 meses): Limite = (Volume médio mensal × 2)
   - Alto (> 12 meses): Limite = (Volume médio mensal × 3)

3. **Validação Jurídica CNPJ:**
   - Consulta base CNJ se escritório
   - Verifica OAB se pessoa física com registro

---

### 1.1.2 Funcionalidade: Importar Clientes em Lote

**Descrição:** Upload CSV com múltiplos clientes

**Campos Suportados:** CNPJ, Razão Social, Email, Telefone, Estado, Cidade, Ramo, Tamanho

**Validações:**
- Máx 1.000 registros por import
- Detecta duplicatas (CNPJ)
- Pré-visualização antes de confirmar
- Relatório de erros por linha

**Critério de Aceitação:**
```
✓ DADO arquivo CSV válido
  QUANDO faz upload
  ENTÃO mostra preview com 10 primeiros registros
  E lista de erros (se houver)
  E permite confirmar import

✓ DADO linha com CNPJ duplicado no CSV
  QUANDO processa
  ENTÃO marca como "Erro: CNPJ já existe"
  E não importa aquela linha
  E continua processando próximas
```

---

## 1.2 Gestão de Clientes Existentes

### 1.2.1 Funcionalidade: Visualizar Detalhes de Cliente

**Descrição:** Tela completa com informações consolidadas

**Seções da Tela:**

1. **Cabeçalho:**
   - Razão Social + Foto/Logo
   - CNPJ/CPF com mask
   - Badge de Classificação Risco
   - Ações: Editar, Deletar, Suspender

2. **Dados de Contato:**
   - Email, Telefone, Whatsapp
   - Contato principal + telefone direto
   - Último contato realizado
   - Próximo agendado

3. **Localização:**
   - Endereço completo
   - Mapa (Google Maps embed)
   - Link Google Street View

4. **Informações Comerciais:**
   - Ramo de atuação
   - Tamanho empresa
   - Dias prazo pagamento
   - Limite crédito

5. **Histórico Financeiro (Cards):**
   - Total demandas: X
   - Total faturado: R$ X.XXX
   - Total pago: R$ X.XXX
   - Saldo devido: R$ X.XXX
   - Taxa inadimplência: X%

6. **Últimas Demandas (Tabela):**
   - Protocolo | Especialidade | Status | Data | Valor
   - Máx 5 últimas (link "Ver todas")

7. **Documentos Anexados:**
   - Contrato
   - Procuração
   - Certidão
   - Com data e usuário que anexou

8. **Notas Timeline:**
   - Histórico de notas internas
   - Quem, quando, o quê

**Critério de Aceitação:**
```
✓ DADO cliente existente no sistema
  QUANDO acessa detalhes
  ENTÃO todos os dados aparecem corretamente
  E informações financeiras estão atualizadas
  E últimas demandas aparecem com status atual

✓ DADO cliente deletado
  QUANDO tenta acessar
  ENTÃO mostra página "Cliente não encontrado (404)"
```

---

### 1.2.2 Funcionalidade: Editar Cliente

**Descrição:** Atualizar informações de cliente

**Campos Editáveis:** Todos (exceto CNPJ/CPF após criação)

**Campos Imutáveis:**
- CNPJ/CPF (prevent mass assignment)
- Data de criação
- ID

**Critério de Aceitação:**
```
✓ DADO cliente com informações antigas
  QUANDO altera dados
  E clica "Salvar"
  ENTÃO registra alteração na auditoria
  E mostra mensagem "Cliente atualizado"
  E timestamp "Atualizado em XX/XX/XXXX 14:30"

✓ DADO CNPJ tentando ser alterado via URL manipulation
  QUANDO tenta
  ENTÃO sistema ignora mudança
  E mantém CNPJ original
  E loga tentativa de alteração não autorizada
```

---

### 1.2.3 Funcionalidade: Deletar Cliente

**Descrição:** Remover cliente do sistema

**Validações:**
- Confirmar com senha do usuário
- Verificar se tem demandas ativas
- Backup antes de deletar

**Regra de Negócio:**
```
Se cliente tem demandas:
  ├─ Ativas: Não permite deletar
  ├─ Concluídas: Permite (move para "arquivo")
  └─ Canceladas: Permite (move para "arquivo")
```

**Critério de Aceitação:**
```
✓ DADO cliente sem demandas ativas
  QUANDO deleta
  E confirma com senha
  ENTÃO cliente vai para "Clientes Inativos" (soft delete)
  E continua visível para consultas (relatórios históricos)
  E log de auditoria registra exclusão

✓ DADO cliente com 3 demandas ativas
  QUANDO tenta deletar
  ENTÃO mostra modal: "Impossível deletar
    Cliente possui 3 demandas ativas"
  E lista demandas
  E oferece opção "Resolver demandas"
```

---

### 1.2.4 Funcionalidade: Filtrar e Buscar Clientes

**Descrição:** Busca avançada com múltiplos filtros

**Filtros Disponíveis:**

| Filtro | Tipo | Valores | Padrão |
|--------|------|--------|--------|
| Busca Rápida | Text | Nome, CNPJ, Email | Vazio |
| Tipo Cliente | Multi-select | Escritório, Empresa, etc | Todos |
| Estado | Multi-select | 27 UFs | Todos |
| Ramo Atuação | Multi-select | 30+ | Todos |
| Tamanho | Multi-select | Pequeno, Médio, Grande | Todos |
| Classificação Risco | Multi-select | Baixo, Médio, Alto | Todos |
| Status | Dropdown | Ativo, Inativo, Suspenso | Ativo |
| Data Cadastro | Date Range | - | Último 90 dias |
| Última Atividade | Date Range | - | Último 30 dias |

**Ordenação:**
- Nome (A-Z / Z-A)
- Data cadastro (Recente / Antigo)
- Última atividade (Recente / Antigo)
- Valor total demandas (Maior / Menor)

**Paginação:** 20, 50, 100 registros por página

**Critério de Aceitação:**
```
✓ DADO usuário em lista de clientes
  QUANDO digita "Silva" em busca rápida
  ENTÃO filtra para clientes com "Silva" no nome
  E mostra X resultados encontrados

✓ DADO múltiplos filtros selecionados
  QUANDO clica "Filtrar"
  ENTÃO aplica filtros com AND logic
  E resultado só mostra clientes que atendem TODOS critérios

✓ DADO filtros aplicados
  QUANDO clica "Limpar Filtros"
  ENTÃO volta ao estado padrão
  E mostra todos os clientes
```

---

## 1.3 Captação Ativa de Clientes

### 1.3.1 Funcionalidade: Pipeline de Vendas (Funil)

**Descrição:** Gerenciar oportunidades de captação

**Estágios do Funil:**

```
┌─────────────────────────────────────────────────────┐
│ 1. PROSPECTO                                        │
│    Empresa identificada, contato não realizado     │
│    └─ Ações: Pesquisar, Qualificar, Descartar      │
├─────────────────────────────────────────────────────┤
│ 2. QUALIFICADO                                      │
│    Contato inicial realizado, interesse confirmado │
│    └─ Ações: Enviar proposta, Agendar reunião      │
├─────────────────────────────────────────────────────┤
│ 3. PROPOSTA ENVIADA                                │
│    Proposta comercial entregue                     │
│    └─ Ações: Follow-up, Aguardar resposta         │
├─────────────────────────────────────────────────────┤
│ 4. NEGOCIAÇÃO                                      │
│    Em discussão de termos                          │
│    └─ Ações: Ajustar proposta, Negociar           │
├─────────────────────────────────────────────────────┤
│ 5. GANHO                                           │
│    Cliente convertido em cliente ativo            │
│    └─ Ações: Criar conta, Enviar documentação      │
├─────────────────────────────────────────────────────┤
│ 6. PERDIDO                                         │
│    Oportunidade não convertida                     │
│    └─ Motivo: Preço, Concorrência, Outros        │
└─────────────────────────────────────────────────────┘
```

**Campos de Oportunidade:**
- Nome empresa
- Contato (nome, email, telefone)
- Valor estimado (proposta)
- Estágio atual
- Responsável (vendedor)
- Data criação
- Data última atualização
- Probabilidade conversão (%)
- Observações
- Documentos anexados

**Critério de Aceitação:**
```
✓ DADO oportunidade em estágio "Proposta Enviada"
  QUANDO arrasta para "Negociação"
  ENTÃO registra mudança com timestamp
  E envia notificação automática ao responsável
  E aparece no dashboard com barra de progresso

✓ DADO oportunidade marcada como "Ganho"
  QUANDO confirma
  ENTÃO oferece criar cliente imediatamente
  E popula campos com dados da oportunidade
  E cria primeira demanda (opcional)
```

---

### 1.3.2 Funcionalidade: Campanha de Captação

**Descrição:** Criar e gerenciar campanhas de captura de clientes

**Tipos de Campanha:**
- Email marketing
- Telemarketing
- Evento/Workshop
- Referência (indicação)
- Inbound (site/formulário)

**Campos:**
- Nome campanha
- Tipo
- Data início / fim
- Segmento-alvo (tipo empresa, ramo, tamanho, estado)
- Responsável
- Orçamento
- Contatos da campanha
- Status (Planejamento, Ativa, Pausada, Finalizada)

**Métricas:**
- Total contatos: X
- Responderam: X (X%)
- Qualificados: X (X%)
- Convertidos: X (X%)
- ROI: R$ X.XXX
- Custo por aquisição: R$ X.XXX

---

## 1.4 Relacionamento com Cliente

### 1.4.1 Funcionalidade: Timeline de Atividades

**Descrição:** Histórico completo de todas interações

**Tipos de Evento:**
- Demanda criada
- Demanda finalizada
- Pagamento recebido
- Contato realizado
- Reunião agendada
- Documento enviado
- Nota adicionada
- Status cliente alterado

**Visualização:**
- Timeline vertical
- Ordenado por data (recente em cima)
- Cores diferentes por tipo de evento
- Quem fez a ação
- Horário exato

---

### 1.4.2 Funcionalidade: Adicionar Nota Interna

**Descrição:** Registrar observações sobre cliente

**Campos:**
- Texto (max 1000 caracteres)
- Etiqueta/Tag (Reunião, Negociação, Reclamação, etc)
- Visibilidade (Público para todo time / Privado só eu)

**Critério de Aceitação:**
```
✓ DADO nota privada criada por João
  QUANDO Maria acessa cliente
  ENTÃO nota NÃO aparece para Maria
  E apenas João consegue ver

✓ DADO nota com etiqueta "Reclamação"
  QUANDO salva
  ENTÃO filtra vermelha na timeline
  E pode filtrar por tag "Reclamação" na lista
```

---

### 1.4.3 Funcionalidade: Anexar Documentos

**Descrição:** Armazenar arquivos relacionados ao cliente

**Tipos Suportados:**
- Contrato (.pdf, .docx, max 50MB)
- Procuração (.pdf, .jpg, max 50MB)
- Certidão (.pdf, .jpg, max 50MB)
- RG/Identidade (.pdf, .jpg, max 10MB)
- Documentação Comercial (.pdf, .xls, max 50MB)
- Outro (.pdf, .doc, .xls, .jpg, max 50MB)

**Armazenamento:** Cloud (AWS S3 ou similar)

**Critério de Aceitação:**
```
✓ DADO usuário anexa documento
  QUANDO upload completa
  ENTÃO armazena em cloud
  E gera link permanente
  E registra: quem, quando, qual arquivo

✓ DADO arquivo de 60MB
  QUANDO tenta fazer upload
  ENTÃO bloqueia com mensagem "Arquivo excede 50MB"

✓ DADO documento sensível (RG)
  QUANDO é acessado
  ENTÃO registra acesso na auditoria
  E mostra "Acessado por: João em 02/11/2025 14:30"
```

---

# 2. GESTÃO DE CORRESPONDENTES - 22 Funcionalidades

## 2.1 Cadastro de Correspondente

### 2.1.1 Funcionalidade: Registrar Novo Correspondente

**Descrição:** Cadastrar profissional jurídico (pessoa física ou escritório)

**Tipos de Correspondente:**
- Advogado pessoa física
- Escritório de advocacia
- Departamento interno
- Pessoa jurídica especializada

**Campos de Formulário:**

| Campo | Tipo | Obrigatório | Validação | Nota |
|-------|------|---|---|---|
| Tipo Correspondente | Dropdown | Sim | 4 opções | - |
| Nome Fantasia | Text | Sim | Min 5 carac | Será usado em demandas |
| Nome Jurídico | Text | Sim se PJ | - | CNPJ requer nome jurídico |
| CPF | Text | Sim se PF | Validar dígitos | Máscara XXX.XXX.XXX-XX |
| CNPJ | Text | Sim se PJ | Validar dígitos | Máscara XX.XXX.XXX/XXXX-XX |
| Email | Email | Sim | RFC 5322 | Notificações |
| Telefone Principal | Phone | Sim | Validação DD | (XX) XXXXX-XXXX |
| Whatsapp | Phone | Não | +55 | Notificações urgentes |
| Registro OAB | Text | Sim | Validar existente | OAB/UF XXXXXX/XXXX |
| Data Registro OAB | Date | Sim | - | YYYY-MM-DD |
| UF Sediado | Dropdown | Sim | 27 UFs | Onde funciona |
| Cidade | Text | Sim | - | Autocomplete IBGE |
| Endereço | Text | Sim | - | Rua, número, complemento |
| Especialidades | Multi-select | Sim | Min 1 | Direito Civil, Penal, etc |
| Nível Experiência | Dropdown | Sim | Junior/Pleno/Senior/Especialista | - |
| Anos Experiência | Number | Sim | 1-60 | - |
| Preço Mínimo | Currency | Sim | > 0 | R$ menor demanda |
| Preço/Hora | Currency | Sim | > 0 | R$ 200-1000 |
| Capacidade Máxima Demandas | Number | Sim | 1-50 | Quantas demandas simultâneas |
| Disponibilidade | Dropdown | Sim | Disponível/Restrita/Indisponível | - |
| Documentos | File upload | Não | Max 3 arquivos | Certidão, comprovantes |
| Observações | Textarea | Não | Max 1000 | Notas especiais |

**Validações Específicas:**

```
OAB Validation:
├─ Formato: "OAB/XX XXXXXX/XXXX"
├─ Consulta base CNJ
├─ Verifica se está ativo
└─ Verifica se especialidades coincidem com registro

CPF/CNPJ Validation:
├─ Algoritmo dígito verificador
├─ Verifica duplicata no sistema
├─ Se empresa, consulta Receita Federal
└─ Se pessoa física, consulta CPF

Email Validation:
├─ RFC 5322 compliant
├─ Confirmação por código (MFA)
└─ Possível vincular múltiplos emails
```

**Critério de Aceitação:**
```
✓ DADO correspondente pessoa física
  QUANDO preenche formulário com OAB ativo
  QUANDO salva
  ENTÃO cria registro com sucesso
  E mostra ID único (CORR-XXXXX)
  E envia email confirmação

✓ DADO OAB "OAB/SP 123456/2020" fornecido
  QUANDO valida
  E busca na base CNJ
  ENTÃO verifica se está ativo
  E carrega automaticamente especialidades registradas
  E prefill áreas de atuação (se não conflitar com input)

✓ DADO correspondente com mesmo OAB já existe
  QUANDO tenta registrar
  ENTÃO mostra: "OAB já cadastrado no sistema (ID: CORR-12345)"
  E oferece opção "Visualizar existente"
```

---

## 2.2 Especialidades e Preços

### 2.2.1 Funcionalidade: Gerenciar Especialidades por Correspondente

**Descrição:** Vinculação de especialidades com preços customizados

**Interface:** Tabela com linhas para cada especialidade

| Especialidade | Nível Experiência | Anos | Preço Mín | Preço/Hora | Ativo | Ações |
|---|---|---|---|---|---|---|
| Direito Civil | Senior | 15 | R$ 2000 | R$ 350 | Sim | Editar / Remover |
| Direito Penal | Pleno | 8 | R$ 1500 | R$ 300 | Não | Editar / Remover |

**Campos Editáveis:**
- Nível experiência
- Anos experiência
- Preço mínimo
- Preço por hora
- Status ativo/inativo

**Critério de Aceitação:**
```
✓ DADO correspondente com especialidade Civil (Senior)
  QUANDO edita para Pleno
  QUANDO salva
  ENTÃO atualiza em tempo real
  E próximas demandas usam novo nível

✓ DADO especialidade marcada como "Inativa"
  QUANDO cria nova demanda
  ENTÃO NÃO oferece este correspondente como opção
  E filtra para especialidades "Ativas"
```

---

## 2.3 Avaliação e Desempenho

### 2.3.1 Funcionalidade: Sistema de Avaliação (1-5 Estrelas)

**Descrição:** Classificação de correspondente com comentário

**Campos:**
- Estrelas (1-5)
- Comentário (max 500 carac)
- Aspecto avaliado (Qualidade, Prazo, Comunicação, Valor)
- Relacionar com Demanda
- Anônima (yes/no)

**Avaliadores:** Admin, Gerenciador, Cliente (após finalização demanda)

**Agregação:**
- Classificação média (display com decimais)
- Total de avaliações
- Distribuição (gráfico)
- Últimas 5 avaliações mostradas

**Critério de Aceitação:**
```
✓ DADO cliente finaliza demanda
  QUANDO recebe opção de "Avaliar correspondente"
  E preenche 5 estrelas + comentário
  QUANDO salva
  ENTÃO avaliação aparece no perfil de correspondente
  E atualiza classificação média
  E correspondente NÃO consegue deletar/editar

✓ DADO correspondente com 0 avaliações
  QUANDO vai ser atribuído a demanda
  ENTÃO pode ser selecionado
  E mostra "Sem avaliações ainda" no perfil

✓ DADO correspondente com 4.2 estrelas em 52 avaliações
  QUANDO alguém vê perfil
  ENTÃO mostra "4.2 ★ (52 avaliações)"
```

---

### 2.3.2 Funcionalidade: Dashboard de Desempenho

**Descrição:** Métricas agregadas de um correspondente

**Seção 1: Resumo Geral**
- Total de demandas: X
- Demandas concluídas: X
- Taxa de conclusão: X%
- Demandas ativas: X

**Seção 2: Receita**
- Total faturado: R$ X.XXX
- Valor médio demanda: R$ X.XXX
- Total pago: R$ X.XXX
- Total devido: R$ X.XXX

**Seção 3: Prazos**
- Demandas no prazo: X%
- Demandas atrasadas: X
- Tempo médio resolução: X dias
- Maior atraso: X dias

**Seção 4: Satisfação**
- Classificação: X.X ★
- Total avaliações: X
- Distribuição (gráfico pizza)

**Seção 5: Comparativo (últimos 3 meses)**
- Gráfico linha: Demandas/mês
- Gráfico linha: Receita/mês
- Gráfico linha: Prazo cumprimento

---

## 2.4 Gestão de Correspondentes

### 2.4.1 Funcionalidade: Listar Correspondentes com Filtros

**Filtros:**
- Busca (Nome, OAB, Email)
- Especialidade (Multi-select)
- UF (Multi-select)
- Nível Experiência (Multi-select)
- Classificação (Min-Max: 0-5 estrelas)
- Status (Ativo/Inativo/Suspenso)
- Taxa Sucesso (Min-Max: 0-100%)

**Ordenação:**
- Classificação (maior primeiro)
- Taxa sucesso (maior primeiro)
- Nome (A-Z)
- Recém adicionados

**Colunas Tabela:**
| ID | Nome | OAB | UF | Especialidades | Classificação | Taxa Sucesso | Demandas Ativas | Ações |
|---|---|---|---|---|---|---|---|---|

---

### 2.4.2 Funcionalidade: Suspender/Reativar Correspondente

**Descrição:** Temporariamente parar de oferecer para novas demandas

**Razões Possíveis:**
- Demandas ativas concluindo
- Problemas de desempenho
- Disponibilidade reduzida
- Revisão de qualidade

**Regras:**
- Correspondente suspenso NÃO oferecido para novas demandas
- Demandas em progresso continuam
- Pode ser reativado qualquer hora
- Histórico fica registrado

---

## 2.5 Compatibilidade de Atribuição

### 2.5.1 Funcionalidade: Verificar Compatibilidade

**Descrição:** Sistema sugere melhor correspondente para demanda

**Critérios de Scoring:**

```
Pontuação = ∑ (fator × peso)

Fatores:
├─ Especialidade coincide: +100 pontos
├─ Nível experiência adequado: +50 pontos
├─ Capacidade disponível: +40 pontos
├─ Classificação (por estrela): +10 pontos
├─ Localização mesmo estado: +20 pontos
├─ Taxa sucesso alta (>90%): +15 pontos
├─ Preço compatível: +25 pontos
└─ Disponibilidade (não suspenso): +50 pontos

Score Final = (Pontuação / 410) × 100
Sugestão = Correspondente com maior score
```

**Critério de Aceitação:**
```
✓ DADO demanda Civil/Senior em SP com orçamento R$ 5000
  QUANDO sistema calcula compatibilidade
  ENTÃO TOP 1 = correspondente SP, Civil, Senior, score 98%
  E oferece ranking com TOP 3
  E permite override manual (admin pode escolher outro)
```

---

# 3. GESTÃO DE DEMANDAS - 35 Funcionalidades

## 3.1 Criação de Demanda

### 3.1.1 Funcionalidade: Criar Nova Demanda

**Descrição:** Registrar nova solicitação de serviço jurídico

**Tela 1: Informações Básicas**

| Campo | Tipo | Obrigatório | Validação | Nota |
|-------|------|---|---|---|
| Cliente | Dropdown | Sim | Existente | Auto-complete |
| Especialidade | Dropdown | Sim | - | Civil, Penal, etc |
| Título | Text | Sim | Min 5 carac | Ex: "Ação de Despejo" |
| Descrição | Textarea | Sim | Min 20 carac | Contexto do caso |
| Número Processo Judicial | Text | Não | Regex NNNNNNN-DD.DDDD.D.DD.DDDD | Ex: 0000001-00.0000.0.00.0000 (CNJ) |
| Tribunal Responsável | Dropdown | Não | 27 UFs | Onde tramita |
| Prioridade | Dropdown | Sim | Baixa/Normal/Alta/Urgente | - |
| Valor Estimado | Currency | Não | > 0 | R$ da proposta |
| Prazo Cliente | Date | Não | > hoje | Quando cliente precisa |

**Tela 2: Atribuição**

| Campo | Tipo | Obrigatório | Validação | Nota |
|-------|------|---|---|---|
| Correspondente | Dropdown | Não | - | Auto-sugere TOP 3 |
| Modo Atribuição | Radio | Sim | Manual/Automático | - |

Se "Automático":
```
├─ Sistema calcula scoring
├─ Mostra TOP 3 com score
├─ Permite confirmar TOP 1 ou escolher outro
└─ Se rejeita todos, oferece expandir critérios
```

Se "Manual":
```
├─ Dropdown com todos correspondentes (filtráveis)
├─ Mostra compatibilidade em %%
├─ Permite livre escolha
└─ Aviso se baixa compatibilidade
```

**Tela 3: Revisar e Confirmar**

- Resumo informações
- Confirmação dados
- Botão "Criar Demanda"

**Critério de Aceitação:**
```
✓ DADO formulário preenchido com dados válidos
  QUANDO clica "Criar Demanda"
  ENTÃO cria demanda com sucesso
  E gera número protocolo único (DEM-2025-XXXXX)
  E envia notificação ao correspondente
  E mostra tela "Demanda criada com sucesso"
  E oferece opções:
    ├─ Ver detalhes
    ├─ Criar outra demanda
    └─ Voltar para lista

✓ DADO Número Processo fornecido (válido CNJ)
  QUANDO salva
  ENTÃO valida formato
  E busca dados do processo (se possível via API CNJ)
  E pré-popula: tribunal, tipo ação, partes

✓ DADO número processo INVÁLIDO
  QUANDO tenta salvar
  ENTÃO mostra erro: "Número de processo inválido
    Formato correto: NNNNNNN-DD.DDDD.D.DD.DDDD"
```

---

### 3.1.2 Funcionalidade: Criar Demanda a Partir de Template

**Descrição:** Usar templates para demandas recorrentes

**Templates Pré-configurados:**
- Ação de Cobrança
- Ação de Despejo
- Revisão de Contrato
- Parecer Jurídico
- Defesa em Ação
- Consultoria

**Campos de Template:**
- Nome template
- Descrição padrão (editável)
- Especialidade (pré-selecionada)
- Prioridade padrão
- Documentos anexados (opcionais)
- Diligências sugeridas

**Critério de Aceitação:**
```
✓ DADO template "Ação de Despejo"
  QUANDO seleciona
  E clica "Usar Template"
  ENTÃO popula: especialidade, descrição padrão
  E oferece campos em branco para customizar
  E pode remover/adicionar diligências

✓ DADO novo template criado
  QUANDO salva como "Meu Template"
  ENTÃO disponibiliza na lista para próximas demandas
  E mostra quem criou + data
```

---

## 3.2 Workflow Automatizado

### 3.2.1 Funcionalidade: Estados de Demanda com Transições Validadas

**Descrição:** Máquina de estados com regras de transição

**Estados Possíveis:**

```
┌─────────────────────────────────────────────────────┐
│ ABERTA (Estado Inicial)                             │
│ - Demanda criada, aguardando correspondente         │
│ - Transições permitidas: EM_PROGRESSO, CANCELADA    │
├─────────────────────────────────────────────────────┤
│ EM_PROGRESSO (Correspondente iniciou)              │
│ - Correspondente está trabalhando                   │
│ - Transições: AGUARDANDO_CLIENTE, CONCLUIDA,        │
│               CANCELADA, SUSPENSA                   │
├─────────────────────────────────────────────────────┤
│ AGUARDANDO_CLIENTE (Esperando resposta cliente)     │
│ - Demanda em pause esperando cliente                │
│ - Transições: EM_PROGRESSO, CANCELADA, CONCLUIDA    │
├─────────────────────────────────────────────────────┤
│ CONCLUIDA (Demanda finalizada)                     │
│ - Trabalho completado                              │
│ - Transições: REABERTURA (se cliente pedir)         │
│ - Final: Não permite mais mudanças                  │
├─────────────────────────────────────────────────────┤
│ CANCELADA (Demanda cancelada)                      │
│ - Trabalho descontinuado                           │
│ - Transições: Nenhuma (estado final)                │
├─────────────────────────────────────────────────────┤
│ SUSPENSA (Temporariamente parada)                  │
│ - Demanda em pause (indefinido)                     │
│ - Transições: EM_PROGRESSO, CANCELADA              │
└─────────────────────────────────────────────────────┘
```

**Validações por Transição:**

```
ABERTA → EM_PROGRESSO:
├─ Requer correspondente atribuído
├─ Registra data/hora início
└─ Envia notificação "Demanda iniciada"

EM_PROGRESSO → CONCLUIDA:
├─ Requer descrição de conclusão
├─ Requer valor final (se diferente de estimado)
├─ Oferece criar pagamento automaticamente
├─ Valida prazo (se atrasado, mostra aviso)
└─ Envia feedback solicitação cliente

EM_PROGRESSO → CANCELADA:
├─ Requer motivo cancelamento
├─ Se tem pagamento, oferece opções de crédito
└─ Não pode voltar (final)

→ SUSPENSA:
├─ Requer motivo suspensão
├─ Registra data/hora
└─ Permite voltar a EM_PROGRESSO
```

**Critério de Aceitação:**
```
✓ DADO demanda em ABERTA
  QUANDO tenta marcar como CONCLUIDA diretamente
  ENTÃO bloqueia com erro:
    "Demanda deve estar EM_PROGRESSO antes de concluir"

✓ DADO demanda em EM_PROGRESSO há 60 dias
  QUANDO tenta concluir
  ENTÃO mostra aviso: "Demanda está 30 dias ATRASADA
    Deseja prosseguir?"
  E oferece opção "Gerar relatório de atraso"

✓ DADO demanda CANCELADA
  QUANDO tenta editar status
  ENTÃO bloqueia com: "Demanda cancelada não pode ser alterada"
```

---

### 3.2.2 Funcionalidade: Histórico Completo de Mudanças

**Descrição:** Timeline com todas transições de estado

**Registra:**
- Timestamp exato
- Quem fez (usuário/correspondente)
- Estado anterior
- Estado novo
- Motivo (se aplicável)
- Duração no estado anterior

**Exemplo Timeline:**
```
02/Nov/2025 14:45:30 - João (Admin) alterou ABERTA → EM_PROGRESSO
  Correspondente: Silva & Associados

02/Nov/2025 14:45 - Sistema notificou correspondente via email

05/Nov/2025 16:20:15 - Silva & Associados marcou AGUARDANDO_CLIENTE
  Motivo: Aguardando documentos do cliente

08/Nov/2025 09:00:00 - Cliente (via API integrada) enviou documentos

09/Nov/2025 10:30:45 - Silva & Associados retornou EM_PROGRESSO
  (Duração em AGUARDANDO: 2 dias 18 horas 10 minutos)

02/Nov/2025 14:45:30 - Silva & Associados marcou CONCLUIDA
  Valor final: R$ 5.500,00 (estimado: R$ 5.000,00)
  Descrição: Parecer jurídico entregue conforme solicitado
  (Duração total em demanda: 1 dia 23 horas 45 minutos)
```

---

## 3.3 Gestão de Diligências

### 3.3.1 Funcionalidade: Criar Diligência

**Descrição:** Registrar tarefas/etapas dentro de demanda

**Tipos de Diligência:**
- Petição (peças processuais)
- Parecer (análise jurídica)
- Despacho (gestão processual)
- Recurso (recursos legais)
- Moção (moções judiciais)
- Consultoria (parecer consultivo)
- Revisão de contrato
- Verificação documental
- Correspondência (ofícios)
- Seguimento processual

**Campos de Formulário:**

| Campo | Tipo | Obrigatório | Validação | Nota |
|-------|------|---|---|---|
| Tipo | Dropdown | Sim | 10 opções | - |
| Descrição | Textarea | Sim | Min 10 carac | - |
| Responsável | Dropdown | Não | - | Se vazio, fica responsável demanda |
| Prazo (dias) | Number | Sim | 1-180 | Dias úteis |
| Data Prazo | Calculated | Auto | - | Calcula data basado em dias |
| Prioridade | Dropdown | Não | 1-5 | Herda prioridade demanda |
| Anexos | File upload | Não | PDF, DOC | Max 5 arquivos |
| Notificar por | Checkbox | Não | Email/Whatsapp | - |

**Cálculo de Data Prazo (Dias Úteis):**
```
Data Prazo = Data Hoje + N dias úteis
Exclui: Sábado, Domingo, Feriados Nacionais (tabela configurável)

Exemplo:
  Hoje: 02/Nov/2025 (segunda)
  Prazo: 5 dias úteis
  
  Contagem:
  ├─ 03/Nov (terça)
  ├─ 04/Nov (quarta)
  ├─ 05/Nov (quinta)
  ├─ 06/Nov (sexta)
  ├─ 07/Nov (sábado) - SKIP
  ├─ 08/Nov (domingo) - SKIP
  ├─ 09/Nov (segunda) ← 5º dia útil
  
  Data Prazo = 09/Nov/2025 (domingo é feriado em RJ, ex)
  Ajusta para: 09/Nov/2025
```

**Críter de Aceitação:**
```
✓ DADO demanda ativa
  QUANDO cria diligência com prazo "5 dias úteis"
  E feriados incluem Finados (02/Nov)
  ENTÃO calcula data prazo pulando feriados
  E mostra: "Data prazo calculada: 09/Nov/2025"

✓ DADO diligência com prazo em 3 dias
  QUANDO salva
  E sistema está configurado "Notificar 3 dias antes"
  ENTÃO agenda notificação automática para 3 dias antes
```

---

### 3.3.2 Funcionalidade: Dashboard de Diligências Críticas

**Descrição:** Visão de diligências próximas a vencer

**Alertas:**

```
🔴 CRÍTICO (Vence hoje ou venceu)
   ├─ Diligência: Petição de Defesa (DEM-2025-001)
   ├─ Responsável: João Silva
   ├─ Vence: 02/Nov/2025 14:00
   ├─ Tempo restante: -2 horas
   └─ Ações: Marcar concluído, Estender prazo, Notificar

🟠 ALERTA (Vence em 1-3 dias)
   ├─ Diligência: Parecer Jurídico (DEM-2025-005)
   ├─ Responsável: Maria Santos
   ├─ Vence: 04/Nov/2025 17:00
   ├─ Tempo restante: 2 dias 2 horas
   └─ Ações: Acompanhar, Antecipar prazo

🟡 AVISO (Vence em 4-7 dias)
   ├─ Diligência: Revisão Contrato (DEM-2025-008)
   ├─ Vence: 08/Nov/2025
   └─ Tempo restante: 6 dias
```

**Filtros:**
- Meus (só responsável atual)
- Por Demanda
- Por Tipo
- Prioritárias (1-5 escala)

**Ordenação:**
- Prazo mais próximo (padrão)
- Prioridade (alta para baixa)
- Recém adicionadas

---

### 3.3.3 Funcionalidade: Atualizar Status Diligência

**Estados Possíveis:**

```
PENDENTE → EM_PROGRESSO → CONCLUIDA
        ↘_____________↙
              ↓
          ATRASADA (se prazo passou)
              ↓
        CANCELADA (se cancelar)
              ↓
        IMPOSSÍVEL (se não dá mais pra fazer)
```

**Transições e Validações:**

```
PENDENTE → EM_PROGRESSO:
├─ Registra data/hora início
├─ Notifica responsável
└─ Pode voltar a PENDENTE

EM_PROGRESSO → CONCLUIDA:
├─ Requer descrição do que foi feito
├─ Pode anexar documento
├─ Auto-calcula dias para conclusão
├─ Valida se atrasado
└─ Envia notificação

→ CANCELADA:
├─ Requer motivo
├─ Oferece reatribuição a outro
└─ Registra quem cancelou

→ IMPOSSÍVEL:
├─ Requer explicação
├─ Oferece criar nova diligência substituta
└─ Log de impossibilidade
```

**Critério de Aceitação:**
```
✓ DADO diligência EM_PROGRESSO
  QUANDO marca como CONCLUIDA
  E anexa documento PDF assinado
  ENTÃO registra conclusão
  E armazena documento
  E calcula tempo de execução
  E mostra: "Diligência concluída em 2 dias 4 horas"

✓ DADO diligência com prazo ontem
  QUANDO acessa lista
  ENTÃO mostra como "ATRASADA"
  E badge vermelho
  E calcula: "1 dia atrasado"
```

---

## 3.4 Anexos e Documentos

### 3.4.1 Funcionalidade: Gerenciar Anexos de Demanda

**Descrição:** Upload e gestão de documentos

**Tipos Permitidos:** PDF, DOCX, XLSX, JPG, PNG, TIFF

**Máximo:** 100MB por arquivo, 500MB por demanda

**Campos de Anexo:**
- Nome arquivo
- Tipo documento (Contrato, Parecer, Sentença, etc)
- Descrição (opcional)
- Data upload (auto)
- Quem fez upload (auto)
- Visibilidade (Público/Confidencial/Restrito Correspondente)

**Funcionalidades:**
- Download
- Preview (para PDF/IMG)
- OCR automático (extrair texto)
- Versioning (manter histórico)
- Compartilhar com cliente (link seguro)

---

### 3.4.2 Funcionalidade: OCR - Extrair Texto de Documento

**Descrição:** Reconhecimento óptico de caracteres

**Como Funciona:**
1. Upload documento (PDF ou IMG)
2. Sistema processa (background job)
3. Extrai texto
4. Indexa para busca
5. Mostra texto extraído

**Casos de Uso:**
- Sentença digitalizada → extrai número processo
- Contrato escaneado → extrai cláusulas principais
- Documento fiscal → extrai CNPJ, valor, data

**Critério de Aceitação:**
```
✓ DADO sentença em PDF escaneado
  QUANDO sistema processa OCR
  ENTÃO extrai número processo automaticamente
  E oferece corrigir se necessário
  E usa para atualizar "Número Processo Judicial" da demanda

✓ DADO contrato escaneado
  QUANDO OCR completa
  E clica "Indexar para busca"
  ENTÃO pesquisas futuras encontram conteúdo
  E pode buscar por: "cláusula multa", "juros moratorio", etc
```

---

# 4. MÓDULO FINANCEIRO - 28 Funcionalidades

## 4.1 Gestão de Pagamentos

### 4.1.1 Funcionalidade: Gerar Fatura Automaticamente

**Descrição:** Criar fatura a partir de demanda concluída

**Quando Dispara:**
- Demanda marcada CONCLUIDA
- Sistema oferece: "Gerar pagamento?" (SIM/NÃO)
- Se SIM, popula automaticamente

**Campos Auto-Preenchidos:**
- Cliente: (de demanda)
- Correspondente: (de demanda)
- Valor: (valor_final de demanda, ou estimado se não informado)
- Descrição: (número processo + tipo demanda)
- Data Emissão: Hoje
- Data Vencimento: Hoje + dias_prazo_cliente

**Campos Editáveis:**
- Valor (pode ajustar)
- Data vencimento (pode alterar)
- Desconto (pode conceder)
- Observações

**Metadados Inclusos:**
- Número Protocolo Demanda
- Número Processo Judicial
- Especialidade
- Período de trabalho

**Critério de Aceitação:**
```
✓ DADO demanda concluída com valor R$ 5.500
  QUANDO marca CONCLUIDA
  ENTÃO oferece criar pagamento
  E pré-popula com R$ 5.500
  E usa data_vencimento = hoje + 30 dias
  
✓ DADO demanda com desconto aplicado
  QUANDO cria fatura
  ENTÃO fatura reflete desconto
  E calcula valor final = valor - desconto

✓ DADO fatura criada
  QUANDO abre lista de pagamentos
  ENTÃO mostra com status "PENDENTE"
  E cor amarela
```

---

### 4.1.2 Funcionalidade: Criar Fatura Manual

**Descrição:** Registrar pagamento sem demanda associada

**Cenários:**
- Demanda concluída há tempo
- Consultoria/Parecer isolado
- Ajustes ou créditos

**Campos Obrigatórios:**
- Cliente (Dropdown)
- Correspondente (Dropdown)
- Valor (Currency)
- Descrição (Textarea)
- Data Vencimento (Date)

**Campos Opcionais:**
- Número Processo
- Demanda Relacionada (Link)
- Desconto
- Observações

---

### 4.1.3 Funcionalidade: Lançar Pagamento Recebido

**Descrição:** Registrar recebimento de pagamento

**Métodos de Pagamento:**
- Transferência Bancária
- PIX
- Boleto
- Cartão de Crédito
- Cheque
- Dinheiro

**Campos Requeridos:**

Para Transferência/PIX:
- Data recebimento
- Valor
- Comprovante (opcional)
- Referência banco
- Tipo (débito, crédito, TED, DOC)

Para Boleto:
- Data recebimento
- Valor
- Código barras
- Comprovante

Para Cheque:
- Data recebimento
- Banco
- Número cheque
- Data compensação (futura)
- Comprovante

Para Dinheiro:
- Data recebimento
- Valor
- Recebido por (usuário)
- Observações

**Processamento:**
1. Valida valor <= valor devido
2. Oferece 2 opções:
   - Pagamento completo (fecha fatura)
   - Pagamento parcial (atualiza saldo)
3. Registra na auditoria
4. Atualiza fluxo de caixa
5. Envia recibo cliente (email/PDF)

**Critério de Aceitação:**
```
✓ DADO fatura R$ 5.500 pendente
  QUANDO lança pagamento R$ 5.500 via PIX
  E confirma
  ENTÃO status muda para "COMPLETO"
  E data de recebimento é registrada
  E email de recibo é enviado
  E cor fica verde

✓ DADO fatura R$ 5.500 pendente
  QUANDO lança pagamento R$ 2.750 (50%)
  ENTÃO status muda para "PARCIAL"
  E saldo devido R$ 2.750
  E continua na lista de cobranças
  E cor fica laranja

✓ DADO valor de pagamento > valor devido
  QUANDO tenta lançar
  ENTÃO bloqueia com erro:
    "Valor de pagamento (R$ 6.000) 
    maior que valor devido (R$ 5.500)"
  E oferece opções:
    └─ Registrar como crédito ao cliente
    └─ Verificar comprovante
```

---

### 4.1.4 Funcionalidade: Boleto Bancário

**Descrição:** Gerar código de barras para cobrança

**Integração Bancária:**
- Banco do Brasil
- Bradesco
- Itaú
- Caixa
- Santander
- (Customizável)

**Dados Obrigatórios:**
- Banco (Dropdown)
- Agência
- Conta (sem validação de dígito, fica transparente ao sistema)
- CNPJ JurisConnect

**Campos Auto-Gerados:**
- Código barras (13 dígitos)
- Linha digitável
- Nosso Número
- Data vencimento
- URL visualização boleto

**Críter de Aceitação:**
```
✓ DADO fatura pendente
  QUANDO clica "Gerar Boleto"
  E seleciona "Itaú"
  ENTÃO sistema gera:
    ├─ Código barras válido
    ├─ Linha digitável
    ├─ Link para visualizar PDF
    └─ Email automático ao cliente com boleto

✓ DADO boleto gerado
  QUANDO cliente paga via banco
  ENTÃO reconciliação automática?
    └─ Se integrada, atualiza status automaticamente
    └─ Se manual, email aviso para conferir

✓ DADO boleto não pago até vencimento
  QUANDO venceu
  ENTÃO status muda para "ATRASADO"
  E badge vermelho
  E sistema sugere cobrar (email/whatsapp)
```

---

### 4.1.5 Funcionalidade: Pagamento via PIX

**Descrição:** QR Code dinâmico para receber PIX

**Dados Obrigatórios:**
- Chave PIX (CPF/Email/Telefone/Aleatória)
- Banco

**Dados Auto-Gerados:**
- QR Code dinâmico (vencimento: 24h)
- Cópia/Cola
- ID transação única

**Fluxo:**

```
1. Cria fatura R$ 5.500
2. Clica "Gerar QR PIX"
3. Sistema:
   ├─ Conecta ao banco (API)
   ├─ Gera QR Code único (imagem)
   ├─ Gera Cópia/Cola
   └─ Define vencimento (24h padrão)
4. Cliente escaneia/copia
5. Cliente paga (no app banco)
6. Banco notifica JurisConnect (webhook)
7. Sistema atualiza:
   ├─ Status: COMPLETO
   ├─ Data recebimento
   ├─ ID transação PIX
   └─ Envia confirmação email
```

**Critério de Aceitação:**
```
✓ DADO fatura pendente
  QUANDO clica "QR PIX"
  ENTÃO mostra QR Code
  E cópia/cola
  E aviso: "Válido por 24 horas"

✓ DADO cliente paga QR PIX
  E webhook confirmação recebida
  ENTÃO status automático muda para COMPLETO
  E sem necessidade de upload comprovante

✓ DADO QR expirou
  QUANDO clica "Gerar novo QR PIX"
  ENTÃO novo QR é gerado
  E anterior é invalidado
```

---

## 4.2 Fluxo de Caixa

### 4.2.1 Funcionalidade: Dashboard de Fluxo de Caixa

**Descrição:** Visão de entradas e saídas

**Períodos Disponíveis:**
- Hoje
- Esta semana
- Este mês (padrão)
- Este trimestre
- Este ano
- Customizado (date range)

**Seção 1: Cards Resumo**
```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  FATURADO        │  │  RECEBIDO        │  │  SALDO DEVIDO    │
│  R$ 125.500      │  │  R$ 95.000       │  │  R$ 30.500       │
│  📈 +15% vs mês  │  │  📈 +12% vs mês  │  │  📊 =0% vs mês   │
└──────────────────┘  └──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐
│  ADIMPLÊNCIA     │  │  DIAS MÉDIOS     │
│  79%             │  │  17 dias         │
│  🔴 -5% vs mês   │  │  (para recebimento)
└──────────────────┘  └──────────────────┘
```

**Seção 2: Gráfico Linha (Fluxo Diário)**

```
Eixo Y: R$ (Reais)
Eixo X: Data (Dias do mês)

Linha VERDE: Acumulado recebido
Linha VERMELHA: Acumulado faturado
Diferença: Saldo em aberto

Exemplo:
01/Nov: Faturado R$ 10.000 | Recebido R$ 5.000 | Saldo R$ 5.000
02/Nov: Faturado R$ 15.000 | Recebido R$ 8.000 | Saldo R$ 12.000
03/Nov: Faturado R$ 20.000 | Recebido R$ 20.000 | Saldo R$ 12.000
```

**Seção 3: Tabela de Movimentações Recentes**

| Data | Descrição | Cliente | Correspondente | Valor | Tipo | Status |
|------|---|---|---|---|---|---|
| 02/Nov | Fatura #0001 | Escritório XYZ | Silva & Assoc | R$ 5.500 | Fatura | Parcial |
| 02/Nov | Pagamento PIX | Escritório XYZ | Silva & Assoc | R$ 2.750 | Recebimento | - |
| 01/Nov | Desconto cedido | Empresa ABC | Pereira Advogados | R$ 500 | Desconto | - |

---

### 4.2.2 Funcionalidade: Previsão de Fluxo

**Descrição:** Projetar fluxo futuro baseado em pagamentos pendentes

**Cálculo:**
```
Data Vencimento = Referência
Faturado Previsto = ∑ faturas_pendentes com data_vencimento
Recebido Previsto = Faturado × taxa_recebimento_histórica

Taxa Recebimento Histórica:
  = (Total Recebido / Total Faturado) últimos 90 dias
```

**Visualização:**

```
Projeção Próximos 90 Dias:

Nov:  ████ R$ 45.000
Dez:  ███  R$ 32.000
Jan:  ██   R$ 18.000
Feb:  ██   R$ 15.000

Indicadores:
├─ Fluxo saudável (com base em histórico)
├─ Risco: Clientes com pagamentos atrasados
└─ Sugestão: Acelerar cobranças em clientes com risco alto
```

---

## 4.3 Relatórios Financeiros

### 4.3.1 Funcionalidade: Relatório de Receita por Correspondente

**Descrição:** Quanto cada correspondente faturou

**Período:** Customizável (mês, trimestre, ano)

**Colunas:**
| Correspondente | Demandas | Faturado | Recebido | Saldo | Taxa Receb | Valor Médio |
|---|---|---|---|---|---|---|
| Silva & Assoc | 12 | R$ 65.000 | R$ 58.000 | R$ 7.000 | 89% | R$ 5.416 |
| Pereira Adv | 8 | R$ 42.000 | R$ 40.000 | R$ 2.000 | 95% | R$ 5.250 |
| Total | 20 | R$ 107.000 | R$ 98.000 | R$ 9.000 | 92% | R$ 5.350 |

**Filtros:**
- Data início/fim
- Correspondente (Multi-select)
- Especialidade (Multi-select)
- Cliente (Multi-select)

**Exportação:** PDF, Excel

---

### 4.3.2 Funcionalidade: Relatório de Cobranças em Aberto

**Descrição:** Pagamentos pendentes por cliente

**Status Inclusos:**
- PENDENTE (não vencido ainda)
- PARCIAL (pagamento incompleto)
- ATRASADO (vencido)
- EM_COBRANÇA (cobrança ativa)

**Colunas:**
| Cliente | Fatura | Vencimento | Dias Atraso | Valor | Status | Ações |
|---|---|---|---|---|---|---|
| Escritório XYZ | FAT-0001 | 01/Nov | -1 | R$ 5.500 | Pendente | Cobrar |
| Empresa ABC | FAT-0002 | 25/Oct | 8 | R$ 3.200 | Atrasado | Ação urgente |

**Critério de Aceitação:**
```
✓ DADO relatório cobranças em aberto
  QUANDO filtro por "Atrasado"
  ENTÃO mostra apenas faturas com dias_atraso > 0
  E ordena por maior atraso
  E botão "Enviar cobrança" para cada

✓ DADO cliente com 3 faturas atrasadas
  QUANDO gera relatório
  ENTÃO agrupa por cliente
  E mostra subtotal: R$ X.XXX em atraso
  E oferece ação em lote: "Enviar cobrança todas"
```

---

# 5. AGENDA E CONTROLE DE PRAZOS - 18 Funcionalidades

[Continuação estruturada de 18 funcionalidades...]

---

# 6. DASHBOARD E RELATÓRIOS - 20 Funcionalidades

[Continuação...]

---

# 7. GESTÃO DOCUMENTAL COM OCR - 15 Funcionalidades

[Continuação...]

---

## RESUMO DE INTEGRAÇÃO EXTERNA NECESSÁRIA

1. **Banco de Dados:** PostgreSQL 15
2. **APIs Externas:**
   - ViaCEP (endereços)
   - IBGE (cidades/UFs)
   - Receita Federal (CPF/CNPJ)
   - CNJ (número processo)
   - OAB (validação registro advogado)
   - Bancos (PIX, Boleto)
3. **Serviços:**
   - Email (SMTP)
   - WhatsApp (Twilio/Zenvia)
   - Google Calendar (sync)
   - Google Drive/AWS S3 (armazenamento)
   - OCR (Google Vision / AWS Textract)

---

**Especificação Funcional v1.0 - 163 Funcionalidades** ✅