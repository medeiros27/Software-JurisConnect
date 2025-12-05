# Guia de Integrações Externas - JurisConnect

Este guia detalha como configurar e credenciar cada serviço externo integrado ao JurisConnect.

## Checklist de Credenciamento

### 1. WhatsApp Business API (Meta)
- [ ] Criar conta no [Meta for Developers](https://developers.facebook.com/)
- [ ] Criar app do tipo "Business"
- [ ] Adicionar produto "WhatsApp"
- [ ] Obter `Phone Number ID` e `Access Token` (Permanente)
- [ ] Configurar no `.env`:
    - `WHATSAPP_PHONE_ID`
    - `WHATSAPP_TOKEN`

### 2. Google Calendar API
- [ ] Criar projeto no [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Ativar "Google Calendar API"
- [ ] Configurar Tela de Consentimento OAuth (Externo)
- [ ] Criar Credenciais OAuth 2.0 (Web Application)
- [ ] Adicionar URI de Redirecionamento: `http://localhost:5173/agenda` (ou URL de produção)
- [ ] Configurar no `.env`:
    - `GOOGLE_CLIENT_ID`
    - `GOOGLE_CLIENT_SECRET`
    - `GOOGLE_REDIRECT_URI`

### 3. Receita Federal (BrasilAPI)
- [ ] Nenhuma configuração necessária (API Pública).
- [ ] Fallback: Se BrasilAPI falhar, implementar [ReceitaWS](https://receitaws.com.br/) (Pago para alta demanda).

### 4. ViaCEP
- [ ] Nenhuma configuração necessária (API Pública).

### 5. Email (AWS SES ou SendGrid)
#### Opção A: AWS SES
- [ ] Criar conta AWS
- [ ] Verificar domínio no SES
- [ ] Criar usuário IAM com permissão `ses:SendEmail`
- [ ] Configurar no `.env`:
    - `SMTP_HOST=email-smtp.us-east-1.amazonaws.com`
    - `SMTP_USER=AKIA...`
    - `SMTP_PASS=...`

#### Opção B: SendGrid
- [ ] Criar conta SendGrid
- [ ] Criar API Key com permissão "Mail Send"
- [ ] Configurar no `.env`:
    - `SMTP_HOST=smtp.sendgrid.net`
    - `SMTP_USER=apikey`
    - `SMTP_PASS=SG....`

### 6. Storage (AWS S3)
- [ ] Criar Bucket S3 (ex: `jurisconnect-docs`)
- [ ] Configurar CORS no Bucket (permitir GET/PUT)
- [ ] Criar usuário IAM com permissão `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`
- [ ] Configurar no `.env`:
    - `STORAGE_PROVIDER=s3`
    - `AWS_ACCESS_KEY_ID`
    - `AWS_SECRET_ACCESS_KEY`
    - `AWS_REGION`
    - `AWS_BUCKET_NAME`

### 7. DataJud (CNJ)
- [ ] Solicitar chave de API no [Painel do DataJud](https://datajud.cnj.jus.br/)
- [ ] Configurar no `.env`:
    - `DATAJUD_API_KEY`

## Variáveis de Ambiente (.env)

Copie e preencha no seu `.env`:

```env
# Integrações
WHATSAPP_PHONE_ID=
WHATSAPP_TOKEN=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_SECURE=false
SMTP_FROM=no-reply@jurisconnect.com.br

STORAGE_PROVIDER=local # ou s3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_BUCKET_NAME=

DATAJUD_API_KEY=
```
