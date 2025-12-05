# JURISCONNECT - Guia Prático de Uso da API REST

## 🚀 QUICK START - PRIMEIRAS REQUISIÇÕES

### 1. Login e Obter Token

```bash
# cURL
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@jurisconnect.com",
    "senha": "SenhaForte123!",
    "lembrar_me": false
  }'

# JavaScript/Node.js
const response = await fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'usuario@jurisconnect.com',
    senha: 'SenhaForte123!',
    lembrar_me: false
  })
});

const data = await response.json();
const token = data.dados.token;
console.log('Token obtido:', token);

# Python
import requests

response = requests.post(
    'http://localhost:3000/api/v1/auth/login',
    json={
        'email': 'usuario@jurisconnect.com',
        'senha': 'SenhaForte123!',
        'lembrar_me': False
    }
)

token = response.json()['dados']['token']
print(f'Token obtido: {token}')
```

### 2. Usar o Token em Próximas Requisições

```bash
# cURL
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# JavaScript
const response = await fetch('http://localhost:3000/api/v1/auth/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const user = await response.json();
console.log('Usuário autenticado:', user.dados);

# Python
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

response = requests.get(
    'http://localhost:3000/api/v1/auth/me',
    headers=headers
)

user = response.json()['dados']
print(f'Usuário: {user["nome_completo"]}')
```

---

## 📋 EXEMPLOS DE CASOS DE USO COMUNS

### Caso 1: Criar e Atribuir uma Demanda

```javascript
// 1. Criar demanda
const demandaResponse = await fetch('http://localhost:3000/api/v1/demandas', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    cliente_id: 1,
    especialidade_id: 1,
    titulo: 'Consultoria Contratual',
    descricao_servico: 'Análise de contrato comercial',
    prioridade: 'alta',
    valor_estimado: 5000.00,
    data_prazo_cliente: '2025-12-01'
  })
});

const demandaData = await demandaResponse.json();
const demandaId = demandaData.dados.id;
console.log(`Demanda criada: ${demandaData.dados.numero_protocolo}`);

// 2. Atribuir correspondente
const atribuirResponse = await fetch(
  `http://localhost:3000/api/v1/demandas/${demandaId}/atribuir-correspondente`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      correspondente_id: 5,
      motivo_reatribuicao: 'Especialista em contratos comerciais'
    })
  }
);

const atribuirData = await atribuirResponse.json();
console.log('Correspondente atribuído com sucesso');

// 3. Criar diligência
const diligenciaResponse = await fetch(
  `http://localhost:3000/api/v1/demandas/${demandaId}/diligencias`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tipo_diligencia: 'Parecer Jurídico',
      descricao: 'Parecer analisando pontos críticos do contrato',
      prazo_dias: 10,
      responsavel_id: 5
    })
  }
);

console.log('Diligência criada com sucesso');

// 4. Agendar reunião
const eventoResponse = await fetch('http://localhost:3000/api/v1/agenda', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    titulo: 'Reunião com Cliente - Análise Contrato',
    data_hora_inicio: '2025-11-10T14:00:00Z',
    data_hora_fim: '2025-11-10T15:00:00Z',
    demanda_id: demandaId,
    tipo_evento: 'reuniao',
    notificacao_whatsapp: true
  })
});

console.log('Reunião agendada com sucesso');
```

### Caso 2: Processar Pagamento

```javascript
// 1. Listar pagamentos pendentes
const pagamentosResponse = await fetch(
  'http://localhost:3000/api/v1/pagamentos?status=pendente&pagina=1&limite=10',
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
);

const pagamentos = await pagamentosResponse.json();
const pagamento = pagamentos.dados.pagamentos[0];

// 2. Registrar pagamento
const registrarResponse = await fetch(
  `http://localhost:3000/api/v1/pagamentos/${pagamento.id}/registrar-pagamento`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      valor_pago: pagamento.valor_total,
      data_pagamento: '2025-11-02',
      metodo_pagamento: 'pix'
    })
  }
);

const resultado = await registrarResponse.json();
console.log('Pagamento registrado com sucesso');

// 3. Upload de comprovante
const formData = new FormData();
formData.append('comprovante', arquivoFile);

const uploadResponse = await fetch(
  `http://localhost:3000/api/v1/pagamentos/${pagamento.id}/upload-comprovante`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  }
);

console.log('Comprovante enviado com sucesso');
```

### Caso 3: Gerar Relatório

```javascript
// 1. Obter relatório dashboard
const dashboardResponse = await fetch(
  'http://localhost:3000/api/v1/relatorios/dashboard',
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
);

const dashboard = await dashboardResponse.json();
console.log(`Demandas abertas: ${dashboard.dados.kpi_demandas_abertas}`);
console.log(`Pagamentos pendentes: ${dashboard.dados.kpi_pagamentos_pendentes}`);

// 2. Gerar relatório financeiro
const relatorioResponse = await fetch(
  'http://localhost:3000/api/v1/relatorios/financeiro?data_inicio=2025-01-01&data_fim=2025-11-02',
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
);

const financeiro = await relatorioResponse.json();
console.log(`Receita: R$ ${financeiro.dados.receita_total}`);

// 3. Exportar como PDF
const pdfResponse = await fetch(
  'http://localhost:3000/api/v1/relatorios/gerar-pdf',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tipo: 'financeiro',
      periodo: 'mes'
    })
  }
);

const pdfData = await pdfResponse.json();
console.log(`PDF gerado: ${pdfData.dados.url}`);
```

---

## 🔄 TRATAMENTO DE ERROS

### Padrão de Erro

```javascript
try {
  const response = await fetch(`http://localhost:3000/api/v1/correspondentes/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();

  if (!data.sucesso) {
    // Erro da API
    console.error(`Erro: ${data.erro.codigo}`);
    console.error(`Mensagem: ${data.erro.mensagem}`);
    
    if (data.erro.detalhes) {
      console.error(`Detalhes:`, data.erro.detalhes);
    }
  } else {
    // Sucesso
    console.log(data.dados);
  }
} catch (error) {
  // Erro de rede
  console.error('Erro de rede:', error.message);
}
```

### Códigos de Status HTTP e Ações

| Código | Erro | Ação |
|--------|------|------|
| 200 | OK | Sucesso - processar dados |
| 201 | Created | Sucesso - recurso criado |
| 204 | No Content | Sucesso - sem dados a retornar |
| 400 | Bad Request | Validação falhou - verificar dados |
| 401 | Unauthorized | Token inválido/expirado - fazer login novamente |
| 403 | Forbidden | Sem permissão - verificar role |
| 404 | Not Found | Recurso não encontrado - verificar ID |
| 409 | Conflict | Conflito (ex: email duplicado) - verificar dados |
| 429 | Too Many Requests | Limite de taxa excedido - aguardar |
| 500 | Internal Server Error | Erro no servidor - contatar suporte |

---

## 🔐 TOKENS E AUTENTICAÇÃO

### Renovar Token Expirado

```javascript
const refreshToken = localStorage.getItem('refresh_token');

const response = await fetch('http://localhost:3000/api/v1/auth/refresh-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refresh_token: refreshToken })
});

const data = await response.json();
const novoToken = data.dados.token;

localStorage.setItem('token', novoToken);
localStorage.setItem('refresh_token', data.dados.refresh_token);
```

### Verificar Expiração de Token

```javascript
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// Usar em interceptor
if (isTokenExpired(token)) {
  // Renovar token
  await refreshToken();
}
```

### Habilitar 2FA

```javascript
// 1. Solicitar setup
const setupResponse = await fetch('http://localhost:3000/api/v1/auth/habilitar-2fa', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    metodo: 'authenticator'
  })
});

const setup = await setupResponse.json();
console.log('QR Code:', setup.dados.qr_code);
console.log('Códigos de backup:', setup.dados.codigos_backup);

// 2. Confirmar 2FA após escanear
const confirmResponse = await fetch('http://localhost:3000/api/v1/auth/login-dois-fa', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'usuario@jurisconnect.com',
    codigo_2fa: '123456',
    metodo: 'authenticator'
  })
});
```

---

## 📊 PAGINAÇÃO

### Implementar Paginação

```javascript
async function obterTodasAsDemandas(token) {
  let pagina = 1;
  let todasDemandas = [];
  let totalPaginas = 1;

  while (pagina <= totalPaginas) {
    const response = await fetch(
      `http://localhost:3000/api/v1/demandas?pagina=${pagina}&limite=50`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();
    todasDemandas = todasDemandas.concat(data.dados.demandas);
    totalPaginas = data.dados.paginacao.total_paginas;
    pagina++;
  }

  return todasDemandas;
}
```

---

## 🔍 FILTROS E BUSCA

### Construir Query Strings Dinâmicos

```javascript
function construirQueryString(filtros) {
  const params = new URLSearchParams();
  
  Object.entries(filtros).forEach(([chave, valor]) => {
    if (valor !== null && valor !== undefined && valor !== '') {
      if (Array.isArray(valor)) {
        valor.forEach(v => params.append(chave, v));
      } else {
        params.append(chave, valor);
      }
    }
  });
  
  return params.toString();
}

// Uso
const filtros = {
  estado: 'SP',
  especialidade_id: 1,
  ativo: true,
  pagina: 1,
  limite: 20
};

const query = construirQueryString(filtros);
const url = `http://localhost:3000/api/v1/correspondentes?${query}`;
```

---

## ⏱️ LIMITAÇÃO DE TAXA

### Implementar Retry com Backoff Exponencial

```javascript
async function requisicaoComRetry(url, opcoes, maxTentativas = 3) {
  for (let tentativa = 0; tentativa < maxTentativas; tentativa++) {
    try {
      const response = await fetch(url, opcoes);
      
      if (response.status === 429) {
        // Too Many Requests - aguardar
        const delay = Math.pow(2, tentativa) * 1000; // 1s, 2s, 4s
        console.log(`Limite excedido. Aguardando ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      if (response.ok) {
        return await response.json();
      }
      
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (tentativa === maxTentativas - 1) throw error;
      
      const delay = Math.pow(2, tentativa) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

---

## 📱 UPLOAD DE ARQUIVOS

### Upload com Progress

```javascript
async function uploadComprovante(pagamentoId, arquivo, token, onProgress) {
  const formData = new FormData();
  formData.append('comprovante', arquivo);

  const xhr = new XMLHttpRequest();

  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const percentualComplete = (e.loaded / e.total) * 100;
      onProgress(percentualComplete);
    }
  });

  return new Promise((resolve, reject) => {
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`HTTP ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', reject);

    xhr.open('POST', 
      `http://localhost:3000/api/v1/pagamentos/${pagamentoId}/upload-comprovante`
    );
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);
  });
}

// Uso
const arquivo = document.getElementById('fileInput').files[0];
uploadComprovante(pagamentoId, arquivo, token, (progresso) => {
  console.log(`Upload: ${progresso.toFixed(2)}%`);
});
```

---

## 🔗 INTEGRAÇÃO COM FRONTEND

### Class de Cliente HTTP

```javascript
class APIClient {
  constructor(baseUrl, token = null) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  setToken(token) {
    this.token = token;
  }

  async request(metodo, rota, body = null, opcoes = {}) {
    const url = `${this.baseUrl}${rota}`;
    const headers = {
      'Content-Type': 'application/json',
      ...opcoes.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const opcoesFetch = {
      method: metodo,
      headers,
      ...opcoes
    };

    if (body) {
      opcoesFetch.body = JSON.stringify(body);
    }

    const response = await fetch(url, opcoesFetch);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.erro?.mensagem || 'Erro na requisição');
    }

    return data;
  }

  get(rota, opcoes = {}) {
    return this.request('GET', rota, null, opcoes);
  }

  post(rota, body, opcoes = {}) {
    return this.request('POST', rota, body, opcoes);
  }

  put(rota, body, opcoes = {}) {
    return this.request('PUT', rota, body, opcoes);
  }

  patch(rota, body, opcoes = {}) {
    return this.request('PATCH', rota, body, opcoes);
  }

  delete(rota, opcoes = {}) {
    return this.request('DELETE', rota, null, opcoes);
  }
}

// Uso
const api = new APIClient('http://localhost:3000/api/v1');

// Login
const loginData = await api.post('/auth/login', {
  email: 'usuario@jurisconnect.com',
  senha: 'SenhaForte123!'
});

api.setToken(loginData.dados.token);

// Usar após login
const demandas = await api.get('/demandas?status=aberta');
const demanda = await api.post('/demandas', {
  cliente_id: 1,
  especialidade_id: 1,
  titulo: 'Nova Demanda'
});
```

---

## 🧪 TESTES COM POSTMAN

### Importar Collection

```json
{
  "info": {
    "name": "JurisConnect API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\"email\": \"usuario@jurisconnect.com\", \"senha\": \"SenhaForte123!\"}"
            }
          }
        }
      ]
    }
  ]
}
```

### Variáveis Postman

```
base_url: http://localhost:3000/api/v1
token: [copiar do response de login]
```

---

## 📖 DOCUMENTAÇÃO ADICIONAL

- **Swagger/OpenAPI:** `http://localhost:3000/api/docs`
- **Postman Collection:** Disponível no repositório
- **Exemplos Código:** `/examples/` no repositório

---

**Guia Prático v1.0 - Pronto para Uso** ✅