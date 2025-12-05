# Guia de Credenciamento Financeiro - JurisConnect

Este guia orienta sobre como integrar o módulo financeiro do JurisConnect com gateways de pagamento reais (Bancos, Fintechs) para automação de boletos, PIX e cartões.

## 1. Escolha do Gateway

Recomendamos as seguintes opções pela facilidade de API e documentação:

*   **Asaas**: Excelente para boletos e PIX, com taxas competitivas e API muito simples.
*   **Stripe**: Melhor opção para cartões de crédito e assinaturas recorrentes.
*   **Iugu**: Robusto para marketplaces e split de pagamentos (útil se você paga correspondentes automaticamente).
*   **Efí (Gerencianet)**: Ótimo para PIX e boletos.

## 2. Obtendo Credenciais

Para qualquer gateway, o processo é similar:
1.  Crie uma conta PJ no site do provedor.
2.  Acesse a área de **Desenvolvedor** ou **API**.
3.  Gere as chaves:
    *   `API_KEY` (Chave de Produção)
    *   `SANDBOX_KEY` (Chave de Teste - Importante!)

## 3. Configuração no JurisConnect

Adicione as chaves no arquivo `.env` do backend:

```env
# Exemplo Asaas
ASAAS_API_KEY=sua_chave_aqui
ASAAS_API_URL=https://www.asaas.com/api/v3
```

## 4. Integração Técnica (Roteiro de Implementação)

Para automatizar, você precisará criar um `Service` específico (ex: `asaas.service.js`) que encapsule as chamadas HTTP.

### A. Gerar Cobrança (Boleto/PIX)
Quando criar um Pagamento "A Receber" no sistema:
1.  O sistema chama a API do Gateway enviando: Cliente, Valor, Vencimento.
2.  O Gateway retorna o `id_transacao` e a `url_boleto`.
3.  Salve esses dados no registro do Pagamento.

### B. Webhooks (Baixa Automática)
Para saber quando o cliente pagou sem precisar olhar o banco:
1.  Configure uma URL de Webhook no painel do Gateway (ex: `https://api.jurisconnect.com.br/api/v1/financeiro/webhook`).
2.  No `pagamento.controller.js`, crie o método `webhook`:
    *   Recebe o evento `PAYMENT_RECEIVED`.
    *   Busca o pagamento pelo `id_transacao`.
    *   Atualiza status para `pago` e preenche `data_pagamento`.

## 5. Exemplo de Código (Service Stub)

```javascript
// src/services/asaas.service.js
const axios = require('axios');

const api = axios.create({
    baseURL: process.env.ASAAS_API_URL,
    headers: { access_token: process.env.ASAAS_API_KEY }
});

module.exports = {
    async criarCobranca(dados) {
        const response = await api.post('/payments', {
            customer: dados.cliente_gateway_id,
            billingType: 'BOLETO',
            value: dados.valor,
            dueDate: dados.vencimento
        });
        return response.data;
    }
};
```

## 6. Segurança

*   Nunca commite suas chaves de API no Git.
*   Valide a assinatura dos Webhooks para garantir que a requisição veio mesmo do Gateway.
*   Use HTTPS em produção.
