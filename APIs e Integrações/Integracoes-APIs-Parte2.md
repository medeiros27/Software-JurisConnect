# JURISCONNECT - INTEGRAÇÕES APIs (PARTE 2)

## 📋 CONTINUAÇÃO

5. [ViaCEP API](#5-viacep-api)
6. [Email Service](#6-email-service)
7. [Storage Service](#7-storage-service)
8. [Helpers e Utilities](#8-helpers-e-utilities)
9. [Controllers de Integração](#9-controllers-de-integração)
10. [Testes e Exemplos](#10-testes-e-exemplos)

---

# 5. VIACEP API

## 5.1 src/services/viacep.service.js

```javascript
const axios = require('axios');
const logger = require('../utils/logger');

class ViaCEPService {
  constructor() {
    this.apiUrl = process.env.VIACEP_API_URL || 'https://viacep.com.br/ws';
    this.timeout = parseInt(process.env.API_TIMEOUT) || 10000;
    this.cache = new Map();
    this.cacheTTL = 7 * 24 * 60 * 60 * 1000; // 7 dias

    logger.info('ViaCEP Service initialized');
  }

  /**
   * Consultar CEP
   */
  async consultarCEP(cep, tentativas = 2) {
    try {
      // Limpar CEP
      const cepLimpo = cep.replace(/\D/g, '');

      if (cepLimpo.length !== 8) {
        throw new Error('CEP inválido');
      }

      // Verificar cache
      const cacheKey = `cep_${cepLimpo}`;
      const cached = this.cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        logger.info(`CEP ${cepLimpo} retornado do cache`);
        return cached.data;
      }

      logger.info(`Consultando CEP: ${cepLimpo}`);

      const response = await axios.get(`${this.apiUrl}/${cepLimpo}/json`, {
        timeout: this.timeout,
      });

      if (response.data.erro) {
        throw new Error('CEP não encontrado');
      }

      const dados = {
        cep: response.data.cep,
        logradouro: response.data.logradouro,
        complemento: response.data.complemento,
        bairro: response.data.bairro,
        localidade: response.data.localidade,
        uf: response.data.uf,
        ibge: response.data.ibge,
        gia: response.data.gia,
        ddd: response.data.ddd,
        siafi: response.data.siafi,
      };

      // Salvar no cache
      this.cache.set(cacheKey, {
        data: dados,
        timestamp: Date.now(),
      });

      logger.info(`CEP ${cepLimpo} consultado com sucesso`);

      return dados;
    } catch (error) {
      logger.error('Erro ao consultar CEP:', error);

      if (tentativas > 1 && (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT')) {
        logger.info(`Tentando novamente... (${tentativas - 1} tentativas restantes)`);
        await this.sleep(2000);
        return this.consultarCEP(cep, tentativas - 1);
      }

      throw new Error(`ViaCEP: ${error.message}`);
    }
  }

  /**
   * Buscar CEP por endereço
   */
  async buscarPorEndereco(uf, cidade, logradouro) {
    try {
      if (logradouro.length < 3) {
        throw new Error('Logradouro deve ter pelo menos 3 caracteres');
      }

      logger.info(`Buscando CEPs em ${cidade}/${uf} - ${logradouro}`);

      const response = await axios.get(
        `${this.apiUrl}/${uf}/${cidade}/${logradouro}/json`,
        { timeout: this.timeout }
      );

      if (!response.data || response.data.length === 0) {
        throw new Error('Nenhum CEP encontrado');
      }

      return response.data.map((item) => ({
        cep: item.cep,
        logradouro: item.logradouro,
        complemento: item.complemento,
        bairro: item.bairro,
        localidade: item.localidade,
        uf: item.uf,
      }));
    } catch (error) {
      logger.error('Erro ao buscar endereço:', error);
      throw error;
    }
  }

  /**
   * Validar CEP (formato)
   */
  validarCEP(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.length === 8 && /^\d{8}$/.test(cepLimpo);
  }

  /**
   * Formatar CEP
   */
  formatarCEP(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.replace(/^(\d{5})(\d{3})$/, '$1-$2');
  }

  /**
   * Limpar cache
   */
  limparCache() {
    this.cache.clear();
    logger.info('Cache do ViaCEP limpo');
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      // Tentar consultar um CEP válido conhecido
      await axios.get(`${this.apiUrl}/01001000/json`, { timeout: 5000 });
      return { status: 'healthy' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

module.exports = new ViaCEPService();
```

---

# 6. EMAIL SERVICE

## 6.1 src/services/email.service.js

```javascript
const sgMail = require('@sendgrid/mail');
const AWS = require('aws-sdk');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

class EmailService {
  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'sendgrid';

    if (this.provider === 'sendgrid') {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    } else if (this.provider === 'ses') {
      this.ses = new AWS.SES({
        apiVersion: '2010-12-01',
        region: process.env.AWS_SES_REGION,
        accessKeyId: process.env.AWS_SES_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SES_SECRET_KEY,
      });
    }

    this.from = {
      email: process.env.EMAIL_FROM,
      name: process.env.EMAIL_FROM_NAME || 'JurisConnect',
    };

    logger.info(`Email Service initialized (provider: ${this.provider})`);
  }

  /**
   * Enviar email simples
   */
  async enviar(para, assunto, conteudo, tentativas = 2) {
    try {
      logger.info(`Enviando email para ${para}`);

      if (this.provider === 'sendgrid') {
        return await this.enviarSendGrid(para, assunto, conteudo);
      } else if (this.provider === 'ses') {
        return await this.enviarSES(para, assunto, conteudo);
      } else {
        throw new Error('Provider de email não configurado');
      }
    } catch (error) {
      logger.error('Erro ao enviar email:', error);

      if (tentativas > 1) {
        logger.info(`Tentando novamente... (${tentativas - 1} tentativas restantes)`);
        await this.sleep(3000);
        return this.enviar(para, assunto, conteudo, tentativas - 1);
      }

      throw error;
    }
  }

  /**
   * SendGrid
   */
  async enviarSendGrid(para, assunto, conteudo) {
    const msg = {
      to: para,
      from: this.from,
      subject: assunto,
      html: conteudo,
    };

    const response = await sgMail.send(msg);

    logger.info(`Email enviado via SendGrid: ${response[0].statusCode}`);

    return {
      success: true,
      provider: 'sendgrid',
      messageId: response[0].headers['x-message-id'],
    };
  }

  /**
   * AWS SES
   */
  async enviarSES(para, assunto, conteudo) {
    const params = {
      Source: `${this.from.name} <${this.from.email}>`,
      Destination: {
        ToAddresses: [para],
      },
      Message: {
        Subject: {
          Data: assunto,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: conteudo,
            Charset: 'UTF-8',
          },
        },
      },
    };

    const response = await this.ses.sendEmail(params).promise();

    logger.info(`Email enviado via SES: ${response.MessageId}`);

    return {
      success: true,
      provider: 'ses',
      messageId: response.MessageId,
    };
  }

  /**
   * Enviar com template
   */
  async enviarComTemplate(para, templateNome, variaveis) {
    try {
      const template = await this.carregarTemplate(templateNome);
      const conteudo = this.substituirVariaveis(template, variaveis);
      const assunto = this.extrairAssunto(conteudo);

      return await this.enviar(para, assunto, conteudo);
    } catch (error) {
      logger.error('Erro ao enviar email com template:', error);
      throw error;
    }
  }

  /**
   * Enviar email em lote
   */
  async enviarLote(destinatarios, assunto, conteudo) {
    const resultados = [];

    for (const destinatario of destinatarios) {
      try {
        const resultado = await this.enviar(destinatario, assunto, conteudo);
        resultados.push({ email: destinatario, sucesso: true, resultado });
      } catch (error) {
        resultados.push({ email: destinatario, sucesso: false, erro: error.message });
      }

      // Aguardar 200ms entre envios
      await this.sleep(200);
    }

    return resultados;
  }

  /**
   * Templates pré-definidos
   */
  async enviarBoasVindas(para, nomeUsuario) {
    const conteudo = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2465a7;">Bem-vindo ao JurisConnect!</h2>
        <p>Olá, <strong>${nomeUsuario}</strong>!</p>
        <p>Sua conta foi criada com sucesso.</p>
        <p>Acesse o sistema e comece a gerenciar suas demandas jurídicas de forma eficiente.</p>
        <a href="${process.env.APP_URL}/login" style="background: #2465a7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">Acessar Sistema</a>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
        <small style="color: #666;">JurisConnect - Sistema de Gestão Jurídica</small>
      </div>
    `;

    return await this.enviar(para, 'Bem-vindo ao JurisConnect', conteudo);
  }

  async enviarNotificacaoDemanda(para, demanda) {
    const conteudo = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2465a7;">🔔 Nova Demanda Atribuída</h2>
        <p>Uma nova demanda foi atribuída a você:</p>
        <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #2465a7; margin: 20px 0;">
          <p><strong>Número:</strong> ${demanda.numero}</p>
          <p><strong>Título:</strong> ${demanda.titulo}</p>
          <p><strong>Cliente:</strong> ${demanda.cliente_nome}</p>
          <p><strong>Prazo:</strong> ${demanda.data_prazo}</p>
        </div>
        <a href="${process.env.APP_URL}/demandas/${demanda.id}" style="background: #2465a7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver Detalhes</a>
      </div>
    `;

    return await this.enviar(para, `Nova Demanda: ${demanda.numero}`, conteudo);
  }

  async enviarNotificacaoPrazo(para, demanda) {
    const conteudo = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">⚠️ Prazo Vencendo</h2>
        <p>A demanda abaixo vence em breve:</p>
        <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #e74c3c; margin: 20px 0;">
          <p><strong>Número:</strong> ${demanda.numero}</p>
          <p><strong>Título:</strong> ${demanda.titulo}</p>
          <p><strong>Prazo:</strong> ${demanda.data_prazo}</p>
        </div>
        <p>Tome as providências necessárias.</p>
        <a href="${process.env.APP_URL}/demandas/${demanda.id}" style="background: #e74c3c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver Demanda</a>
      </div>
    `;

    return await this.enviar(para, `⚠️ Prazo Vencendo: ${demanda.numero}`, conteudo);
  }

  async enviarComprovantePagamento(para, pagamento) {
    const conteudo = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">✅ Pagamento Confirmado</h2>
        <p>Confirmamos o recebimento do pagamento:</p>
        <div style="background: #d4edda; padding: 15px; border-left: 4px solid #27ae60; margin: 20px 0;">
          <p><strong>Fatura:</strong> ${pagamento.numero_fatura}</p>
          <p><strong>Valor:</strong> R$ ${pagamento.valor_final}</p>
          <p><strong>Data:</strong> ${pagamento.data_pagamento}</p>
          <p><strong>Forma:</strong> ${pagamento.forma_pagamento}</p>
        </div>
        <p>Obrigado!</p>
      </div>
    `;

    return await this.enviar(para, `Pagamento Confirmado - ${pagamento.numero_fatura}`, conteudo);
  }

  /**
   * Carregar template de arquivo
   */
  async carregarTemplate(templateNome) {
    const caminhoTemplate = path.join(
      process.cwd(),
      'templates',
      'emails',
      `${templateNome}.html`
    );

    try {
      return await fs.readFile(caminhoTemplate, 'utf-8');
    } catch (error) {
      logger.error(`Template ${templateNome} não encontrado`);
      throw new Error(`Template ${templateNome} não encontrado`);
    }
  }

  /**
   * Substituir variáveis no template
   */
  substituirVariaveis(template, variaveis) {
    let resultado = template;

    for (const [chave, valor] of Object.entries(variaveis)) {
      const regex = new RegExp(`{{${chave}}}`, 'g');
      resultado = resultado.replace(regex, valor);
    }

    return resultado;
  }

  /**
   * Extrair assunto do template
   */
  extrairAssunto(template) {
    const match = template.match(/<title>(.*?)<\/title>/);
    return match ? match[1] : 'Notificação JurisConnect';
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      if (this.provider === 'sendgrid') {
        // SendGrid não tem endpoint de health check público
        return { status: 'healthy', provider: 'sendgrid' };
      } else if (this.provider === 'ses') {
        await this.ses.getSendQuota().promise();
        return { status: 'healthy', provider: 'ses' };
      }
    } catch (error) {
      return { status: 'unhealthy', provider: this.provider, error: error.message };
    }
  }
}

module.exports = new EmailService();
```

---

# 7. STORAGE SERVICE

## 7.1 src/services/storage.service.js

```javascript
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');
const crypto = require('crypto');

class StorageService {
  constructor() {
    this.provider = process.env.STORAGE_PROVIDER || 'local';

    if (this.provider === 's3') {
      this.s3 = new AWS.S3({
        region: process.env.AWS_S3_REGION,
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY,
      });
      this.bucket = process.env.AWS_S3_BUCKET;
    } else {
      this.localPath = process.env.STORAGE_LOCAL_PATH || './uploads';
    }

    logger.info(`Storage Service initialized (provider: ${this.provider})`);
  }

  /**
   * Configurar Multer (upload middleware)
   */
  configurarMulter() {
    if (this.provider === 's3') {
      return multer({
        storage: multerS3({
          s3: this.s3,
          bucket: this.bucket,
          acl: 'private',
          metadata: (req, file, cb) => {
            cb(null, {
              fieldName: file.fieldname,
              originalName: file.originalname,
              uploadedBy: req.usuarioId || 'unknown',
            });
          },
          key: (req, file, cb) => {
            const nomeArquivo = this.gerarNomeUnico(file.originalname);
            const pasta = req.body.pasta || 'documentos';
            cb(null, `${pasta}/${nomeArquivo}`);
          },
        }),
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB
        },
        fileFilter: this.filtroArquivos.bind(this),
      });
    } else {
      return multer({
        storage: multer.diskStorage({
          destination: async (req, file, cb) => {
            const pasta = req.body.pasta || 'documentos';
            const caminhoCompleto = path.join(this.localPath, pasta);

            try {
              await fs.mkdir(caminhoCompleto, { recursive: true });
              cb(null, caminhoCompleto);
            } catch (error) {
              cb(error);
            }
          },
          filename: (req, file, cb) => {
            const nomeArquivo = this.gerarNomeUnico(file.originalname);
            cb(null, nomeArquivo);
          },
        }),
        limits: {
          fileSize: 10 * 1024 * 1024,
        },
        fileFilter: this.filtroArquivos.bind(this),
      });
    }
  }

  /**
   * Upload de arquivo
   */
  async upload(file, pasta = 'documentos') {
    try {
      if (this.provider === 's3') {
        return await this.uploadS3(file, pasta);
      } else {
        return await this.uploadLocal(file, pasta);
      }
    } catch (error) {
      logger.error('Erro ao fazer upload:', error);
      throw error;
    }
  }

  /**
   * Upload S3
   */
  async uploadS3(file, pasta) {
    const nomeArquivo = this.gerarNomeUnico(file.originalname);
    const key = `${pasta}/${nomeArquivo}`;

    const params = {
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: file.originalname,
      },
    };

    const resultado = await this.s3.upload(params).promise();

    logger.info(`Arquivo enviado para S3: ${key}`);

    return {
      url: resultado.Location,
      key: resultado.Key,
      bucket: resultado.Bucket,
      provider: 's3',
    };
  }

  /**
   * Upload Local
   */
  async uploadLocal(file, pasta) {
    const nomeArquivo = this.gerarNomeUnico(file.originalname);
    const caminhoCompleto = path.join(this.localPath, pasta);
    const caminhoArquivo = path.join(caminhoCompleto, nomeArquivo);

    await fs.mkdir(caminhoCompleto, { recursive: true });
    await fs.writeFile(caminhoArquivo, file.buffer);

    logger.info(`Arquivo salvo localmente: ${caminhoArquivo}`);

    return {
      url: `/uploads/${pasta}/${nomeArquivo}`,
      path: caminhoArquivo,
      provider: 'local',
    };
  }

  /**
   * Download de arquivo
   */
  async download(key) {
    try {
      if (this.provider === 's3') {
        return await this.downloadS3(key);
      } else {
        return await this.downloadLocal(key);
      }
    } catch (error) {
      logger.error('Erro ao fazer download:', error);
      throw error;
    }
  }

  /**
   * Download S3
   */
  async downloadS3(key) {
    const params = {
      Bucket: this.bucket,
      Key: key,
    };

    const data = await this.s3.getObject(params).promise();

    return {
      buffer: data.Body,
      contentType: data.ContentType,
      metadata: data.Metadata,
    };
  }

  /**
   * Download Local
   */
  async downloadLocal(caminho) {
    const buffer = await fs.readFile(caminho);

    return {
      buffer,
      contentType: this.getMimeType(caminho),
    };
  }

  /**
   * Deletar arquivo
   */
  async deletar(key) {
    try {
      if (this.provider === 's3') {
        return await this.deletarS3(key);
      } else {
        return await this.deletarLocal(key);
      }
    } catch (error) {
      logger.error('Erro ao deletar arquivo:', error);
      throw error;
    }
  }

  /**
   * Deletar S3
   */
  async deletarS3(key) {
    const params = {
      Bucket: this.bucket,
      Key: key,
    };

    await this.s3.deleteObject(params).promise();

    logger.info(`Arquivo deletado do S3: ${key}`);

    return { success: true };
  }

  /**
   * Deletar Local
   */
  async deletarLocal(caminho) {
    await fs.unlink(caminho);

    logger.info(`Arquivo deletado localmente: ${caminho}`);

    return { success: true };
  }

  /**
   * Gerar URL assinada (S3)
   */
  async gerarUrlAssinada(key, expiraEmSegundos = 3600) {
    if (this.provider !== 's3') {
      throw new Error('URLs assinadas só estão disponíveis para S3');
    }

    const params = {
      Bucket: this.bucket,
      Key: key,
      Expires: expiraEmSegundos,
    };

    const url = await this.s3.getSignedUrlPromise('getObject', params);

    return url;
  }

  /**
   * Listar arquivos
   */
  async listar(pasta = '') {
    try {
      if (this.provider === 's3') {
        return await this.listarS3(pasta);
      } else {
        return await this.listarLocal(pasta);
      }
    } catch (error) {
      logger.error('Erro ao listar arquivos:', error);
      throw error;
    }
  }

  /**
   * Listar S3
   */
  async listarS3(pasta) {
    const params = {
      Bucket: this.bucket,
      Prefix: pasta,
    };

    const data = await this.s3.listObjectsV2(params).promise();

    return data.Contents.map((item) => ({
      key: item.Key,
      size: item.Size,
      lastModified: item.LastModified,
    }));
  }

  /**
   * Listar Local
   */
  async listarLocal(pasta) {
    const caminhoCompleto = path.join(this.localPath, pasta);
    const arquivos = await fs.readdir(caminhoCompleto);

    const detalhes = await Promise.all(
      arquivos.map(async (arquivo) => {
        const caminhoArquivo = path.join(caminhoCompleto, arquivo);
        const stats = await fs.stat(caminhoArquivo);

        return {
          key: path.join(pasta, arquivo),
          size: stats.size,
          lastModified: stats.mtime,
        };
      })
    );

    return detalhes;
  }

  /**
   * Gerar nome único para arquivo
   */
  gerarNomeUnico(nomeOriginal) {
    const extensao = path.extname(nomeOriginal);
    const hash = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();

    return `${timestamp}-${hash}${extensao}`;
  }

  /**
   * Filtro de arquivos permitidos
   */
  filtroArquivos(req, file, cb) {
    const tiposPermitidos = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
    ];

    if (tiposPermitidos.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'), false);
    }
  }

  /**
   * Obter MIME type
   */
  getMimeType(caminho) {
    const extensao = path.extname(caminho).toLowerCase();

    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
    };

    return mimeTypes[extensao] || 'application/octet-stream';
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      if (this.provider === 's3') {
        await this.s3.headBucket({ Bucket: this.bucket }).promise();
        return { status: 'healthy', provider: 's3' };
      } else {
        await fs.access(this.localPath);
        return { status: 'healthy', provider: 'local' };
      }
    } catch (error) {
      return { status: 'unhealthy', provider: this.provider, error: error.message };
    }
  }
}

module.exports = new StorageService();
```

---

**Integrações Externas - Parte 2/3** ✅

**Continuação com Controllers, Helpers, Testes e Exemplos no próximo arquivo...**