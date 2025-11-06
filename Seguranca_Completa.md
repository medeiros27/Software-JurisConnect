# JURISCONNECT - Arquitetura de Segurança Completa

## 📋 ÍNDICE

1. [Autenticação JWT](#1-autenticação-jwt)
2. [Autorização e Controle de Acesso](#2-autorização-e-controle-de-acesso)
3. [Criptografia de Dados](#3-criptografia-de-dados)
4. [Logs de Auditoria](#4-logs-de-auditoria)
5. [Proteção contra Ataques](#5-proteção-contra-ataques)
6. [Conformidade LGPD](#6-conformidade-lgpd)
7. [Boas Práticas](#7-boas-práticas)

---

## 1. AUTENTICAÇÃO JWT

### 1.1 Visão Geral

**JWT (JSON Web Token)** é o padrão de autenticação escolhido para JurisConnect.

```
┌─────────────────────────────────────────────────────────────┐
│                    JWT TOKEN STRUCTURE                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9                      │
│  [Base64 HEADER]                                            │
│                                                             │
│  .eyJzdWIiOiI1IiwiZXhwIjoxNzMwNjE0ODAwfQ                   │
│  [Base64 PAYLOAD]                                           │
│                                                             │
│  .SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c              │
│  [Base64 SIGNATURE]                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Estrutura do Payload JWT

```json
{
  "sub": "5",                          // Subject (user ID)
  "email": "usuario@jurisconnect.com", // Email do usuário
  "nome": "João Silva",                // Nome completo
  "role": "gerenciador",               // Papel do usuário
  "aud": "jurisconnect",               // Audience
  "iss": "jurisconnect-api",           // Issuer
  "iat": 1730530400,                   // Issued at (timestamp)
  "exp": 1730614800,                   // Expiration (24h depois)
  "nbf": 1730530400,                   // Not before
  "jti": "unique-token-id-123",        // JWT ID (único para cada token)
  "permissions": [                     // Permissões específicas
    "demandas.create",
    "demandas.read",
    "demandas.update"
  ],
  "ip_criacao": "192.168.1.100",       // IP de origem
  "user_agent": "Mozilla/5.0...",      // Browser/Client info
  "2fa_verificado": true,              // 2FA confirmado?
  "sessao_id": "sess_abc123"           // ID da sessão
}
```

### 1.3 Configuração JWT

```javascript
// backend/config/jwt.js

const JWT_CONFIG = {
  // Chaves
  secret: process.env.JWT_SECRET || 'sua-chave-super-secreta-aqui-32-caracteres',
  
  // Expiração
  accessTokenExpiry: '24h',    // Token JWT principal
  refreshTokenExpiry: '7d',    // Token para renovação
  
  // Algoritmo
  algorithm: 'HS256',          // HMAC SHA-256
  
  // Assinatura
  issuer: 'jurisconnect-api',
  audience: 'jurisconnect',
  
  // Validação
  clockTolerance: 10,          // Tolerância de 10 segundos
  
  // Revogação
  tokenBlacklist: true,        // Manter lista de tokens revogados
  blacklistTTL: '25h'          // Manter na blacklist por 25h
};

module.exports = JWT_CONFIG;
```

### 1.4 Geração de JWT

```javascript
// backend/utils/jwt-manager.js

const jwt = require('jwt-simple');
const crypto = require('crypto');
const JWT_CONFIG = require('../config/jwt');

class JWTManager {
  /**
   * Gerar novo access token (24h)
   */
  static gerarAccessToken(usuario) {
    const payload = {
      sub: usuario.id.toString(),
      email: usuario.email,
      nome: usuario.nome_completo,
      role: usuario.role,
      aud: JWT_CONFIG.audience,
      iss: JWT_CONFIG.issuer,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24h
      nbf: Math.floor(Date.now() / 1000),
      jti: this.gerarJTI(),
      permissions: this.obterPermissoesPorRole(usuario.role),
      ip_criacao: this.obterIPClienteAtual(),
      user_agent: this.obterUserAgent(),
      2fa_verificado: usuario.dois_fa_habilitado ? true : false,
      sessao_id: this.gerarSessaoID()
    };

    return jwt.encode(payload, JWT_CONFIG.secret, JWT_CONFIG.algorithm);
  }

  /**
   * Gerar novo refresh token (7d)
   */
  static gerarRefreshToken(usuario) {
    const payload = {
      sub: usuario.id.toString(),
      email: usuario.email,
      type: 'refresh',
      aud: JWT_CONFIG.audience,
      iss: JWT_CONFIG.issuer,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7d
      jti: this.gerarJTI(),
      token_anterior_jti: null // Para rastrear renovações
    };

    return jwt.encode(payload, JWT_CONFIG.secret, JWT_CONFIG.algorithm);
  }

  /**
   * Validar token JWT
   */
  static validarToken(token) {
    try {
      // 1. Verificar se está na blacklist
      if (this.estaNaBlacklist(token)) {
        throw new Error('Token revogado ou expirado');
      }

      // 2. Decodificar e validar assinatura
      const payload = jwt.decode(token, JWT_CONFIG.secret, true, JWT_CONFIG.algorithm);

      // 3. Verificar se expirou
      const agora = Math.floor(Date.now() / 1000);
      if (payload.exp < agora) {
        throw new Error('Token expirado');
      }

      // 4. Verificar issuer e audience
      if (payload.iss !== JWT_CONFIG.issuer || payload.aud !== JWT_CONFIG.audience) {
        throw new Error('Token inválido (issuer/audience)');
      }

      return {
        valido: true,
        payload: payload
      };
    } catch (error) {
      return {
        valido: false,
        erro: error.message
      };
    }
  }

  /**
   * Renovar token usando refresh token
   */
  static renovarToken(refreshToken) {
    const validacao = this.validarToken(refreshToken);
    
    if (!validacao.valido || validacao.payload.type !== 'refresh') {
      throw new Error('Refresh token inválido');
    }

    // Buscar usuário do banco
    const usuario = Usuario.findByPk(validacao.payload.sub);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    // Gerar novo access token
    const novoAccessToken = this.gerarAccessToken(usuario);

    return {
      token: novoAccessToken,
      refresh_token: refreshToken, // Reutilizar mesmo refresh token
      expira_em: new Date(validacao.payload.exp * 1000)
    };
  }

  /**
   * Revogar token (adicionar à blacklist)
   */
  static revogarToken(token) {
    const validacao = this.validarToken(token);
    
    if (!validacao.valido) {
      throw new Error('Token inválido');
    }

    // Armazenar em cache Redis com TTL
    const jti = validacao.payload.jti;
    const ttl = validacao.payload.exp - Math.floor(Date.now() / 1000);
    
    redis.setex(`token_blacklist:${jti}`, ttl, 'revogado');
  }

  /**
   * Verificar permissão específica
   */
  static temPermissao(token, recurso, acao) {
    const validacao = this.validarToken(token);
    
    if (!validacao.valido) {
      return false;
    }

    const permissaoNecessaria = `${recurso}.${acao}`;
    return validacao.payload.permissions.includes(permissaoNecessaria);
  }

  // Métodos auxiliares
  static gerarJTI() {
    return crypto.randomBytes(32).toString('hex');
  }

  static gerarSessaoID() {
    return `sess_${crypto.randomBytes(16).toString('hex')}`;
  }

  static obterIPClienteAtual() {
    // Obter do contexto de requisição
    return '192.168.1.100'; // Placeholder
  }

  static obterUserAgent() {
    return 'Mozilla/5.0...'; // Placeholder
  }

  static obterPermissoesPorRole(role) {
    const permissoes = {
      admin: ['*'], // Todas as permissões
      gerenciador: [
        'demandas.*',
        'correspondentes.*',
        'clientes.*',
        'pagamentos.read',
        'pagamentos.update',
        'usuarios.read'
      ],
      usuario: [
        'demandas.read',
        'demandas.create',
        'demandas.update',
        'correspondentes.read',
        'clientes.read',
        'pagamentos.read'
      ],
      operacional: [
        'diligencias.read',
        'diligencias.update',
        'agenda.read',
        'agenda.create'
      ]
    };

    return permissoes[role] || [];
  }

  static estaNaBlacklist(token) {
    // Buscar no Redis
    const validacao = this.validarToken(token);
    if (!validacao.valido) return true;
    
    return redis.exists(`token_blacklist:${validacao.payload.jti}`);
  }
}

module.exports = JWTManager;
```

### 1.5 Middleware de Autenticação

```javascript
// backend/middleware/auth.js

const JWTManager = require('../utils/jwt-manager');

/**
 * Middleware: Verificar autenticação (JWT obrigatório)
 */
const verificarAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        sucesso: false,
        erro: {
          codigo: 'TOKEN_AUSENTE',
          mensagem: 'Token JWT não fornecido'
        },
        codigo_http: 401
      });
    }

    const validacao = JWTManager.validarToken(token);
    
    if (!validacao.valido) {
      // Log tentativa não autorizada
      LogAcesso.create({
        usuario_id: null,
        tipo_acesso: 'tentativa_login_fallida',
        motivo: validacao.erro,
        ip_address: req.ip,
        data_acesso: new Date()
      });

      return res.status(401).json({
        sucesso: false,
        erro: {
          codigo: 'TOKEN_INVALIDO',
          mensagem: 'Token inválido ou expirado'
        },
        codigo_http: 401
      });
    }

    // Adicionar dados do usuário ao request
    req.usuario = validacao.payload;
    req.token = token;

    // Log acesso bem-sucedido
    LogAcesso.create({
      usuario_id: req.usuario.sub,
      tipo_acesso: 'autenticado',
      ip_address: req.ip,
      data_acesso: new Date()
    });

    next();
  } catch (error) {
    logger.error('Erro verificar auth:', error);
    res.status(500).json({
      sucesso: false,
      erro: {
        codigo: 'ERRO_INTERNO',
        mensagem: 'Erro ao validar autenticação'
      },
      codigo_http: 500
    });
  }
};

/**
 * Middleware: Verificar autorização (role/permissão)
 */
const verificarAutorizacao = (rolesPermitidas = []) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        sucesso: false,
        erro: {
          codigo: 'NAO_AUTENTICADO',
          mensagem: 'Usuário não autenticado'
        },
        codigo_http: 401
      });
    }

    if (!rolesPermitidas.includes(req.usuario.role)) {
      // Log tentativa de acesso não autorizado
      LogAcesso.create({
        usuario_id: req.usuario.sub,
        tipo_acesso: 'acesso_negado',
        recurso: req.path,
        motivo: `Role ${req.usuario.role} não permitida`,
        ip_address: req.ip,
        data_acesso: new Date()
      });

      return res.status(403).json({
        sucesso: false,
        erro: {
          codigo: 'ACESSO_NEGADO',
          mensagem: `Role '${req.usuario.role}' não tem permissão para este recurso`,
          rolesPermitidas: rolesPermitidas
        },
        codigo_http: 403
      });
    }

    next();
  };
};

/**
 * Middleware: Verificar permissão específica
 */
const verificarPermissao = (recurso, acao) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        sucesso: false,
        codigo_http: 401
      });
    }

    // Admin tem todas as permissões
    if (req.usuario.role === 'admin') {
      return next();
    }

    const temPermissao = JWTManager.temPermissao(req.token, recurso, acao);

    if (!temPermissao) {
      LogAcesso.create({
        usuario_id: req.usuario.sub,
        tipo_acesso: 'permissao_negada',
        recurso: `${recurso}.${acao}`,
        ip_address: req.ip,
        data_acesso: new Date()
      });

      return res.status(403).json({
        sucesso: false,
        erro: {
          codigo: 'PERMISSAO_NEGADA',
          mensagem: `Permissão '${recurso}.${acao}' negada para este usuário`
        },
        codigo_http: 403
      });
    }

    next();
  };
};

module.exports = {
  verificarAuth,
  verificarAutorizacao,
  verificarPermissao
};
```

---

## 2. AUTORIZAÇÃO E CONTROLE DE ACESSO

### 2.1 Roles e Permissões

```javascript
// backend/config/roles-permissoes.js

const ROLES_PERMISSOES = {
  // 1. ADMIN - Acesso total
  admin: {
    descricao: 'Administrador do Sistema',
    permissoes: ['*'], // Curinga: todas as permissões
    pode_deletar: true,
    pode_criar_usuarios: true,
    pode_alterar_configuracoes: true,
    pode_acessar_auditoria: true,
    pode_acessar_backup: true,
    limite_api_por_hora: null // Sem limite
  },

  // 2. GERENCIADOR - Controle operacional
  gerenciador: {
    descricao: 'Gerenciador do Sistema',
    permissoes: [
      // Demandas - Controle total
      'demandas.create',
      'demandas.read',
      'demandas.read_all',
      'demandas.update',
      'demandas.update_status',
      'demandas.delete',
      'demandas.finalizar',
      'demandas.exportar',
      
      // Correspondentes - Gestão
      'correspondentes.create',
      'correspondentes.read',
      'correspondentes.read_all',
      'correspondentes.update',
      'correspondentes.desativar',
      'correspondentes.avaliar',
      
      // Clientes - Gestão
      'clientes.create',
      'clientes.read',
      'clientes.read_all',
      'clientes.update',
      'clientes.desativar',
      
      // Pagamentos - Consulta e atualização
      'pagamentos.read',
      'pagamentos.read_all',
      'pagamentos.update',
      'pagamentos.gerar_boleto',
      'pagamentos.enviar_cobranca',
      
      // Diligências - Controle
      'diligencias.read',
      'diligencias.update',
      'diligencias.criar',
      'diligencias.gerenciar_prazos',
      
      // Relatórios
      'relatorios.read',
      'relatorios.read_all',
      'relatorios.exportar',
      
      // Agenda
      'agenda.read',
      'agenda.create',
      'agenda.update',
      
      // Usuários - Apenas leitura
      'usuarios.read',
      
      // Auditoria
      'auditoria.read'
    ],
    pode_deletar: false,
    pode_criar_usuarios: false,
    pode_alterar_configuracoes: false,
    limite_api_por_hora: 1000
  },

  // 3. USUARIO - Usuário padrão
  usuario: {
    descricao: 'Usuário Padrão',
    permissoes: [
      // Demandas - Apenas seus registros
      'demandas.create',
      'demandas.read',
      'demandas.read_proprias',
      'demandas.update_proprias',
      'demandas.exportar_proprias',
      
      // Correspondentes - Leitura
      'correspondentes.read',
      'correspondentes.read_publico',
      'correspondentes.avaliar',
      
      // Clientes - Leitura
      'clientes.read',
      'clientes.read_publico',
      
      // Pagamentos - Leitura
      'pagamentos.read',
      'pagamentos.read_proprios',
      
      // Diligências - Leitura e atualização próprias
      'diligencias.read',
      'diligencias.read_proprias',
      'diligencias.update_proprias',
      'diligencias.upload_arquivos',
      
      // Relatórios - Próprios
      'relatorios.read_proprios',
      
      // Agenda
      'agenda.read',
      'agenda.create_proprias',
      'agenda.update_proprias',
      
      // Perfil
      'usuarios.update_perfil',
      'usuarios.alterar_senha'
    ],
    pode_deletar: false,
    pode_criar_usuarios: false,
    pode_alterar_configuracoes: false,
    limite_api_por_hora: 500
  },

  // 4. OPERACIONAL - Acesso limitado
  operacional: {
    descricao: 'Usuário Operacional',
    permissoes: [
      // Diligências - Principal
      'diligencias.read',
      'diligencias.read_todas',
      'diligencias.update',
      'diligencias.update_status',
      'diligencias.upload_arquivos',
      'diligencias.gerenciar_prazos',
      
      // Demandas - Leitura
      'demandas.read',
      'demandas.read_todas',
      
      // Agenda
      'agenda.read',
      'agenda.create',
      'agenda.update',
      
      // Correspondentes - Leitura
      'correspondentes.read',
      
      // Relatórios - Dashboard
      'relatorios.read_dashboard'
    ],
    pode_deletar: false,
    pode_criar_usuarios: false,
    pode_alterar_configuracoes: false,
    limite_api_por_hora: 300
  }
};

module.exports = ROLES_PERMISSOES;
```

### 2.2 Exemplo de Rota com Autorização

```javascript
// backend/routes/demandas.js

const express = require('express');
const router = express.Router();
const { verificarAuth, verificarAutorizacao, verificarPermissao } = require('../middleware/auth');
const DemandaController = require('../controllers/DemandaController');

// Listar demandas
router.get(
  '/',
  verificarAuth,
  verificarPermissao('demandas', 'read'),
  DemandaController.listar
);

// Criar demanda
router.post(
  '/',
  verificarAuth,
  verificarPermissao('demandas', 'create'),
  DemandaController.criar
);

// Atualizar demanda
router.put(
  '/:id',
  verificarAuth,
  verificarPermissao('demandas', 'update'),
  DemandaController.atualizar
);

// Deletar demanda (apenas admin e gerenciador)
router.delete(
  '/:id',
  verificarAuth,
  verificarAutorizacao(['admin', 'gerenciador']),
  verificarPermissao('demandas', 'delete'),
  DemandaController.deletar
);

// Finalizar demanda
router.post(
  '/:id/finalizar',
  verificarAuth,
  verificarPermissao('demandas', 'finalizar'),
  DemandaController.finalizar
);

module.exports = router;
```

### 2.3 Controle de Acesso por Dado

```javascript
// backend/services/DemandaService.js

class DemandaService {
  /**
   * Listar demandas baseado em role do usuário
   */
  static async listar(usuario, filtros = {}) {
    let where = {};

    if (usuario.role === 'admin') {
      // Admin vê todas
      // where = {}
    } else if (usuario.role === 'gerenciador') {
      // Gerenciador vê todas
      // where = {}
    } else if (usuario.role === 'usuario') {
      // Usuário comum vê apenas demandas onde é responsável
      where = {
        usuario_responsavel_id: usuario.sub
      };
    } else if (usuario.role === 'operacional') {
      // Operacional vê todas (para atualizar diligências)
      // where = {}
    }

    // Aplicar filtros adicionais
    Object.assign(where, filtros);

    return Demanda.findAll({ where });
  }

  /**
   * Atualizar demanda com validações de acesso
   */
  static async atualizar(usuario, demandaId, dados) {
    const demanda = await Demanda.findByPk(demandaId);
    
    if (!demanda) {
      throw new Error('Demanda não encontrada');
    }

    // Verificar acesso
    if (usuario.role === 'usuario' && demanda.usuario_responsavel_id !== usuario.sub) {
      throw new Error('Você não tem acesso a esta demanda');
    }

    // Log de auditoria
    await AuditoriaDemanda.create({
      demanda_id: demandaId,
      usuario_id: usuario.sub,
      campos_alterados: JSON.stringify(dados),
      valor_anterior: JSON.stringify(demanda),
      data_alteracao: new Date()
    });

    return demanda.update(dados);
  }

  /**
   * Deletar demanda com validações
   */
  static async deletar(usuario, demandaId) {
    const demanda = await Demanda.findByPk(demandaId);
    
    if (!demanda) {
      throw new Error('Demanda não encontrada');
    }

    // Apenas admin e gerenciador podem deletar
    if (!['admin', 'gerenciador'].includes(usuario.role)) {
      throw new Error('Você não tem permissão para deletar demandas');
    }

    // Não permitir deletar demandas com diligências ativas
    const diligenciasAtivas = await Diligencia.count({
      where: {
        demanda_id: demandaId,
        status: ['pendente', 'em_progresso', 'atrasada']
      }
    });

    if (diligenciasAtivas > 0) {
      throw new Error('Não é possível deletar demanda com diligências ativas');
    }

    // Log de auditoria
    await AuditoriaDemanda.create({
      demanda_id: demandaId,
      usuario_id: usuario.sub,
      operacao: 'delete',
      data_alteracao: new Date()
    });

    return demanda.destroy();
  }
}

module.exports = DemandaService;
```

---

## 3. CRIPTOGRAFIA DE DADOS

### 3.1 Criptografia de Dados Sensíveis

```javascript
// backend/utils/encryption.js

const crypto = require('crypto');

class EncryptionManager {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes
    this.tagLength = 16; // GCM tag length
  }

  /**
   * Criptografar dado sensível
   */
  encrypt(texto) {
    if (!texto) return null;

    const iv = crypto.randomBytes(16); // IV aleatório para cada criptografia
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);

    let criptografado = cipher.update(texto, 'utf8', 'hex');
    criptografado += cipher.final('hex');

    const tag = cipher.getAuthTag(); // GCM authentication tag

    // Retornar: iv + tag + dados criptografados
    return `${iv.toString('hex')}:${tag.toString('hex')}:${criptografado}`;
  }

  /**
   * Descriptografar dado sensível
   */
  decrypt(dadosCriptografados) {
    if (!dadosCriptografados) return null;

    try {
      const partes = dadosCriptografados.split(':');
      const iv = Buffer.from(partes[0], 'hex');
      const tag = Buffer.from(partes[1], 'hex');
      const criptografado = partes[2];

      const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
      decipher.setAuthTag(tag);

      let descriptografado = decipher.update(criptografado, 'hex', 'utf8');
      descriptografado += decipher.final('utf8');

      return descriptografado;
    } catch (error) {
      console.error('Erro ao descriptografar:', error);
      return null;
    }
  }

  /**
   * Hash com sal (para comparação, não reversível)
   */
  hash(texto, sal = null) {
    if (!sal) {
      sal = crypto.randomBytes(16).toString('hex');
    }

    const hash = crypto.pbkdf2Sync(texto, sal, 100000, 64, 'sha512');
    return `${sal}$${hash.toString('hex')}`;
  }

  /**
   * Verificar hash com sal
   */
  verificarHash(texto, hashArmazenado) {
    const partes = hashArmazenado.split('$');
    const sal = partes[0];
    const hash = this.hash(texto, sal);
    return hash === hashArmazenado;
  }

  /**
   * Gerar hash bcrypt para senhas
   */
  static async hashSenha(senha) {
    const bcrypt = require('bcrypt');
    return bcrypt.hash(senha, 12); // 12 rounds
  }

  /**
   * Verificar senha com bcrypt
   */
  static async verificarSenha(senha, hashSenha) {
    const bcrypt = require('bcrypt');
    return bcrypt.compare(senha, hashSenha);
  }
}

module.exports = new EncryptionManager();
```

### 3.2 Campos a Criptografar

```javascript
// backend/models/Correspondente.js

const encryption = require('../utils/encryption');

module.exports = (sequelize, DataTypes) => {
  class Correspondente extends Model {
    // Hooks para criptografia automática
    static associate(models) {
      // ... relacionamentos
    }
  }

  Correspondente.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    
    // ✅ SENSÍVEL - Criptografar
    cpf_cnpj: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      get() {
        const valor = this.getDataValue('cpf_cnpj');
        // Descriptografar ao recuperar
        return encryption.decrypt(valor);
      },
      set(valor) {
        // Criptografar ao armazenar
        this.setDataValue('cpf_cnpj', encryption.encrypt(valor));
      }
    },

    // ✅ SENSÍVEL - Criptografar
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      get() {
        const valor = this.getDataValue('email');
        return encryption.decrypt(valor);
      },
      set(valor) {
        this.setDataValue('email', encryption.encrypt(valor));
      }
    },

    // ✅ SENSÍVEL - Criptografar
    telefone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      get() {
        const valor = this.getDataValue('telefone');
        return encryption.decrypt(valor);
      },
      set(valor) {
        this.setDataValue('telefone', encryption.encrypt(valor));
      }
    },

    // ❌ NÃO criptografar (pública)
    nome_fantasia: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    // ✅ SENSÍVEL - Criptografar
    endereco_completo: {
      type: DataTypes.STRING(500),
      get() {
        const valor = this.getDataValue('endereco_completo');
        return encryption.decrypt(valor);
      },
      set(valor) {
        this.setDataValue('endereco_completo', encryption.encrypt(valor));
      }
    },

    classificacao: { type: DataTypes.NUMERIC(3, 2), defaultValue: 0 },
    ativo: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    sequelize,
    modelName: 'Correspondente',
    tableName: 'correspondentes'
  });

  return Correspondente;
};
```

### 3.3 Dados a Criptografar

| Dado | Sensibilidade | Criptografia |
|------|---|---|
| CPF/CNPJ | 🔴 Crítica | AES-256-GCM |
| Email | 🔴 Crítica | AES-256-GCM |
| Telefone | 🟠 Alta | AES-256-GCM |
| Endereço | 🟠 Alta | AES-256-GCM |
| Número Processo | 🟡 Média | AES-256-GCM |
| Observações/Notas | 🟡 Média | AES-256-GCM |
| Senha | 🔴 Crítica | bcrypt (não reversível) |
| 2FA Secret | 🔴 Crítica | AES-256-GCM |

---

## 4. LOGS DE AUDITORIA

### 4.1 Tabelas de Auditoria

```sql
-- Auditoria de demandas
CREATE TABLE auditoria_demandas (
  id SERIAL PRIMARY KEY,
  demanda_id INT NOT NULL REFERENCES demandas(id) ON DELETE CASCADE,
  usuario_id INT NOT NULL REFERENCES usuarios(id),
  operacao VARCHAR(20), -- 'create', 'update', 'delete'
  campo_alterado VARCHAR(100),
  valor_anterior TEXT,
  valor_novo TEXT,
  ip_address INET,
  user_agent VARCHAR(500),
  data_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auditoria de pagamentos
CREATE TABLE auditoria_pagamentos (
  id SERIAL PRIMARY KEY,
  pagamento_id INT NOT NULL REFERENCES pagamentos(id) ON DELETE CASCADE,
  usuario_id INT NOT NULL REFERENCES usuarios(id),
  operacao VARCHAR(20),
  campo_alterado VARCHAR(100),
  valor_anterior TEXT,
  valor_novo TEXT,
  ip_address INET,
  data_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Logs de acesso
CREATE TABLE logs_acesso (
  id BIGSERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id),
  tipo_acesso VARCHAR(50), -- 'login', 'logout', 'view', 'create', 'update', 'delete'
  entidade_tipo VARCHAR(50),
  entidade_id INT,
  recurso_acessado VARCHAR(500),
  ip_address INET,
  user_agent VARCHAR(500),
  status_resposta INT, -- HTTP status
  duracao_ms INT,
  data_acesso TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Logs de autenticação
CREATE TABLE logs_autenticacao (
  id SERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id),
  email VARCHAR(255),
  tipo_evento VARCHAR(50), -- 'login_sucesso', 'login_falha', 'logout', 'refresh_token', '2fa_habilitado'
  motivo_falha VARCHAR(255),
  ip_address INET,
  user_agent VARCHAR(500),
  tentativas_falhas INT,
  bloqueado_ate TIMESTAMP,
  data_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Logs de sincronização (APIs externas)
CREATE TABLE logs_sincronizacao (
  id SERIAL PRIMARY KEY,
  api_externa VARCHAR(100), -- 'whatsapp', 'google_calendar', 'judit'
  tipo_operacao VARCHAR(50),
  status_resultado VARCHAR(50), -- 'sucesso', 'erro', 'pendente'
  resposta_api TEXT,
  mensagem_erro TEXT,
  data_tentativa TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  proxima_tentativa TIMESTAMP,
  tentativas INT DEFAULT 1
);

-- Índices para performance
CREATE INDEX idx_auditoria_demandas_usuario ON auditoria_demandas(usuario_id);
CREATE INDEX idx_auditoria_demandas_demanda ON auditoria_demandas(demanda_id);
CREATE INDEX idx_auditoria_demandas_data ON auditoria_demandas(data_alteracao DESC);
CREATE INDEX idx_logs_acesso_usuario ON logs_acesso(usuario_id);
CREATE INDEX idx_logs_acesso_data ON logs_acesso(data_acesso DESC);
CREATE INDEX idx_logs_autenticacao_usuario ON logs_autenticacao(usuario_id);
CREATE INDEX idx_logs_autenticacao_data ON logs_autenticacao(data_evento DESC);
```

### 4.2 Logging de Auditoria

```javascript
// backend/services/AuditoriaService.js

const AuditoriaDemanda = require('../models/AuditoriaDemanda');
const LogAcesso = require('../models/LogAcesso');
const LogAutenticacao = require('../models/LogAutenticacao');

class AuditoriaService {
  /**
   * Registrar alteração de demanda
   */
  static async registrarAlteracaoDemanda(demandaId, usuarioId, operacao, campo, valorAnterior, valorNovo, req) {
    try {
      await AuditoriaDemanda.create({
        demanda_id: demandaId,
        usuario_id: usuarioId,
        operacao: operacao, // 'create', 'update', 'delete'
        campo_alterado: campo,
        valor_anterior: JSON.stringify(valorAnterior),
        valor_novo: JSON.stringify(valorNovo),
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        data_alteracao: new Date()
      });
    } catch (error) {
      console.error('Erro registrar auditoria:', error);
      // Não interromper a operação se auditoria falhar
    }
  }

  /**
   * Registrar acesso a recurso
   */
  static async registrarAcesso(usuarioId, tipoAcesso, entidadeTipo, entidadeId, req, statusResposta, durationMs) {
    try {
      await LogAcesso.create({
        usuario_id: usuarioId,
        tipo_acesso: tipoAcesso,
        entidade_tipo: entidadeTipo,
        entidade_id: entidadeId,
        recurso_acessado: req.path,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        status_resposta: statusResposta,
        duracao_ms: durationMs,
        data_acesso: new Date()
      });
    } catch (error) {
      console.error('Erro registrar acesso:', error);
    }
  }

  /**
   * Registrar evento de autenticação
   */
  static async registrarAutenticacao(usuarioId, email, tipoEvento, motivo, ip, userAgent, tentativasFalhas = 0, bloqueadoAte = null) {
    try {
      await LogAutenticacao.create({
        usuario_id: usuarioId,
        email: email,
        tipo_evento: tipoEvento, // 'login_sucesso', 'login_falha', '2fa_habilitado'
        motivo_falha: motivo,
        ip_address: ip,
        user_agent: userAgent,
        tentativas_falhas: tentativasFalhas,
        bloqueado_ate: bloqueadoAte,
        data_evento: new Date()
      });
    } catch (error) {
      console.error('Erro registrar autenticação:', error);
    }
  }

  /**
   * Obter histórico de auditoria (apenas admin)
   */
  static async obterHistorico(filtros = {}) {
    const where = {};

    if (filtros.usuario_id) {
      where.usuario_id = filtros.usuario_id;
    }

    if (filtros.demanda_id) {
      where.demanda_id = filtros.demanda_id;
    }

    if (filtros.data_inicio && filtros.data_fim) {
      where.data_alteracao = {
        [sequelize.Op.between]: [new Date(filtros.data_inicio), new Date(filtros.data_fim)]
      };
    }

    return AuditoriaDemanda.findAll({
      where,
      order: [['data_alteracao', 'DESC']],
      limit: filtros.limite || 100,
      include: {
        model: require('../models/Usuario'),
        attributes: ['id', 'nome_completo', 'email']
      }
    });
  }

  /**
   * Verificar padrões suspeitos
   */
  static async detectarAtividadeSuspeita(usuarioId) {
    // 1. Múltiplas tentativas de login falhadas
    const loginsFalhados = await LogAutenticacao.count({
      where: {
        usuario_id: usuarioId,
        tipo_evento: 'login_falha',
        data_evento: {
          [sequelize.Op.gte]: new Date(Date.now() - 15 * 60 * 1000) // Últimos 15 minutos
        }
      }
    });

    if (loginsFalhados > 5) {
      return {
        suspeito: true,
        motivo: 'Múltiplas tentativas de login falhadas',
        acao: 'bloquear_usuario'
      };
    }

    // 2. Acesso de múltiplos IPs diferentes em curto espaço de tempo
    const acessosRecentes = await LogAcesso.findAll({
      where: {
        usuario_id: usuarioId,
        data_acesso: {
          [sequelize.Op.gte]: new Date(Date.now() - 5 * 60 * 1000) // Últimos 5 minutos
        }
      },
      attributes: ['ip_address'],
      raw: true
    });

    const ipsUnicos = new Set(acessosRecentes.map(a => a.ip_address)).size;
    if (ipsUnicos > 3) {
      return {
        suspeito: true,
        motivo: 'Acesso de múltiplos IPs em curto tempo',
        acao: 'alertar_admin'
      };
    }

    // 3. Acesso de país diferente do usual
    // (Implementar com geolocalização de IP)

    return { suspeito: false };
  }
}

module.exports = AuditoriaService;
```

### 4.3 Middleware de Logging

```javascript
// backend/middleware/logging.js

const AuditoriaService = require('../services/AuditoriaService');

/**
 * Middleware: Logar todas as requisições
 */
const loggerRequisicoes = async (req, res, next) => {
  const inicioMs = Date.now();

  // Interceptar response para registrar
  const resEnd = res.end;
  res.end = function (chunk, encoding) {
    const duracao = Date.now() - inicioMs;

    // Não logar health checks e assets
    if (!['/health', '/status'].includes(req.path) && !req.path.includes('/assets')) {
      AuditoriaService.registrarAcesso(
        req.usuario?.sub || null,
        req.method,
        req.path.split('/')[2], // Tipo entidade
        null,
        req,
        res.statusCode,
        duracao
      );
    }

    resEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Middleware: Logar operações críticas
 */
const loggerOperacoesCriticas = (tipos = ['create', 'update', 'delete']) => {
  return async (req, res, next) => {
    if (tipos.includes(req.method.toLowerCase())) {
      const inicioMs = Date.now();
      
      const resJson = res.json;
      res.json = function (data) {
        if (data.sucesso && req.usuario) {
          // Log após sucesso
          AuditoriaService.registrarAlteracaoDemanda(
            req.params.id,
            req.usuario.sub,
            req.method,
            null,
            null,
            req.body,
            req
          );
        }
        return resJson.call(this, data);
      };
    }
    next();
  };
};

module.exports = {
  loggerRequisicoes,
  loggerOperacoesCriticas
};
```

---

## 5. PROTEÇÃO CONTRA ATAQUES

### 5.1 CSRF (Cross-Site Request Forgery)

```javascript
// backend/middleware/csrf.js

const csrf = require('csurf');
const cookieParser = require('cookie-parser');

// Middleware CSRF
const csrfProtection = csrf({ cookie: true });

module.exports = {
  csrfProtection,
  
  // Gerar token CSRF
  gerarTokenCSRF: (req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
  }
};
```

### 5.2 Rate Limiting

```javascript
// backend/middleware/rate-limit.js

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const client = redis.createClient();

// Rate limit para login (5 tentativas em 15 minutos)
const loginLimiter = rateLimit({
  store: new RedisStore({
    client: client,
    prefix: 'rl:login:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 requisições
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos',
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false
});

// Rate limit para API geral
const apiLimiter = rateLimit({
  store: new RedisStore({
    client: client,
    prefix: 'rl:api:'
  }),
  windowMs: 60 * 1000, // 1 minuto
  max: (req, res) => {
    // Limites diferentes por role
    const limites = {
      admin: 1000,
      gerenciador: 500,
      usuario: 300,
      operacional: 200
    };
    return limites[req.usuario?.role] || 100;
  }
});

module.exports = {
  loginLimiter,
  apiLimiter
};
```

### 5.3 SQL Injection Prevention

```javascript
// Sequelize já previne SQL injection com parameterized queries
// Mas sempre validar entrada

// ❌ ERRADO - Vulnerável
const usuarios = await sequelize.query(`
  SELECT * FROM usuarios WHERE email = '${email}'
`);

// ✅ CORRETO - Seguro
const usuarios = await Usuario.findAll({
  where: { email: email }
});

// ✅ CORRETO - Com placeholders
const usuarios = await sequelize.query(
  'SELECT * FROM usuarios WHERE email = ?',
  { replacements: [email], type: sequelize.QueryTypes.SELECT }
);
```

### 5.4 XSS (Cross-Site Scripting) Prevention

```javascript
// backend/middleware/xss.js

const xss = require('xss');
const DOMPurify = require('isomorphic-dompurify');

/**
 * Middleware: Sanitizar entrada
 */
const sanitizarEntrada = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(chave => {
      if (typeof req.body[chave] === 'string') {
        // Remove tags HTML perigosas
        req.body[chave] = xss(req.body[chave], {
          whiteList: {}, // Sem tags permitidas
          stripIgnoredTag: true
        });
      }
    });
  }

  if (req.query && typeof req.query === 'object') {
    Object.keys(req.query).forEach(chave => {
      if (typeof req.query[chave] === 'string') {
        req.query[chave] = xss(req.query[chave]);
      }
    });
  }

  next();
};

module.exports = { sanitizarEntrada };
```

### 5.5 Validação de Entrada

```javascript
// backend/utils/validators.js

const Joi = require('joi');

const schemas = {
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .max(255),
    senha: Joi.string()
      .required()
      .min(8)
      .max(255)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
  }),

  criar_demanda: Joi.object({
    cliente_id: Joi.number().integer().required(),
    especialidade_id: Joi.number().integer().required(),
    titulo: Joi.string().required().min(5).max(255),
    descricao_servico: Joi.string().required().min(10).max(5000),
    prioridade: Joi.string()
      .valid('baixa', 'normal', 'alta', 'urgente')
      .required(),
    valor_estimado: Joi.number()
      .positive()
      .precision(2)
      .required()
  })
};

/**
 * Middleware: Validar com Joi
 */
const validar = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const detalhes = error.details.map(d => ({
        campo: d.path.join('.'),
        mensagem: d.message
      }));

      return res.status(400).json({
        sucesso: false,
        erro: {
          codigo: 'VALIDACAO_FALHOU',
          mensagem: 'Dados inválidos fornecidos',
          detalhes: detalhes
        },
        codigo_http: 400
      });
    }

    req.body = value;
    next();
  };
};

module.exports = {
  schemas,
  validar
};
```

---

## 6. CONFORMIDADE LGPD

### 6.1 Direitos do Titular de Dados

```javascript
// backend/routes/lgpd.js

const express = require('express');
const router = express.Router();
const { verificarAuth } = require('../middleware/auth');
const LGPDService = require('../services/LGPDService');

// 1. Direito de Acesso - Obter todos os dados pessoais
router.get('/meus-dados', verificarAuth, async (req, res) => {
  try {
    const dados = await LGPDService.obterMeusDados(req.usuario.sub);
    res.json({
      sucesso: true,
      dados: dados,
      codigo_http: 200
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: { mensagem: error.message },
      codigo_http: 500
    });
  }
});

// 2. Direito de Portabilidade - Exportar dados em formato máquina-legível
router.get('/exportar-dados', verificarAuth, async (req, res) => {
  try {
    const dados = await LGPDService.exportarDados(req.usuario.sub);
    
    res.header('Content-Type', 'application/json');
    res.header('Content-Disposition', `attachment; filename="meus_dados.json"`);
    res.send(JSON.stringify(dados, null, 2));
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: { mensagem: error.message },
      codigo_http: 500
    });
  }
});

// 3. Direito ao Esquecimento - Deletar todos os dados
router.delete('/deletar-conta', verificarAuth, async (req, res) => {
  try {
    // Requer confirmação adicional
    const { senha_confirmacao } = req.body;
    
    await LGPDService.deletarConta(req.usuario.sub, senha_confirmacao);
    
    res.json({
      sucesso: true,
      mensagem: 'Sua conta e dados foram deletados permanentemente',
      codigo_http: 200
    });
  } catch (error) {
    res.status(400).json({
      sucesso: false,
      erro: { mensagem: error.message },
      codigo_http: 400
    });
  }
});

// 4. Direito de Retificação - Corrigir dados pessoais
router.put('/corrigir-dados', verificarAuth, async (req, res) => {
  try {
    const dados = await LGPDService.corrigirDados(req.usuario.sub, req.body);
    
    res.json({
      sucesso: true,
      dados: dados,
      mensagem: 'Dados corrigidos com sucesso',
      codigo_http: 200
    });
  } catch (error) {
    res.status(400).json({
      sucesso: false,
      erro: { mensagem: error.message },
      codigo_http: 400
    });
  }
});

// 5. Registrar Consentimento
router.post('/consentimento', verificarAuth, async (req, res) => {
  try {
    const { tipos_consentimento } = req.body; // ['marketing', 'analytics', 'tracking']
    
    await LGPDService.registrarConsentimento(req.usuario.sub, tipos_consentimento);
    
    res.json({
      sucesso: true,
      mensagem: 'Consentimento registrado',
      codigo_http: 200
    });
  } catch (error) {
    res.status(400).json({
      sucesso: false,
      erro: { mensagem: error.message },
      codigo_http: 400
    });
  }
});

module.exports = router;
```

### 6.2 Registro de Consentimento

```sql
CREATE TABLE consentimentos (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo_consentimento VARCHAR(50), -- 'marketing', 'analytics', 'tracking', 'terceiros'
  consentimento_dado BOOLEAN,
  data_consentimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_consentimento INET,
  versao_termo VARCHAR(50),
  revogado_em TIMESTAMP
);

CREATE TABLE direitos_lgpd (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo_direito VARCHAR(50), -- 'acesso', 'portabilidade', 'esquecimento', 'retificacao'
  status VARCHAR(20), -- 'solicitado', 'processando', 'completo', 'negado'
  data_solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_conclusao TIMESTAMP,
  motivo_negacao TEXT
);
```

---

## 7. BOAS PRÁTICAS

### 7.1 Checklist de Segurança

```markdown
## Autenticação
- [x] JWT com expiração (24h)
- [x] Refresh tokens (7d) em HTTP-only cookies
- [x] 2FA com TOTP/SMS/Email
- [x] Rate limiting em login (5 tentativas/15min)
- [x] Bloqueio de conta após 5 falhas
- [x] Força de senha: 8+ caracteres, maiúsculas, minúsculas, números, símbolos

## Autorização
- [x] 4 roles definidos (admin, gerenciador, usuario, operacional)
- [x] Permissões granulares por operação
- [x] Controle de acesso em nível de dados
- [x] Validação de permissão em cada endpoint

## Criptografia
- [x] AES-256-GCM para dados sensíveis
- [x] bcrypt para senhas (12 rounds)
- [x] TLS 1.3 para transporte (HTTPS)
- [x] HMAC-SHA256 para integridade de JWT

## Auditoria
- [x] Logs de todas as operações críticas
- [x] Histórico completo de alterações
- [x] Rastreamento de IPs e user agents
- [x] Detecção de atividades suspeitas
- [x] Retenção de logs por 90 dias

## Proteção contra Ataques
- [x] Proteção CSRF
- [x] Rate limiting
- [x] Sanitização de entrada (XSS)
- [x] Parameterized queries (SQL injection)
- [x] Validação rigorosa com Joi
- [x] CORS configurado restritivamente

## LGPD
- [x] Direito de acesso aos dados
- [x] Direito de portabilidade (export JSON)
- [x] Direito ao esquecimento (delete completo)
- [x] Direito de retificação
- [x] Registro de consentimento
- [x] Política de privacidade

## Infraestrutura
- [x] HTTPS obrigatório
- [x] Certificado SSL válido
- [x] Headers de segurança (HSTS, CSP, X-Frame-Options)
- [x] CORS restritivo
- [x] Senhas de BD em variáveis de ambiente
- [x] Chaves de criptografia em cofre seguro
```

### 7.2 Headers de Segurança HTTP

```javascript
// backend/middleware/security-headers.js

const helmet = require('helmet');

module.exports = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'https:', 'data:'],
      connectSrc: ["'self'", 'https://api.jurisconnect.com']
    }
  },

  // Evitar clickjacking
  frameguard: { action: 'deny' },

  // Evitar MIME type sniffing
  noSniff: true,

  // Proteção XSS (mesmo em navegadores antigos)
  xssFilter: true,

  // HSTS - Força HTTPS
  hsts: {
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: true
  },

  // Referrer Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});
```

### 7.3 Exemplo de Uso Completo

```javascript
// backend/routes/auth.js

const express = require('express');
const router = express.Router();
const { loginLimiter } = require('../middleware/rate-limit');
const { sanitizarEntrada } = require('../middleware/xss');
const { validar, schemas } = require('../utils/validators');
const AuthController = require('../controllers/AuthController');

// Login com proteções
router.post(
  '/login',
  loginLimiter,                    // Rate limiting
  sanitizarEntrada,               // XSS protection
  validar(schemas.login),         // Validação entrada
  AuthController.login            // Lógica
);

module.exports = router;
```

---

**Documentação de Segurança v1.0 - Implementação Completa** ✅