# JURISCONNECT - INTEGRAÇÕES APIs (PARTE 3)

## 📋 FINALIZAÇÃO

8. [Helpers e Utilities](#8-helpers-e-utilities)
9. [Controllers de Integração](#9-controllers-de-integração)
10. [Routes de Integração](#10-routes-de-integração)
11. [Testes Básicos](#11-testes-básicos)
12. [Exemplos de Uso](#12-exemplos-de-uso)
13. [Health Check Dashboard](#13-health-check-dashboard)

---

# 8. HELPERS E UTILITIES

## 8.1 src/utils/retry.helper.js

```javascript
const logger = require('./logger');

class RetryHelper {
  /**
   * Executar função com retry exponencial
   */
  static async executarComRetry(fn, opcoes = {}) {
    const {
      tentativasMaximas = 3,
      delayInicial = 1000,
      multiplicador = 2,
      maxDelay = 30000,
    } = opcoes;

    let ultimoErro;

    for (let tentativa = 1; tentativa <= tentativasMaximas; tentativa++) {
      try {
        logger.info(`Tentativa ${tentativa}/${tentativasMaximas}`);
        return await fn();
      } catch (error) {
        ultimoErro = error;
        logger.error(`Tentativa ${tentativa} falhou:`, error.message);

        if (tentativa < tentativasMaximas) {
          const delay = Math.min(
            delayInicial * Math.pow(multiplicador, tentativa - 1),
            maxDelay
          );
          logger.info(`Aguardando ${delay}ms antes da próxima tentativa...`);
          await this.sleep(delay);
        }
      }
    }

    throw ultimoErro;
  }

  /**
   * Sleep helper
   */
  static sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = RetryHelper;
```

## 8.2 src/utils/validator.helper.js

```javascript
class ValidatorHelper {
  /**
   * Validar CPF
   */
  static validarCPF(cpf) {
    const cpfLimpo = cpf.replace(/\D/g, '');

    if (cpfLimpo.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpfLimpo)) return false;

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;

    soma = 0;

    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;

    return true;
  }

  /**
   * Validar Email
   */
  static validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Validar Telefone Brasileiro
   */
  static validarTelefone(telefone) {
    const telefoneLimpo = telefone.replace(/\D/g, '');
    // Formato: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    return telefoneLimpo.length === 10 || telefoneLimpo.length === 11;
  }

  /**
   * Formatar CPF
   */
  static formatarCPF(cpf) {
    const cpfLimpo = cpf.replace(/\D/g, '');
    return cpfLimpo.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }

  /**
   * Formatar Telefone
   */
  static formatarTelefone(telefone) {
    const telefoneLimpo = telefone.replace(/\D/g, '');

    if (telefoneLimpo.length === 11) {
      return telefoneLimpo.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (telefoneLimpo.length === 10) {
      return telefoneLimpo.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    }

    return telefone;
  }
}

module.exports = ValidatorHelper;
```

---

# 9. CONTROLLERS DE INTEGRAÇÃO

## 9.1 src/controllers/integracao.controller.js

```javascript
const WhatsAppService = require('../services/whatsapp.service');
const GoogleCalendarService = require('../services/google-calendar.service');
const ReceitaFederalService = require('../services/receita-federal.service');
const ViaCEPService = require('../services/viacep.service');
const EmailService = require('../services/email.service');
const StorageService = require('../services/storage.service');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

class IntegracaoController {
  // WhatsApp
  async enviarWhatsApp(req, res) {
    const { telefone, mensagem, template, variaveis } = req.body;

    try {
      let resultado;

      if (template) {
        resultado = await WhatsAppService.enviarTemplate(telefone, template, variaveis);
      } else {
        resultado = await WhatsAppService.enviarMensagem(telefone, mensagem);
      }

      res.json({
        success: true,
        message: 'WhatsApp enviado com sucesso',
        data: resultado,
      });
    } catch (error) {
      logger.error('Erro ao enviar WhatsApp:', error);
      throw new AppError('Erro ao enviar WhatsApp', 500);
    }
  }

  // Google Calendar
  async criarEventoCalendar(req, res) {
    const { titulo, descricao, dataInicio, dataFim, local, participantes } = req.body;

    try {
      const resultado = await GoogleCalendarService.criarEvento({
        titulo,
        descricao,
        dataInicio,
        dataFim,
        local,
        participantes,
      });

      res.json({
        success: true,
        message: 'Evento criado no Google Calendar',
        data: resultado,
      });
    } catch (error) {
      logger.error('Erro ao criar evento:', error);
      throw new AppError('Erro ao criar evento no Google Calendar', 500);
    }
  }

  async listarEventosCalendar(req, res) {
    const { dataInicio, dataFim } = req.query;

    try {
      const eventos = await GoogleCalendarService.listarEventos(dataInicio, dataFim);

      res.json({
        success: true,
        data: eventos,
      });
    } catch (error) {
      logger.error('Erro ao listar eventos:', error);
      throw new AppError('Erro ao listar eventos', 500);
    }
  }

  // Receita Federal
  async consultarCNPJ(req, res) {
    const { cnpj } = req.params;

    try {
      const dados = await ReceitaFederalService.consultarCNPJ(cnpj);

      res.json({
        success: true,
        data: dados,
      });
    } catch (error) {
      logger.error('Erro ao consultar CNPJ:', error);
      throw new AppError('Erro ao consultar CNPJ', 500);
    }
  }

  // ViaCEP
  async consultarCEP(req, res) {
    const { cep } = req.params;

    try {
      const dados = await ViaCEPService.consultarCEP(cep);

      res.json({
        success: true,
        data: dados,
      });
    } catch (error) {
      logger.error('Erro ao consultar CEP:', error);
      throw new AppError('Erro ao consultar CEP', 500);
    }
  }

  async buscarPorEndereco(req, res) {
    const { uf, cidade, logradouro } = req.query;

    try {
      const dados = await ViaCEPService.buscarPorEndereco(uf, cidade, logradouro);

      res.json({
        success: true,
        data: dados,
      });
    } catch (error) {
      logger.error('Erro ao buscar endereço:', error);
      throw new AppError('Erro ao buscar endereço', 500);
    }
  }

  // Email
  async enviarEmail(req, res) {
    const { para, assunto, conteudo, template, variaveis } = req.body;

    try {
      let resultado;

      if (template) {
        resultado = await EmailService.enviarComTemplate(para, template, variaveis);
      } else {
        resultado = await EmailService.enviar(para, assunto, conteudo);
      }

      res.json({
        success: true,
        message: 'Email enviado com sucesso',
        data: resultado,
      });
    } catch (error) {
      logger.error('Erro ao enviar email:', error);
      throw new AppError('Erro ao enviar email', 500);
    }
  }

  // Upload
  async uploadArquivo(req, res) {
    try {
      if (!req.file) {
        throw new AppError('Nenhum arquivo enviado', 400);
      }

      const pasta = req.body.pasta || 'documentos';
      const resultado = await StorageService.upload(req.file, pasta);

      res.json({
        success: true,
        message: 'Arquivo enviado com sucesso',
        data: resultado,
      });
    } catch (error) {
      logger.error('Erro ao fazer upload:', error);
      throw new AppError('Erro ao fazer upload', 500);
    }
  }

  async listarArquivos(req, res) {
    const { pasta } = req.query;

    try {
      const arquivos = await StorageService.listar(pasta || '');

      res.json({
        success: true,
        data: arquivos,
      });
    } catch (error) {
      logger.error('Erro ao listar arquivos:', error);
      throw new AppError('Erro ao listar arquivos', 500);
    }
  }

  async deletarArquivo(req, res) {
    const { key } = req.params;

    try {
      await StorageService.deletar(key);

      res.json({
        success: true,
        message: 'Arquivo deletado com sucesso',
      });
    } catch (error) {
      logger.error('Erro ao deletar arquivo:', error);
      throw new AppError('Erro ao deletar arquivo', 500);
    }
  }

  // Health Check
  async healthCheck(req, res) {
    const servicos = {
      whatsapp: await WhatsAppService.healthCheck(),
      google_calendar: await GoogleCalendarService.healthCheck(),
      receita_federal: await ReceitaFederalService.healthCheck(),
      viacep: await ViaCEPService.healthCheck(),
      email: await EmailService.healthCheck(),
      storage: await StorageService.healthCheck(),
    };

    const todosAtivos = Object.values(servicos).every((s) => s.status === 'healthy');

    res.status(todosAtivos ? 200 : 503).json({
      success: todosAtivos,
      timestamp: new Date().toISOString(),
      servicos,
    });
  }
}

module.exports = new IntegracaoController();
```

---

# 10. ROUTES DE INTEGRAÇÃO

## 10.1 src/routes/integracao.routes.js

```javascript
const express = require('express');
const router = express.Router();
const integracaoController = require('../controllers/integracao.controller');
const StorageService = require('../services/storage.service');
const { verificarToken, verificarRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  enviarWhatsAppSchema,
  enviarEmailSchema,
  criarEventoSchema,
} = require('../validators/integracao.validator');

// Público (sem autenticação)
router.get('/health', integracaoController.healthCheck);

// Requer autenticação
router.use(verificarToken);

// WhatsApp
router.post(
  '/whatsapp/enviar',
  verificarRole('admin', 'gestor'),
  validate(enviarWhatsAppSchema),
  integracaoController.enviarWhatsApp
);

// Google Calendar
router.post(
  '/calendar/eventos',
  validate(criarEventoSchema),
  integracaoController.criarEventoCalendar
);
router.get('/calendar/eventos', integracaoController.listarEventosCalendar);

// Receita Federal
router.get('/receita-federal/cnpj/:cnpj', integracaoController.consultarCNPJ);

// ViaCEP
router.get('/viacep/cep/:cep', integracaoController.consultarCEP);
router.get('/viacep/endereco', integracaoController.buscarPorEndereco);

// Email
router.post(
  '/email/enviar',
  verificarRole('admin', 'gestor'),
  validate(enviarEmailSchema),
  integracaoController.enviarEmail
);

// Storage
const upload = StorageService.configurarMulter();

router.post('/storage/upload', upload.single('arquivo'), integracaoController.uploadArquivo);
router.get('/storage/listar', integracaoController.listarArquivos);
router.delete('/storage/:key', integracaoController.deletarArquivo);

module.exports = router;
```

## 10.2 src/validators/integracao.validator.js

```javascript
const Joi = require('joi');

const enviarWhatsAppSchema = Joi.object({
  telefone: Joi.string().required(),
  mensagem: Joi.string().when('template', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  template: Joi.string().valid(
    'nova_demanda',
    'prazo_vencendo',
    'pagamento_recebido',
    'status_alterado'
  ),
  variaveis: Joi.object().when('template', {
    is: Joi.exist(),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

const enviarEmailSchema = Joi.object({
  para: Joi.string().email().required(),
  assunto: Joi.string().when('template', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  conteudo: Joi.string().when('template', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  template: Joi.string(),
  variaveis: Joi.object().when('template', {
    is: Joi.exist(),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

const criarEventoSchema = Joi.object({
  titulo: Joi.string().required(),
  descricao: Joi.string().allow(''),
  dataInicio: Joi.date().iso().required(),
  dataFim: Joi.date().iso().required(),
  local: Joi.string().allow(''),
  participantes: Joi.array().items(Joi.string().email()),
});

module.exports = {
  enviarWhatsAppSchema,
  enviarEmailSchema,
  criarEventoSchema,
};
```

---

# 11. TESTES BÁSICOS

## 11.1 tests/integration/whatsapp.test.js

```javascript
const WhatsAppService = require('../../src/services/whatsapp.service');

describe('WhatsApp Service', () => {
  test('deve formatar telefone brasileiro corretamente', () => {
    const telefone = '11999999999';
    const formatado = WhatsAppService.formatarTelefone(telefone);
    expect(formatado).toBe('+5511999999999');
  });

  test('deve enviar mensagem com sucesso (mock)', async () => {
    // Mock do Twilio
    WhatsAppService.client.messages.create = jest.fn().mockResolvedValue({
      sid: 'SM123456',
      status: 'sent',
    });

    const resultado = await WhatsAppService.enviarMensagem(
      '+5511999999999',
      'Mensagem de teste'
    );

    expect(resultado.success).toBe(true);
    expect(resultado.messageId).toBe('SM123456');
  });
});
```

## 11.2 tests/integration/viacep.test.js

```javascript
const ViaCEPService = require('../../src/services/viacep.service');

describe('ViaCEP Service', () => {
  test('deve validar CEP corretamente', () => {
    expect(ViaCEPService.validarCEP('01001000')).toBe(true);
    expect(ViaCEPService.validarCEP('01001-000')).toBe(true);
    expect(ViaCEPService.validarCEP('123')).toBe(false);
  });

  test('deve formatar CEP corretamente', () => {
    const cep = '01001000';
    const formatado = ViaCEPService.formatarCEP(cep);
    expect(formatado).toBe('01001-000');
  });

  test('deve consultar CEP válido', async () => {
    const resultado = await ViaCEPService.consultarCEP('01001000');
    expect(resultado.cep).toBe('01001-000');
    expect(resultado.uf).toBe('SP');
    expect(resultado.localidade).toBe('São Paulo');
  });
});
```

---

# 12. EXEMPLOS DE USO

## 12.1 Exemplo: Criar Demanda + Notificar

```javascript
// src/workflows/criar-demanda.workflow.js
const { Demanda } = require('../models');
const WhatsAppService = require('../services/whatsapp.service');
const EmailService = require('../services/email.service');
const GoogleCalendarService = require('../services/google-calendar.service');

class CriarDemandaWorkflow {
  async executar(dadosDemanda) {
    try {
      // 1. Criar demanda no banco
      const demanda = await Demanda.create(dadosDemanda);

      // 2. Notificar responsável por WhatsApp
      if (demanda.responsavel.telefone) {
        await WhatsAppService.enviarTemplate(
          demanda.responsavel.telefone,
          'nova_demanda',
          {
            numero: demanda.numero,
            titulo: demanda.titulo,
            prazo: demanda.data_prazo,
            cliente: demanda.cliente.nome_fantasia,
          }
        );
      }

      // 3. Enviar email de confirmação
      if (demanda.responsavel.email) {
        await EmailService.enviarNotificacaoDemanda(
          demanda.responsavel.email,
          demanda
        );
      }

      // 4. Criar evento no Google Calendar
      if (demanda.data_prazo) {
        await GoogleCalendarService.criarEvento({
          titulo: `Prazo: ${demanda.titulo}`,
          descricao: `Demanda ${demanda.numero} - ${demanda.cliente.nome_fantasia}`,
          dataInicio: demanda.data_prazo,
          dataFim: demanda.data_prazo,
          participantes: [demanda.responsavel.email],
        });
      }

      return demanda;
    } catch (error) {
      console.error('Erro no workflow:', error);
      throw error;
    }
  }
}

module.exports = new CriarDemandaWorkflow();
```

## 12.2 Exemplo: Validar Cliente com CNPJ

```javascript
// src/workflows/validar-cliente.workflow.js
const ReceitaFederalService = require('../services/receita-federal.service');
const ViaCEPService = require('../services/viacep.service');

class ValidarClienteWorkflow {
  async executar(cpfCnpj, cep) {
    const resultado = {};

    try {
      // 1. Consultar CNPJ na Receita Federal
      if (cpfCnpj.length === 14) {
        const dadosCNPJ = await ReceitaFederalService.consultarCNPJ(cpfCnpj);

        resultado.cnpj = {
          valido: true,
          razao_social: dadosCNPJ.razao_social,
          nome_fantasia: dadosCNPJ.nome_fantasia,
          situacao: dadosCNPJ.situacao,
          telefone: dadosCNPJ.telefone,
          email: dadosCNPJ.email,
        };

        // 2. Usar CEP do CNPJ se não fornecido
        if (!cep && dadosCNPJ.cep) {
          cep = dadosCNPJ.cep;
        }
      }

      // 3. Consultar CEP
      if (cep) {
        const dadosCEP = await ViaCEPService.consultarCEP(cep);

        resultado.endereco = {
          cep: dadosCEP.cep,
          logradouro: dadosCEP.logradouro,
          bairro: dadosCEP.bairro,
          cidade: dadosCEP.localidade,
          uf: dadosCEP.uf,
        };
      }

      return resultado;
    } catch (error) {
      console.error('Erro na validação:', error);
      throw error;
    }
  }
}

module.exports = new ValidarClienteWorkflow();
```

---

# 13. HEALTH CHECK DASHBOARD

## 13.1 Exemplo de Resposta

```bash
GET /api/v1/integracoes/health

{
  "success": true,
  "timestamp": "2025-11-06T15:30:00.000Z",
  "servicos": {
    "whatsapp": {
      "status": "healthy",
      "provider": "twilio",
      "account": "JurisConnect Account"
    },
    "google_calendar": {
      "status": "healthy"
    },
    "receita_federal": {
      "status": "healthy"
    },
    "viacep": {
      "status": "healthy"
    },
    "email": {
      "status": "healthy",
      "provider": "sendgrid"
    },
    "storage": {
      "status": "healthy",
      "provider": "s3"
    }
  }
}
```

---

**Sistema de Integrações Completo - Parte 3/3** ✅

## Checklist Final

```
Integrações (6):
├─ [x] WhatsApp Business (Twilio)
├─ [x] Google Calendar API
├─ [x] Receita Federal API
├─ [x] ViaCEP API
├─ [x] Email (SendGrid/SES)
└─ [x] Storage (S3/Local)

Features:
├─ [x] Rate limiting
├─ [x] Retry logic
├─ [x] Timeout handling
├─ [x] Cache (7-24h)
├─ [x] Fallback providers
├─ [x] Error handling
├─ [x] Logging completo
└─ [x] Health checks

Helpers:
├─ [x] Retry exponencial
├─ [x] Validators (CPF, CNPJ, Email)
├─ [x] Formatadores
└─ [x] Sleep utilities

Controllers:
├─ [x] IntegracaoController
├─ [x] 12+ endpoints
└─ [x] Validação Joi

Routes:
├─ [x] /integracoes/whatsapp
├─ [x] /integracoes/calendar
├─ [x] /integracoes/cnpj
├─ [x] /integracoes/cep
├─ [x] /integracoes/email
├─ [x] /integracoes/storage
└─ [x] /integracoes/health

Testes:
├─ [x] Unit tests
├─ [x] Integration tests
└─ [x] Examples

Workflows:
├─ [x] CriarDemandaWorkflow
├─ [x] ValidarClienteWorkflow
└─ [x] Notificações automatizadas

Pronto para Produção! 🎉
```