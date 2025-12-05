# JURISCONNECT - INTEGRAÇÕES COM APIs EXTERNAS

## 📋 ÍNDICE

1. [Configuração de Ambiente](#1-configuração-de-ambiente)
2. [WhatsApp Business API](#2-whatsapp-business-api)
3. [Google Calendar API](#3-google-calendar-api)
4. [Receita Federal API](#4-receita-federal-api)
5. [ViaCEP API](#5-viacep-api)
6. [Email Service (SendGrid/AWS SES)](#6-email-service)
7. [Storage Service (AWS S3)](#7-storage-service)
8. [Helpers e Utilities](#8-helpers-e-utilities)

---

# 1. CONFIGURAÇÃO DE AMBIENTE

## 1.1 .env (Variáveis de Ambiente)

```env
# WhatsApp Business (Twilio/Meta)
WHATSAPP_PROVIDER=twilio
WHATSAPP_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_AUTH_TOKEN=your_auth_token_here
WHATSAPP_FROM=whatsapp:+5511999999999
WHATSAPP_WEBHOOK_URL=https://yourdomain.com/webhooks/whatsapp

# Google Calendar
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
GOOGLE_CALENDAR_ID=primary
GOOGLE_REFRESH_TOKEN=your_refresh_token

# Receita Federal
RECEITA_FEDERAL_API_KEY=your_api_key_here
RECEITA_FEDERAL_API_URL=https://receitaws.com.br/v1

# ViaCEP
VIACEP_API_URL=https://viacep.com.br/ws

# Email (SendGrid)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@jurisconnect.com
EMAIL_FROM_NAME=JurisConnect

# AWS SES (alternativa)
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY=your_access_key
AWS_SES_SECRET_KEY=your_secret_key

# Storage (AWS S3)
STORAGE_PROVIDER=s3
AWS_S3_REGION=us-east-1
AWS_S3_BUCKET=jurisconnect-documents
AWS_S3_ACCESS_KEY=your_access_key
AWS_S3_SECRET_KEY=your_secret_key

# Storage Local (fallback)
STORAGE_LOCAL_PATH=./uploads

# Rate Limiting
API_RATE_LIMIT_MAX=100
API_RATE_LIMIT_WINDOW=60000

# Timeouts (ms)
API_TIMEOUT=10000
```

## 1.2 package.json (Dependências)

```json
{
  "dependencies": {
    "axios": "^1.6.4",
    "twilio": "^4.19.0",
    "googleapis": "^128.0.0",
    "@sendgrid/mail": "^7.7.0",
    "aws-sdk": "^2.1506.0",
    "multer": "^1.4.5-lts.1",
    "multer-s3": "^3.0.1",
    "bottleneck": "^2.19.5",
    "retry-axios": "^3.0.0",
    "winston": "^3.11.0",
    "joi": "^17.11.0"
  }
}
```

---

# 2. WHATSAPP BUSINESS API

## 2.1 src/services/whatsapp.service.js

```javascript
const twilio = require('twilio');
const logger = require('../utils/logger');
const Bottleneck = require('bottleneck');

class WhatsAppService {
  constructor() {
    this.provider = process.env.WHATSAPP_PROVIDER || 'twilio';
    
    if (this.provider === 'twilio') {
      this.client = twilio(
        process.env.WHATSAPP_ACCOUNT_SID,
        process.env.WHATSAPP_AUTH_TOKEN
      );
    }

    this.from = process.env.WHATSAPP_FROM;

    // Rate limiter: 10 mensagens por minuto
    this.limiter = new Bottleneck({
      reservoir: 10,
      reservoirRefreshAmount: 10,
      reservoirRefreshInterval: 60 * 1000,
      maxConcurrent: 1,
      minTime: 1000,
    });

    logger.info('WhatsApp Service initialized');
  }

  /**
   * Enviar mensagem de texto
   */
  async enviarMensagem(para, mensagem, tentativas = 3) {
    return this.limiter.schedule(async () => {
      try {
        // Validar número (formato brasileiro)
        const telefoneFormatado = this.formatarTelefone(para);

        if (!telefoneFormatado) {
          throw new Error('Número de telefone inválido');
        }

        logger.info(`Enviando WhatsApp para ${telefoneFormatado}`);

        const resultado = await this.client.messages.create({
          from: this.from,
          to: `whatsapp:${telefoneFormatado}`,
          body: mensagem,
        });

        logger.info(`WhatsApp enviado com sucesso: ${resultado.sid}`);

        return {
          success: true,
          messageId: resultado.sid,
          status: resultado.status,
        };
      } catch (error) {
        logger.error('Erro ao enviar WhatsApp:', error);

        if (tentativas > 1) {
          logger.info(`Tentando novamente... (${tentativas - 1} tentativas restantes)`);
          await this.sleep(2000);
          return this.enviarMensagem(para, mensagem, tentativas - 1);
        }

        throw error;
      }
    });
  }

  /**
   * Enviar mensagem com template
   */
  async enviarTemplate(para, templateNome, variaveis = {}) {
    const templates = {
      nova_demanda: (vars) =>
        `🔔 *Nova Demanda Atribuída*\n\n` +
        `Número: ${vars.numero}\n` +
        `Título: ${vars.titulo}\n` +
        `Prazo: ${vars.prazo}\n` +
        `Cliente: ${vars.cliente}\n\n` +
        `Acesse o sistema para mais detalhes.`,

      prazo_vencendo: (vars) =>
        `⚠️ *Prazo Vencendo em 24h*\n\n` +
        `Demanda: ${vars.numero}\n` +
        `Título: ${vars.titulo}\n` +
        `Prazo: ${vars.prazo}\n\n` +
        `Tome as providências necessárias.`,

      pagamento_recebido: (vars) =>
        `✅ *Pagamento Confirmado*\n\n` +
        `Fatura: ${vars.numero_fatura}\n` +
        `Valor: R$ ${vars.valor}\n` +
        `Data: ${vars.data}\n\n` +
        `Obrigado!`,

      status_alterado: (vars) =>
        `📌 *Status Atualizado*\n\n` +
        `Demanda: ${vars.numero}\n` +
        `Novo Status: ${vars.status}\n` +
        `Atualizado por: ${vars.usuario}\n\n` +
        `Verifique os detalhes no sistema.`,
    };

    const mensagem = templates[templateNome]
      ? templates[templateNome](variaveis)
      : `Template '${templateNome}' não encontrado`;

    return this.enviarMensagem(para, mensagem);
  }

  /**
   * Enviar mensagem com mídia
   */
  async enviarComMidia(para, mensagem, mediaUrl) {
    return this.limiter.schedule(async () => {
      try {
        const telefoneFormatado = this.formatarTelefone(para);

        const resultado = await this.client.messages.create({
          from: this.from,
          to: `whatsapp:${telefoneFormatado}`,
          body: mensagem,
          mediaUrl: [mediaUrl],
        });

        logger.info(`WhatsApp com mídia enviado: ${resultado.sid}`);

        return {
          success: true,
          messageId: resultado.sid,
        };
      } catch (error) {
        logger.error('Erro ao enviar WhatsApp com mídia:', error);
        throw error;
      }
    });
  }

  /**
   * Verificar status de mensagem
   */
  async verificarStatus(messageId) {
    try {
      const mensagem = await this.client.messages(messageId).fetch();

      return {
        status: mensagem.status,
        errorCode: mensagem.errorCode,
        errorMessage: mensagem.errorMessage,
        dateCreaed: mensagem.dateCreated,
        dateUpdated: mensagem.dateUpdated,
      };
    } catch (error) {
      logger.error('Erro ao verificar status WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Formatar telefone brasileiro
   */
  formatarTelefone(telefone) {
    // Remove tudo exceto números
    const apenasNumeros = telefone.replace(/\D/g, '');

    // Adiciona código do país se não tiver
    if (apenasNumeros.length === 11) {
      return `+55${apenasNumeros}`;
    } else if (apenasNumeros.length === 13 && apenasNumeros.startsWith('55')) {
      return `+${apenasNumeros}`;
    }

    return null;
  }

  /**
   * Notificar equipe
   */
  async notificarEquipe(telefonesEquipe, mensagem) {
    const resultados = [];

    for (const telefone of telefonesEquipe) {
      try {
        const resultado = await this.enviarMensagem(telefone, mensagem);
        resultados.push({ telefone, sucesso: true, resultado });
      } catch (error) {
        resultados.push({ telefone, sucesso: false, erro: error.message });
      }
    }

    return resultados;
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Verificar saúde do serviço
   */
  async healthCheck() {
    try {
      // Tentar buscar conta
      const conta = await this.client.api.accounts(process.env.WHATSAPP_ACCOUNT_SID).fetch();

      return {
        status: 'healthy',
        provider: this.provider,
        account: conta.friendlyName,
      };
    } catch (error) {
      logger.error('WhatsApp health check failed:', error);
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }
}

module.exports = new WhatsAppService();
```

---

# 3. GOOGLE CALENDAR API

## 3.1 src/services/google-calendar.service.js

```javascript
const { google } = require('googleapis');
const logger = require('../utils/logger');

class GoogleCalendarService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Configurar token de refresh
    if (process.env.GOOGLE_REFRESH_TOKEN) {
      this.oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      });
    }

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    this.calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    logger.info('Google Calendar Service initialized');
  }

  /**
   * Criar evento
   */
  async criarEvento(eventoData) {
    try {
      const { titulo, descricao, dataInicio, dataFim, local, participantes = [] } = eventoData;

      const evento = {
        summary: titulo,
        description: descricao,
        location: local,
        start: {
          dateTime: new Date(dataInicio).toISOString(),
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: new Date(dataFim).toISOString(),
          timeZone: 'America/Sao_Paulo',
        },
        attendees: participantes.map((email) => ({ email })),
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 dia antes
            { method: 'popup', minutes: 30 }, // 30 min antes
          ],
        },
      };

      const response = await this.calendar.events.insert({
        calendarId: this.calendarId,
        resource: evento,
        sendUpdates: 'all',
      });

      logger.info(`Evento criado no Google Calendar: ${response.data.id}`);

      return {
        success: true,
        eventoId: response.data.id,
        htmlLink: response.data.htmlLink,
      };
    } catch (error) {
      logger.error('Erro ao criar evento no Google Calendar:', error);
      throw new Error(`Google Calendar: ${error.message}`);
    }
  }

  /**
   * Atualizar evento
   */
  async atualizarEvento(eventoId, eventoData) {
    try {
      const { titulo, descricao, dataInicio, dataFim, local } = eventoData;

      const eventoAtualizado = {
        summary: titulo,
        description: descricao,
        location: local,
        start: {
          dateTime: new Date(dataInicio).toISOString(),
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: new Date(dataFim).toISOString(),
          timeZone: 'America/Sao_Paulo',
        },
      };

      const response = await this.calendar.events.update({
        calendarId: this.calendarId,
        eventId: eventoId,
        resource: eventoAtualizado,
        sendUpdates: 'all',
      });

      logger.info(`Evento atualizado: ${response.data.id}`);

      return {
        success: true,
        eventoId: response.data.id,
      };
    } catch (error) {
      logger.error('Erro ao atualizar evento:', error);
      throw error;
    }
  }

  /**
   * Deletar evento
   */
  async deletarEvento(eventoId) {
    try {
      await this.calendar.events.delete({
        calendarId: this.calendarId,
        eventId: eventoId,
        sendUpdates: 'all',
      });

      logger.info(`Evento deletado: ${eventoId}`);

      return {
        success: true,
        eventoId,
      };
    } catch (error) {
      logger.error('Erro ao deletar evento:', error);
      throw error;
    }
  }

  /**
   * Listar eventos
   */
  async listarEventos(dataInicio, dataFim, maxResultados = 50) {
    try {
      const response = await this.calendar.events.list({
        calendarId: this.calendarId,
        timeMin: new Date(dataInicio).toISOString(),
        timeMax: new Date(dataFim).toISOString(),
        maxResults: maxResultados,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const eventos = response.data.items || [];

      logger.info(`${eventos.length} eventos encontrados`);

      return eventos.map((e) => ({
        id: e.id,
        titulo: e.summary,
        descricao: e.description,
        dataInicio: e.start.dateTime || e.start.date,
        dataFim: e.end.dateTime || e.end.date,
        local: e.location,
        link: e.htmlLink,
      }));
    } catch (error) {
      logger.error('Erro ao listar eventos:', error);
      throw error;
    }
  }

  /**
   * Obter evento específico
   */
  async obterEvento(eventoId) {
    try {
      const response = await this.calendar.events.get({
        calendarId: this.calendarId,
        eventId: eventoId,
      });

      return {
        id: response.data.id,
        titulo: response.data.summary,
        descricao: response.data.description,
        dataInicio: response.data.start.dateTime,
        dataFim: response.data.end.dateTime,
        local: response.data.location,
        participantes: response.data.attendees || [],
      };
    } catch (error) {
      logger.error('Erro ao obter evento:', error);
      throw error;
    }
  }

  /**
   * Verificar disponibilidade
   */
  async verificarDisponibilidade(dataInicio, dataFim) {
    try {
      const response = await this.calendar.freebusy.query({
        resource: {
          timeMin: new Date(dataInicio).toISOString(),
          timeMax: new Date(dataFim).toISOString(),
          items: [{ id: this.calendarId }],
        },
      });

      const ocupado = response.data.calendars[this.calendarId].busy || [];

      return {
        disponivel: ocupado.length === 0,
        horariosOcupados: ocupado,
      };
    } catch (error) {
      logger.error('Erro ao verificar disponibilidade:', error);
      throw error;
    }
  }

  /**
   * Sincronizar com agenda local
   */
  async sincronizarAgenda(agendaLocal) {
    try {
      const eventosGoogle = await this.listarEventos(
        new Date(),
        new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 dias
      );

      const sincronizados = [];

      for (const eventoLocal of agendaLocal) {
        const existe = eventosGoogle.find((e) => e.id === eventoLocal.google_event_id);

        if (!existe) {
          // Criar no Google
          const resultado = await this.criarEvento(eventoLocal);
          sincronizados.push({ ...eventoLocal, google_event_id: resultado.eventoId });
        }
      }

      logger.info(`${sincronizados.length} eventos sincronizados`);

      return sincronizados;
    } catch (error) {
      logger.error('Erro ao sincronizar agenda:', error);
      throw error;
    }
  }

  /**
   * Gerar URL de autorização OAuth
   */
  gerarUrlAutorizacao() {
    const scopes = ['https://www.googleapis.com/auth/calendar'];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
  }

  /**
   * Trocar código por token
   */
  async trocarCodigo(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      logger.info('Tokens obtidos com sucesso');

      return tokens;
    } catch (error) {
      logger.error('Erro ao trocar código:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      await this.calendar.calendarList.list();
      return { status: 'healthy' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

module.exports = new GoogleCalendarService();
```

---

# 4. RECEITA FEDERAL API

## 4.1 src/services/receita-federal.service.js

```javascript
const axios = require('axios');
const logger = require('../utils/logger');
const Bottleneck = require('bottleneck');

class ReceitaFederalService {
  constructor() {
    this.apiUrl = process.env.RECEITA_FEDERAL_API_URL || 'https://receitaws.com.br/v1';
    this.timeout = parseInt(process.env.API_TIMEOUT) || 10000;

    // Rate limiter: 3 requisições por minuto (API pública tem limite)
    this.limiter = new Bottleneck({
      reservoir: 3,
      reservoirRefreshAmount: 3,
      reservoirRefreshInterval: 60 * 1000,
      maxConcurrent: 1,
      minTime: 20000, // 20 segundos entre requests
    });

    this.cache = new Map();
    this.cacheTTL = 24 * 60 * 60 * 1000; // 24 horas

    logger.info('Receita Federal Service initialized');
  }

  /**
   * Consultar CNPJ
   */
  async consultarCNPJ(cnpj, tentativas = 2) {
    return this.limiter.schedule(async () => {
      try {
        // Limpar CNPJ
        const cnpjLimpo = cnpj.replace(/\D/g, '');

        if (cnpjLimpo.length !== 14) {
          throw new Error('CNPJ inválido');
        }

        // Verificar cache
        const cacheKey = `cnpj_${cnpjLimpo}`;
        const cached = this.cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
          logger.info(`CNPJ ${cnpjLimpo} retornado do cache`);
          return cached.data;
        }

        logger.info(`Consultando CNPJ: ${cnpjLimpo}`);

        const response = await axios.get(`${this.apiUrl}/cnpj/${cnpjLimpo}`, {
          timeout: this.timeout,
          headers: {
            'User-Agent': 'JurisConnect/1.0',
          },
        });

        if (response.data.status === 'ERROR') {
          throw new Error(response.data.message || 'Erro ao consultar CNPJ');
        }

        const dados = {
          cnpj: response.data.cnpj,
          razao_social: response.data.nome,
          nome_fantasia: response.data.fantasia,
          situacao: response.data.situacao,
          data_abertura: response.data.abertura,
          tipo: response.data.tipo,
          porte: response.data.porte,
          capital_social: response.data.capital_social,
          email: response.data.email,
          telefone: response.data.telefone,
          logradouro: response.data.logradouro,
          numero: response.data.numero,
          complemento: response.data.complemento,
          bairro: response.data.bairro,
          municipio: response.data.municipio,
          uf: response.data.uf,
          cep: response.data.cep,
          atividade_principal: response.data.atividade_principal,
          atividades_secundarias: response.data.atividades_secundarias,
          qsa: response.data.qsa, // Quadro Societário
        };

        // Salvar no cache
        this.cache.set(cacheKey, {
          data: dados,
          timestamp: Date.now(),
        });

        logger.info(`CNPJ ${cnpjLimpo} consultado com sucesso`);

        return dados;
      } catch (error) {
        logger.error('Erro ao consultar CNPJ:', error);

        if (tentativas > 1 && error.code === 'ECONNABORTED') {
          logger.info(`Tentando novamente... (${tentativas - 1} tentativas restantes)`);
          await this.sleep(5000);
          return this.consultarCNPJ(cnpj, tentativas - 1);
        }

        throw new Error(`Receita Federal: ${error.message}`);
      }
    });
  }

  /**
   * Validar CNPJ (algoritmo oficial)
   */
  validarCNPJ(cnpj) {
    const cnpjLimpo = cnpj.replace(/\D/g, '');

    if (cnpjLimpo.length !== 14) return false;

    // Eliminar CNPJs inválidos conhecidos
    if (/^(\d)\1+$/.test(cnpjLimpo)) return false;

    let tamanho = cnpjLimpo.length - 2;
    let numeros = cnpjLimpo.substring(0, tamanho);
    const digitos = cnpjLimpo.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

    if (resultado !== parseInt(digitos.charAt(0))) return false;

    tamanho = tamanho + 1;
    numeros = cnpjLimpo.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

    return resultado === parseInt(digitos.charAt(1));
  }

  /**
   * Formatar CNPJ
   */
  formatarCNPJ(cnpj) {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    return cnpjLimpo.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Limpar cache
   */
  limparCache() {
    this.cache.clear();
    logger.info('Cache da Receita Federal limpo');
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      // Tentar consultar um CNPJ válido conhecido (Petrobras)
      await axios.get(`${this.apiUrl}/cnpj/33000167000101`, { timeout: 5000 });
      return { status: 'healthy' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

module.exports = new ReceitaFederalService();
```

---

**Integrações Externas - Parte 1/3** ✅

**Continuação com ViaCEP, Email, Storage e Helpers no próximo arquivo...**