# JURISCONNECT - Validações e Regras de Negócio Jurídicas Brasileiras

## 📋 ÍNDICE

1. [Validações de Documentos Brasileiros](#1-validações-de-documentos-brasileiros)
2. [Regras de Negócio por Módulo](#2-regras-de-negócio-por-módulo)
3. [Conformidade Processual (CNJ/STJ)](#3-conformidade-processual-cnj-stj)
4. [Cálculo de Prazos (Direito Processual)](#4-cálculo-de-prazos-direito-processual)
5. [Validações Tributárias (ICMS/ISS/PIS)](#5-validações-tributárias)
6. [Validações de Registro Profissional](#6-validações-de-registro-profissional)
7. [Regras de Competência Judicial](#7-regras-de-competência-judicial)

---

# 1. VALIDAÇÕES DE DOCUMENTOS BRASILEIROS

## 1.1 Validação de CPF

**Algoritmo de Validação (Dígito Verificador):**

```javascript
/**
 * Valida CPF brasileiro
 * Formato: XXX.XXX.XXX-XX ou XXXXXXXXXXX
 */
function validarCPF(cpf) {
  // 1. Remove máscara
  cpf = cpf.replace(/\D/g, '');
  
  // 2. Verifica tamanho
  if (cpf.length !== 11) {
    return { valido: false, erro: "CPF deve ter 11 dígitos" };
  }
  
  // 3. Verifica se todos dígitos são iguais (fraude comum)
  if (/^(\d)\1{10}$/.test(cpf)) {
    return { valido: false, erro: "CPF com todos dígitos iguais é inválido" };
  }
  
  // 4. Calcula primeiro dígito verificador
  let soma = 0;
  let resto;
  
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  
  if (resto !== parseInt(cpf.substring(9, 10))) {
    return { valido: false, erro: "Primeiro dígito verificador inválido" };
  }
  
  // 5. Calcula segundo dígito verificador
  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  
  if (resto !== parseInt(cpf.substring(10, 11))) {
    return { valido: false, erro: "Segundo dígito verificador inválido" };
  }
  
  return { valido: true, cpf: cpf };
}

// Exemplos:
validarCPF("123.456.789-09") // { valido: false, erro: "Primeiro dígito..." }
validarCPF("111.111.111-11") // { valido: false, erro: "CPF com todos dígitos iguais..." }
```

**Casos Especiais:**
```
CPF VÁLIDO REJEITA:
├─ 000.000.000-00
├─ 111.111.111-11
├─ 222.222.222-22
├─ ... até 999.999.999-99
└─ (11 combinações totais)

AÇÃO: Bloquear com mensagem
"Este CPF é inválido (sequência comum)"
```

**Consultas Externas Necessárias:**

```
1. Verificação na Receita Federal
   - CPF ativo ou cancelado?
   - Nome cadastrado confere com input?
   - Data nascimento confere?
   - Regularidade fiscal (CNPJ vinculado)?

2. Bloqueios Jurídicos
   - CPF em lista de devedor (SPC)?
   - Restrições judiciais?
   - Mandado de prisão?
   - Ações criminais abertas?
```

---

## 1.2 Validação de CNPJ

**Algoritmo de Validação:**

```javascript
/**
 * Valida CNPJ brasileiro
 * Formato: XX.XXX.XXX/XXXX-XX
 */
function validarCNPJ(cnpj) {
  // 1. Remove máscara
  cnpj = cnpj.replace(/\D/g, '');
  
  // 2. Verifica tamanho
  if (cnpj.length !== 14) {
    return { valido: false, erro: "CNPJ deve ter 14 dígitos" };
  }
  
  // 3. Verifica se todos dígitos são iguais
  if (/^(\d)\1{13}$/.test(cnpj)) {
    return { valido: false, erro: "CNPJ com todos dígitos iguais é inválido" };
  }
  
  // 4. Calcula primeiro dígito verificador
  let multiplicador = 5;
  let soma = 0;
  
  for (let i = 0; i < 12; i++) {
    soma += parseInt(cnpj[i]) * multiplicador;
    multiplicador = multiplicador === 2 ? 9 : multiplicador - 1;
  }
  
  let resto = soma % 11;
  let primeiroDigito = resto < 2 ? 0 : 11 - resto;
  
  if (primeiroDigito !== parseInt(cnpj[12])) {
    return { valido: false, erro: "Primeiro dígito verificador inválido" };
  }
  
  // 5. Calcula segundo dígito verificador
  multiplicador = 6;
  soma = 0;
  
  for (let i = 0; i < 13; i++) {
    soma += parseInt(cnpj[i]) * multiplicador;
    multiplicador = multiplicador === 2 ? 9 : multiplicador - 1;
  }
  
  resto = soma % 11;
  let segundoDigito = resto < 2 ? 0 : 11 - resto;
  
  if (segundoDigito !== parseInt(cnpj[13])) {
    return { valido: false, erro: "Segundo dígito verificador inválido" };
  }
  
  return { valido: true, cnpj: cnpj };
}
```

**Campos do CNPJ (Estrutura):**

```
XX.XXX.XXX/XXXX-XX
│  │    │   │    └─ Dígitos verificadores
│  │    │   └────── Número sequencial
│  │    └────────── Estabelecimento
│  └────────────── Ramo
└──────────────── Matriz (0001-0199) / Filial (0200+)

Exemplo: 12.345.678/0001-90
├─ 12: Ramo
├─ 345: Sequencial 1
├─ 678: Sequencial 2
├─ 0001: Matriz (primeira filial)
└─ 90: Dígitos verificadores
```

**Validações Adicionais:**

```
1. Consulta Receita Federal
   - CNPJ ativo ou cancelado?
   - Razão social confere?
   - Enquadramento fiscal?
   - Regime tributário?
   - Data de abertura?
   - Situação: Ativa/Inativa/Suspenso?

2. Validações Jurídicas
   - Empresa em recuperação?
   - Processo de insolvência?
   - Embargo de bens?
   - Processos judiciais ativos?

3. Validações OAB (se escritório jurídico)
   - Registrado na OAB?
   - Registro ativo?
   - Especialidades registradas?
   - Referência ao CNJ?
```

---

## 1.3 Validação de Inscrição Estadual (IE)

**Validação por UF:**

```
Cada UF tem algoritmo diferente!

┌───────────────────────────────────────┐
│ UF  │ Tamanho │ Algoritmo             │
├─────┼─────────┼──────────────────────┤
│ SP  │ 12-14   │ Específico SP         │
│ MG  │ 13      │ Módulo 11             │
│ RJ  │ 8       │ Módulo 11             │
│ BA  │ 8-9     │ Módulo 10-11          │
│ CE  │ 9       │ Módulo 11             │
│ PE  │ 9       │ Módulo 11             │
│ PR  │ 10      │ Módulo 11             │
│ SC  │ 9       │ Módulo 11             │
│ RS  │ 10      │ Módulo 11             │
│ ES  │ 9       │ Módulo 11             │
│ ... │ ...     │ ...                   │
└───────────────────────────────────────┘

Exemplos válidos:
├─ SP: 123.456.789.012
├─ MG: 1234.5678.9012.3
├─ RJ: 12.345.678
├─ BA: 12.345.678
└─ RS: 1234567890
```

**Implementação:**

```javascript
function validarIE(ie, uf) {
  ie = ie.replace(/\D/g, '');
  
  switch(uf.toUpperCase()) {
    case 'SP':
      return validarIE_SP(ie);
    case 'MG':
      return validarIE_MG(ie);
    case 'RJ':
      return validarIE_RJ(ie);
    case 'BA':
      return validarIE_BA(ie);
    case 'CE':
      return validarIE_CE(ie);
    // ... mais UFs
    default:
      return { valido: false, erro: "UF não implementada" };
  }
}

// Exemplo SP
function validarIE_SP(ie) {
  if (ie.length !== 12) {
    return { valido: false, erro: "IE SP deve ter 12 dígitos" };
  }
  
  // IE SP tem algoritmo complexo com módulo 11
  // [implementação específica]
  
  return { valido: true, ie: ie };
}
```

---

## 1.4 Validação de Número de Processo Judicial (CNJ)

**Padrão CNJ (Resolução 65/2008):**

```
Formato: NNNNNNN-DD.DDDD.D.DD.DDDD
         └─7──┘  └─2─┘└─4─┘ └─2─┘ └─4─┘

Breakdown:
├─ NNNNNNN: Número sequencial (7 dígitos)
│           000000 até 9999999
│
├─ DD: Dígitos verificadores (2 dígitos)
│      Módulo 97 (ISO 7064)
│
├─ DDDD: Ano (4 dígitos)
│        AAAA = 2025
│
├─ D: Segmento do judiciário (1 dígito)
│     1 = Judiciário comum (STJ, TJ, JT)
│     2 = Judiciário especializado (TST, etc)
│
├─ DD: Tribunal (2 dígitos)
│      00 = STF
│      01 = STJ
│      02-26 = TJs dos estados
│      27-31 = Tribunais especializados
│
└─ DDDD: Origem (4 dígitos)
         0001-0099 = Tribunal
         0100-9999 = Juízos inferiores

Exemplo: 0000001-00.2025.0.00.0001
├─ 0000001: Primeira ação (sequencial)
├─ 00: Dígito verificador
├─ 2025: Ano 2025
├─ 0: Judiciário comum
├─ 00: STF
└─ 0001: Origem (Tribunal)
```

**Validação Completa:**

```javascript
function validarProcessoCNJ(processo) {
  // 1. Remove máscara
  processo = processo.replace(/\D/g, '');
  
  // 2. Verifica tamanho
  if (processo.length !== 20) {
    return { valido: false, erro: "Processo deve ter 20 dígitos" };
  }
  
  // 3. Extrai componentes
  const nnnnnnn = processo.substring(0, 7);
  const dd = parseInt(processo.substring(7, 9));
  const aaaa = processo.substring(9, 13);
  const d = processo.substring(13, 14);
  const tribunal = processo.substring(14, 16);
  const origem = processo.substring(16, 20);
  
  // 4. Valida segmento judiciário
  if (d !== '1' && d !== '2') {
    return { valido: false, erro: "Segmento judiciário inválido" };
  }
  
  // 5. Valida tribunal (00-31)
  const numTribunal = parseInt(tribunal);
  if (numTribunal > 31) {
    return { valido: false, erro: "Código tribunal inválido" };
  }
  
  // 6. Calcula dígito verificador (módulo 97)
  const base = origem + aaaa + d + tribunal + nnnnnnn;
  const resto = parseInt(base) % 97;
  const dvCalculado = 98 - resto;
  
  if (dvCalculado !== dd) {
    return { 
      valido: false, 
      erro: `Dígito verificador inválido (esperado: ${dvCalculado}, recebido: ${dd})`
    };
  }
  
  return { 
    valido: true, 
    processo: processo,
    ano: aaaa,
    tribunal: getTribunalNome(numTribunal),
    segmento: d === '1' ? 'Comum' : 'Especializado'
  };
}

// Tabela de tribunais
function getTribunalNome(codigo) {
  const tribunais = {
    0: 'STF (Supremo Tribunal Federal)',
    1: 'STJ (Superior Tribunal de Justiça)',
    2: 'TJ/AC (Acre)',
    3: 'TJ/AL (Alagoas)',
    4: 'TJ/AP (Amapá)',
    5: 'TJ/AM (Amazonas)',
    6: 'TJ/BA (Bahia)',
    7: 'TJ/CE (Ceará)',
    8: 'TJ/DF (Distrito Federal)',
    9: 'TJ/ES (Espírito Santo)',
    10: 'TJ/GO (Goiás)',
    11: 'TJ/MA (Maranhão)',
    12: 'TJ/MT (Mato Grosso)',
    13: 'TJ/MS (Mato Grosso do Sul)',
    14: 'TJ/MG (Minas Gerais)',
    15: 'TJ/PA (Pará)',
    16: 'TJ/PB (Paraíba)',
    17: 'TJ/PR (Paraná)',
    18: 'TJ/PE (Pernambuco)',
    19: 'TJ/PI (Piauí)',
    20: 'TJ/RJ (Rio de Janeiro)',
    21: 'TJ/RN (Rio Grande do Norte)',
    22: 'TJ/RS (Rio Grande do Sul)',
    23: 'TJ/RO (Rondônia)',
    24: 'TJ/RR (Roraima)',
    25: 'TJ/SC (Santa Catarina)',
    26: 'TJ/SP (São Paulo)',
    27: 'TST (Tribunal Superior do Trabalho)',
    28: 'TRF (Tribunal Regional Federal)',
    29: 'TRT (Tribunal Regional do Trabalho)',
    30: 'TRE (Tribunal Regional Eleitoral)',
    31: 'TJDFT (Tribunal de Justiça - DF)'
  };
  return tribunais[codigo] || 'Desconhecido';
}
```

---

# 2. REGRAS DE NEGÓCIO POR MÓDULO

## 2.1 GESTÃO DE CLIENTES - Regras Jurídicas Específicas

### Regra 1: Classificação de Risco por Tipo Cliente

```javascript
/**
 * Classifica risco de cliente para efeito de limite de crédito
 * Baseado em histórico jurídico brasileiro
 */
function classificarRisco(cliente) {
  let pontuacao = 0;
  
  // 1. Tipo cliente
  if (cliente.tipo === 'ESCRITORIO_ADVOCACIA') {
    pontuacao += 30; // Mais confiável
  } else if (cliente.tipo === 'EMPRESA') {
    pontuacao += 20;
  } else if (cliente.tipo === 'DEPARTAMENTO_INTERNO') {
    pontuacao += 35; // Máximo
  } else if (cliente.tipo === 'PESSOA_FISICA') {
    pontuacao += 5; // Risco maior
  }
  
  // 2. Verificações jurídicas (consultas externas)
  const consultas = consultarBloqueiosjuridicos(cliente.cpf_cnpj);
  
  if (consultas.emSPC) {
    pontuacao -= 25; // Devedor comprovado
  }
  if (consultas.temsRestricao) {
    pontuacao -= 30; // Restrição judicial
  }
  if (consultas.temMandado) {
    pontuacao -= 50; // Mandado de prisão/execução
  }
  if (consultas.emRecuperacao) {
    pontuacao -= 40; // Empresa em dificuldade
  }
  
  // 3. Histórico de pagamento (se cliente existente)
  if (cliente.demandas_total > 0) {
    const taxaAdimplencia = cliente.total_pago / cliente.total_faturado;
    pontuacao += (taxaAdimplencia * 20); // Até +20 pontos
  }
  
  // 4. Tempo de relacionamento
  const mesesRelacionamento = calcularMeses(cliente.data_cadastro);
  if (mesesRelacionamento >= 12) {
    pontuacao += 15;
  } else if (mesesRelacionamento >= 6) {
    pontuacao += 8;
  } else if (mesesRelacionamento >= 3) {
    pontuacao += 3;
  }
  
  // 5. Volume de demandas
  if (cliente.demandas_total >= 20) {
    pontuacao += 10;
  } else if (cliente.demandas_total >= 10) {
    pontuacao += 5;
  }
  
  // Classificação final
  if (pontuacao >= 60) return 'BAIXO';
  if (pontuacao >= 30) return 'MEDIO';
  return 'ALTO';
}

/**
 * Consultar bloqueios jurídicos (SPC, Poder Judiciário, etc)
 */
function consultarBloqueiosjuridicos(cpf_cnpj) {
  // Integração com APIs:
  // - SPC Brasil
  // - ServidorJud (STJ)
  // - Registros cartorários
  // - SISBAJUD (Sistema Banco de Alçadas JUDiciais)
  
  return {
    emSPC: verificarSPC(cpf_cnpj),
    temsRestricao: verificarRestricoes(cpf_cnpj),
    temMandado: verificarMandados(cpf_cnpj),
    emRecuperacao: verificarRecuperacao(cpf_cnpj)
  };
}
```

### Regra 2: Limite de Crédito Automático

```javascript
/**
 * Calcula limite de crédito baseado em histórico e classificação
 * Regra brasileira de risco de crédito
 */
function calcularLimiteCredito(cliente, classificacao_risco) {
  // Base: volume médio mensal de demandas
  const volumeMensal = cliente.total_faturado / 
    Math.max(1, calcularMeses(cliente.data_cadastro));
  
  // Multiplicadores por risco
  const multiplicadores = {
    'BAIXO': 3,      // Até 3x o volume médio
    'MEDIO': 2,      // Até 2x
    'ALTO': 1        // Apenas 1x
  };
  
  const multiplicador = multiplicadores[classificacao_risco];
  const limiteCalculado = volumeMensal * multiplicador;
  
  // Limites mínimos e máximos
  const LIMITE_MINIMO = 1000;    // R$ 1.000
  const LIMITE_MAXIMO = 500000;  // R$ 500.000
  
  let limite = limiteCalculado;
  
  if (limite < LIMITE_MINIMO) limite = LIMITE_MINIMO;
  if (limite > LIMITE_MAXIMO) limite = LIMITE_MAXIMO;
  
  return {
    limite_calculado: limiteCalculado,
    limite_final: limite,
    multiplicador_aplicado: multiplicador,
    base_calculo: volumeMensal
  };
}
```

### Regra 3: Restrições por Tipo de Cliente

```
ESCRITÓRIO JURÍDICO:
├─ Requer OAB válida (CNJ)
├─ Requer comprovante registro OAB
├─ Limite de crédito padrão: ALTO
└─ Validação: Consulta OAB + CNJ

EMPRESA COMERCIAL:
├─ Requer CNPJ ativo (Receita Federal)
├─ Verifica ramo de atuação
├─ Limite: MÉDIO
├─ Valida: Receita Federal + SPC
└─ Alerta: Se PJ de ramo restrito

DEPARTAMENTO JURÍDICO (INTERNO):
├─ Requer vinculação a empresa
├─ Herda classificação empresa-mãe
├─ Limite: ALTO (confiança máxima)
└─ Monitora: Saúde financeira da matriz

PESSOA FÍSICA:
├─ Requer CPF válido
├─ Pode ser detentor de processo
├─ Limite: BAIXO (risco alto)
├─ Valida: CPF + SPC + Servidão de dívida
└─ Alerta: Se nome similar a servidor público
```

---

## 2.2 GESTÃO DE CORRESPONDENTES - Validações OAB/CNJ

### Regra 1: Validação de Registro OAB

```javascript
/**
 * Valida número de registro na OAB
 * Formato: OAB/UF XXXXXX/AAAA
 * Exemplo: OAB/SP 123456/2020
 */
function validarRegistroOAB(oab_numero, uf) {
  // 1. Parse
  const regex = /OAB\/([A-Z]{2})\s?(\d{6})\/(\d{4})/;
  const match = oab_numero.match(regex);
  
  if (!match) {
    return { 
      valido: false, 
      erro: "Formato inválido. Use: OAB/UF XXXXXX/AAAA (ex: OAB/SP 123456/2020)" 
    };
  }
  
  const uf_oab = match[1];
  const numero = match[2];
  const ano = match[3];
  
  // 2. Valida UF
  const ufs_validas = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
  
  if (!ufs_validas.includes(uf_oab)) {
    return { valido: false, erro: "UF inválida para OAB" };
  }
  
  if (uf_oab !== uf) {
    return { 
      valido: false, 
      erro: `UF da OAB (${uf_oab}) não confere com UF selecionada (${uf})`
    };
  }
  
  // 3. Valida ano (não pode ser futuro)
  const anoAtual = new Date().getFullYear();
  if (parseInt(ano) > anoAtual) {
    return { 
      valido: false, 
      erro: `Ano de inscrição não pode ser futuro (${ano})`
    };
  }
  
  // 4. Consulta base CNJ
  const consultaCNJ = consultarRegistroCNJ(numero, uf_oab, ano);
  
  if (!consultaCNJ.encontrado) {
    return { 
      valido: false, 
      erro: `Registro OAB/${uf_oab} ${numero}/${ano} não encontrado na base CNJ`
    };
  }
  
  if (consultaCNJ.status !== 'ATIVO') {
    return { 
      valido: false, 
      erro: `Registro OAB com status: ${consultaCNJ.status}`,
      status: consultaCNJ.status
    };
  }
  
  return {
    valido: true,
    oab_validado: `OAB/${uf_oab} ${numero}/${ano}`,
    advogado_nome: consultaCNJ.nome,
    especialidades: consultaCNJ.especialidades,
    status: consultaCNJ.status,
    data_inscricao: consultaCNJ.data_inscricao
  };
}
```

### Regra 2: Compatibilidade Especialidade vs OAB

```javascript
/**
 * Verifica se especialidades declaradas conferem com registro OAB
 */
function validarEspecialidadesOAB(especialidades_sistema, oab_data) {
  // Especialidades registradas na OAB
  const especialidades_oab = oab_data.especialidades.map(e => e.codigo);
  
  const erros = [];
  const avisos = [];
  
  especialidades_sistema.forEach(esp_sistema => {
    // Nível especialista requer inscrição específica?
    if (esp_sistema.nivel === 'ESPECIALISTA') {
      // Verifica se é especialidade inscrita
      if (!especialidades_oab.includes(esp_sistema.codigo)) {
        erros.push(`
          Especialidade "${esp_sistema.nome}" com nível ESPECIALISTA
          não consta em registro OAB
          Requer inscrição específica na OAB
        `);
      }
    }
    
    // Alerta se nível incompatível
    if (esp_sistema.nivel === 'SENIOR' && 
        (parseInt(new Date().getFullYear() - oab_data.data_inscricao.getFullYear()) < 10)) {
      avisos.push(`
        Advogado com menos de 10 anos de inscrição
        Nível SENIOR pode ser ajustado para PLENO
      `);
    }
  });
  
  return {
    valido: erros.length === 0,
    erros: erros,
    avisos: avisos
  };
}
```

### Regra 3: Restrições Profissionais

```javascript
/**
 * Verifica restrições éticas/profissionais do advogado
 */
function verificarRestricoesProfissionais(cpf_advogado, oab_uf, oab_numero) {
  const consulta = {};
  
  // 1. Disciplinar (CNJ)
  consulta.processos_disciplinares = consultarProcessosDisciplinares(cpf_advogado, oab_uf);
  
  // 2. Suspensão (OAB)
  consulta.suspenso_oab = verificarSuspensaoOAB(oab_numero, oab_uf);
  
  // 3. Impedimentos (CPC)
  consulta.tem_impedimento = verificarImpedimentoCPC(cpf_advogado);
  
  // 4. Vínculos vedados
  consulta.tem_vinculo_vedado = verificarVinculosVedados(cpf_advogado);
  
  // Decisão final
  if (consulta.suspenso_oab || 
      consulta.tem_impedimento || 
      consulta.processos_disciplinares.length > 0) {
    return {
      pode_exercer: false,
      motivo: montarMotivoRestricao(consulta),
      restricoes: consulta
    };
  }
  
  return {
    pode_exercer: true,
    restricoes: consulta,
    avisos: montarAvisos(consulta)
  };
}
```

---

## 2.3 GESTÃO DE DEMANDAS - Validações Processuais

### Regra 1: Número de Processo Válido

```
ANTES (Sem processo): Permite criar
├─ Título: Obrigatório
├─ Descrição: Obrigatória
└─ Processo: Opcional

DEPOIS (Com processo): Valida CNJ
├─ Formato: NNNNNNN-DD.DDDD.D.DD.DDDD ✓
├─ Consulta CNJ: Valida número
├─ Extrai automaticamente:
│  ├─ Tribunal
│  ├─ Ano
│  ├─ Tipo de ação
│  ├─ Partes (se possível)
│  └─ Estágio processual
├─ Preenche automaticamente campos
├─ Busca documentos relacionados
└─ Oferece vincular jurisprudência
```

### Regra 2: Competência Territorial (Foro)

```javascript
/**
 * Valida e define foro competente baseado em CPC
 */
function definirForoCompetente(demanda) {
  // CPC Art. 46-84 - Regras de competência
  
  const tipo_acao = demanda.tipo_acao;
  const partes = demanda.partes;
  
  // 1. Competência Territorial (CPC Art. 46-69)
  let foro_competente = [];
  
  switch (tipo_acao) {
    case 'EXECUCAO':
      // Art. 53: Foro do domicílio do devedor ou patrimônio
      foro_competente = [
        { 
          opcao: 'domicilio_devedor',
          localizacao: partes.devedor.domicilio,
          artigo: 'CPC Art. 53'
        }
      ];
      break;
      
    case 'DIREITOS_REAIS':
      // Art. 47: Foro do local do imóvel (em geral)
      foro_competente = [
        {
          opcao: 'localizacao_imovel',
          localizacao: demanda.imovel_endereco,
          artigo: 'CPC Art. 47'
        }
      ];
      break;
      
    case 'FAMILIA':
      // Art. 53: Domicílio do réu
      // Exceções: Arts. 54, 55
      foro_competente = [
        {
          opcao: 'domicilio_reu',
          localizacao: partes.reu.domicilio,
          artigo: 'CPC Art. 53'
        }
      ];
      break;
      
    case 'TRABALHISTA':
      // CLT Art. 651: Foro do local onde serviço foi prestado
      foro_competente = [
        {
          opcao: 'local_prestacao_servico',
          localizacao: demanda.local_trabajo,
          artigo: 'CLT Art. 651'
        }
      ];
      break;
      
    default:
      // Regra geral: Domicílio do réu (Art. 53)
      foro_competente = [
        {
          opcao: 'domicilio_reu',
          localizacao: partes.reu.domicilio,
          artigo: 'CPC Art. 53 (Regra Geral)'
        }
      ];
  }
  
  return {
    foros_competentes: foro_competente,
    observacoes: gerarObservacoes(tipo_acao, partes),
    alerta: alertasForoCompetente(tipo_acao, demanda)
  };
}
```

### Regra 3: Tipo de Ação e Procedimento

```javascript
/**
 * Define procedimento adequado baseado em CPC
 */
function definirProcedimento(demanda) {
  const valor = demanda.valor_causa;
  const tipo = demanda.tipo_acao;
  
  let procedimento = {};
  
  // CPC Art. 275-277 - Causas de menor complexidade
  if (valor <= 20000) { // Até 20 salários mínimos (2025)
    procedimento.tipo = 'JUIZADO_ESPECIAL_CIVEL';
    procedimento.artigo = 'Lei 9099/95';
    procedimento.caracteristicas = [
      'Procedimento sumário',
      'Sem audiência obrigatória',
      'Decisão em até 30 dias',
      'Sem recursos (em geral)',
      'Execução imediata da sentença'
    ];
  }
  // Valores intermediários
  else if (valor <= 300000) {
    procedimento.tipo = 'PROCEDIMENTO_COMUM_ORDINARIO';
    procedimento.artigo = 'CPC Art. 318-363';
    procedimento.caracteristicas = [
      'Procedimento padrão',
      'Petição inicial com requisitos específicos',
      'Audiência de conciliação',
      'Fase de conhecimento',
      'Recursos (apelação, etc)',
      'Prazo médio: 3-5 anos'
    ];
  }
  // Valores altos
  else {
    procedimento.tipo = 'PROCEDIMENTO_COMPLEXO';
    procedimento.artigo = 'CPC Art. 337';
    procedimento.caracteristicas = [
      'Causas de grande complexidade',
      'Perícia obrigatória (em geral)',
      'Múltiplas fases',
      'Recursos diversos',
      'Prazo indeterminado',
      'Pode chegar ao STJ/STF'
    ];
  }
  
  return procedimento;
}
```

---

# 3. CONFORMIDADE PROCESSUAL (CNJ/STJ)

## 3.1 Requisitos Formais de Ação (CPC Art. 319-320)

```
PETIÇÃO INICIAL DEVE CONTER:

1. ✓ Número de registro
   └─ Sistema JurisConnect: DEM-2025-XXXXX

2. ✓ Endereço na comarca (OAB nº)
   └─ Vinculado ao correspondente

3. ✓ Nome, sobrenome, profissão, estado civil, documento de identidade
   └─ Carregado de correspondente_profissional

4. ✓ Qualificação das partes (autor e réu)
   └─ Nome completo, CPF/CNPJ, enderço

5. ✓ Descrição do bem litigioso (se cabível)
   └─ Detalhes específicos na demanda

6. ✓ Exposição dos fatos
   └─ Campo "Descrição da demanda"

7. ✓ Fundamentos jurídicos
   └─ Especialidade jurídica associada

8. ✓ Pedido
   └─ Tipo de ação explícito

9. ✓ Valor da causa
   └─ Sempre declarado

10. ✓ Data e assinatura
    └─ Gerado automaticamente + assinatura digital

VALIDAÇÕES IMPLEMENTADAS:
├─ Se falta qualquer item: REJEITA
├─ Log: Qual item está faltando
├─ Oferece: Completar ou salvar rascunho
└─ Impede: Envio sem completar
```

---

## 3.2 Prazos Processuais Brasileiros

```javascript
/**
 * Calcula prazos processuais brasileiros
 * Excluindo sábados, domingos e feriados nacionais
 */
class PrazoProcessual {
  constructor() {
    this.feriadosNacionais = [
      { mes: 1, dia: 1 }, // Ano Novo
      { mes: 1, dia: 20 }, // Dia do Advogado
      { mes: 4, dia: 21 }, // Tiradentes
      { mes: 5, dia: 1 }, // Dia do Trabalho
      { mes: 9, dia: 7 }, // Independência
      { mes: 10, dia: 12 }, // N. Sra. Aparecida
      { mes: 11, dia: 2 }, // Finados
      { mes: 11, dia: 15 }, // Proclamação República
      { mes: 11, dia: 20 }, // Consciência Negra
      { mes: 12, dia: 25 } // Natal
    ];
  }
  
  /**
   * Calcula data limite para cumprimento de prazo
   * CPC Art. 219 - Prazos em dias úteis
   */
  calcularPrazoUteis(dataInicio, dias) {
    let dataAtual = new Date(dataInicio);
    let diasContados = 0;
    
    while (diasContados < dias) {
      dataAtual.setDate(dataAtual.getDate() + 1);
      
      // Pula sábado e domingo
      if (dataAtual.getDay() === 0 || dataAtual.getDay() === 6) {
        continue;
      }
      
      // Pula feriados nacionais
      if (this.ehFeriadoNacional(dataAtual)) {
        continue;
      }
      
      diasContados++;
    }
    
    return dataAtual;
  }
  
  /**
   * CPC Art. 220 - Prazo em meses
   */
  calcularPrazoMeses(dataInicio, meses) {
    const dataFinal = new Date(dataInicio);
    dataFinal.setMonth(dataFinal.getMonth() + meses);
    
    // Se caiu em fim de semana, vai para segunda
    while (dataFinal.getDay() === 0 || dataFinal.getDay() === 6) {
      dataFinal.setDate(dataFinal.getDate() + 1);
    }
    
    return dataFinal;
  }
  
  /**
   * CPC Art. 219 § 2º - Início do prazo
   */
  calcularInicioDoSeguinteDia(dataNotificacao) {
    // Prazo começa no dia seguinte à notificação
    return new Date(dataNotificacao.getTime() + 86400000); // +1 dia
  }
  
  ehFeriadoNacional(data) {
    return this.feriadosNacionais.some(feriado =>
      feriado.mes === data.getMonth() + 1 &&
      feriado.dia === data.getDate()
    );
  }
  
  /**
   * Prazos comuns em demandas jurídicas
   */
  static PRAZOS_PADRAO = {
    'RESPOSTA_CITACAO': 15, // dias úteis (CPC 335)
    'ALEGACOES_FINAIS': 20, // dias úteis (CPC 456)
    'RECURSO': 15, // dias úteis (CPC 1007)
    'AGRAVO': 20, // dias úteis
    'RECURSO_EXTRAORDINARIO': 30, // dias úteis (CPC 1050)
    'EMBARGOS_DECLARACAO': 5, // dias úteis
    'EXECUCAO_PENHORA': 60 // dias corridos
  };
}
```

---

# 4. CÁLCULO DE PRAZOS (DIREITO PROCESSUAL)

## 4.1 Tipos de Prazos (CPC 219-223)

```
PRAZO EM DIAS ÚTEIS (CPC Art. 219)
├─ Contagem: Dias úteis = seg-sex (excluindo domingos/sábados)
├─ Inclui: Feriados municipais/estaduais normalmente
├─ Início: Dia seguinte ao evento (notificação, despacho, etc)
├─ Término: Fim do expediente do último dia (CPC 220 § 1º)
├─ Exemplos:
│  ├─ 15 dias úteis para resposta (CPC 335)
│  ├─ 20 dias úteis para alegações finais
│  └─ 15 dias úteis para recurso
└─ Implementação: Business day calculation

PRAZO EM DIAS CORRIDOS (CPC Art. 221)
├─ Contagem: Todos os dias (seg-dom, feriados inclusos)
├─ Início: Dia seguinte ao evento
├─ Término: Final do último dia (CPC 220 § 1º)
├─ Exemplos:
│  ├─ Execução (penhora): 60 dias corridos
│  ├─ Arresto: Alguns casos
│  └─ Embargo: Pode ser corrido em contextos específicos
└─ Implementação: Standard day calculation

PRAZO EM MESES (CPC Art. 222)
├─ Contagem: Mês a mês (ex: 2 meses = 2 datas depois)
├─ Início: Dia seguinte ao evento
├─ Término: No mês correspondente + mesmo dia
├─ Se não existir dia (ex: 31/fev), vai para último dia
├─ Exemplos:
│  ├─ Processo de insolvência: variável
│  ├─ Recursos ao STJ: 15 dias (convertido para úteis)
│  └─ Procedimentos especiais: variável
└─ Implementação: Calendar month calculation

PRAZO EM ANOS
├─ Prescrição (CC 189-206)
├─ Decadência (CC 207-211)
├─ Exemplos:
│  ├─ Cobrança: 3 anos (CC 205)
│  ├─ Ação pessoal: 10 anos (CC 205 caput)
│  ├─ Inadimplência: 3 anos
│  └─ Alimentos: 2 anos (CC 206)
└─ Implementação: Year-based calendar
```

---

# 5. VALIDAÇÕES TRIBUTÁRIAS

## 5.1 ISS (Imposto sobre Serviços)

```javascript
/**
 * Calcula ISS sobre honorários de advogado
 * Lei Complementar 116/2003
 */
function calcularISS(valor_servico, municipio) {
  // ISS é de competência municipal
  // Alíquota: 2% a 5% (varia por município)
  
  const aliquotas_municipais = {
    'SP': 0.05, // 5%
    'RJ': 0.05, // 5%
    'MG': 0.03, // 3%
    'BA': 0.02, // 2%
    'RS': 0.04, // 4%
    'default': 0.05 // 5% padrão
  };
  
  const aliquota = aliquotas_municipais[municipio] || aliquotas_municipais['default'];
  
  // ISS NÃO é base para cálculo de outros impostos
  // É retido pelo tomador do serviço
  
  const iss = valor_servico * aliquota;
  
  return {
    valor_servico: valor_servico,
    aliquota: aliquota * 100,
    iss: iss,
    valor_liquido: valor_servico - iss,
    retem: 'Tomador do serviço (cliente)',
    base_legal: 'LC 116/2003',
    codigo_servico: '74.01' // Serviços jurídicos
  };
}
```

## 5.2 PIS/PASEP (Contribuição Social)

```javascript
/**
 * Calcula PIS para escritório de advocacia
 * Lei 10.147/2000
 */
function calcularPIS(receita_bruta, regime_tributario) {
  // PIS varia por regime
  
  if (regime_tributario === 'SIMPLES_NACIONAL') {
    // Dispensado (já está incluído no Simples)
    return {
      aliquota: 0,
      pis: 0,
      regime: 'SIMPLES_NACIONAL',
      dispensado: true
    };
  }
  
  if (regime_tributario === 'LUCRO_REAL') {
    // 1,65% sobre receita
    const aliquota = 0.0165;
    const pis = receita_bruta * aliquota;
    
    return {
      aliquota: 1.65,
      pis: pis,
      regime: 'LUCRO_REAL',
      dispensado: false,
      base_legal: 'Lei 10147/2000'
    };
  }
  
  if (regime_tributario === 'LUCRO_PRESUMIDO') {
    // 1,65% sobre receita
    const aliquota = 0.0165;
    const pis = receita_bruta * aliquota;
    
    return {
      aliquota: 1.65,
      pis: pis,
      regime: 'LUCRO_PRESUMIDO',
      dispensado: false
    };
  }
}
```

## 5.3 COFINS

```javascript
/**
 * Calcula COFINS para serviços jurídicos
 * Lei Complementar 121/2006
 */
function calcularCOFINS(receita_bruta, regime_tributario) {
  if (regime_tributario === 'SIMPLES_NACIONAL') {
    return { dispensado: true, regime: 'SIMPLES_NACIONAL' };
  }
  
  // Alíquota geral: 7,6%
  const aliquota = 0.076;
  const cofins = receita_bruta * aliquota;
  
  return {
    aliquota: 7.6,
    cofins: cofins,
    regime: regime_tributario,
    base_legal: 'Lei 10147/2000, art. 8º'
  };
}
```

---

# 6. VALIDAÇÕES DE REGISTRO PROFISSIONAL

## 6.1 OAB - Ordem dos Advogados do Brasil

```
VINCULAÇÕES OBRIGATÓRIAS (Estatuto OAB):

1. INSCRIÇÃO PRINCIPAL
   └─ Uma por advogado
      ├─ OAB/UF numero/ano
      ├─ Status: ATIVA, SUSPENSA, CANCELADA
      ├─ Data inscrição (não muda)
      └─ Subseção (regional)

2. INSCRIÇÃO SECUNDÁRIA
   └─ Pode ter em outro estado
      ├─ Vinculada à inscrição principal
      ├─ Status: Mesmo da principal
      └─ Permite atuar no estado (com restrições)

3. ESPECIALIZAÇÃO (Lei 8906/94, Art. 8)
   └─ Inscrição especial para:
      ├─ Advocacia Criminal
      ├─ Advocacia Trabalhista
      ├─ Advocacia Previdenciária
      ├─ Advocacia Tributária
      └─ Outras conforme Conselho

RESTRIÇÕES:
├─ Não pode ser juiz e advogado simultaneamente
├─ Não pode ser funcionário público (com exceções)
├─ Não pode ser membro da OAB
├─ Deve cumprir código de ética (Resolução 02/2015)
└─ Filiação: Obrigatória ao exercer advocacia
```

---

# 7. REGRAS DE COMPETÊNCIA JUDICIAL

## 7.1 Determinação de Foro

```
CPC Art. 46-69: Regras de Competência Territorial

1. EXECUÇÃO
   └─ Art. 53: Domicílio do DEVEDOR (a regra)
      ├─ Se devedor resida em local desconhecido
      │  └─ Art. 53 § 1º: Domicílio de qualquer bem seu
      └─ Se devedor resida no exterior
         └─ Art. 53 § 2º: Foro onde foi citado ou domicílio no Brasil

2. DIREITOS REAIS SOBRE IMÓVEL
   └─ Art. 47: Foro da localização do imóvel
      ├─ Imóvel no Brasil
      │  └─ Foro da Comarca onde fica
      └─ Imóvel no exterior
         └─ Domicílio do réu

3. AÇÕES CÍVEIS DE FAMÍLIA
   └─ Art. 53: Domicílio do réu
      ├─ Exceção 1 - Divórcio (Art. 53 § 3º): Domicílio de qualquer cônjuge
      └─ Exceção 2 - Alimentos (Art. 53 § 3º): Domicílio do alimentando

4. AÇÕES TRABALHISTAS
   └─ CLT Art. 651: Local onde serviço foi prestado
      ├─ Domicílio do trabalhador
      └─ Local onde ocorreu acidente
```

---

**Validações e Regras de Negócio Jurídicas Brasileiras - Completo** ✅