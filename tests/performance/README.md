# 📊 Guia de Testes de Performance - JurisConnect

## 🎯 Visão Geral

Este guia detalha os testes de performance criados para o JurisConnect usando **k6**, uma ferramenta moderna de testes de carga.

## 📋 Tipos de Testes

| Teste | Arquivo | Objetivo | Duração |
|-------|---------|----------|---------|
| **Load Test** | `load-test.js` | Validar comportamento sob carga normal | ~15 min |
| **Stress Test** | `stress-test.js` | Encontrar limite do sistema | ~35 min |
| **Spike Test** | `spike-test.js` | Testar recuperação após pico súbito | ~8 min |
| **Soak Test** | `soak-test.js` | Detectar vazamentos de memória | ~2h 10min |
| **Breakpoint Test** | `breakpoint-test.js` | Encontrar ponto de quebra | ~27 min |
| **Write Test** | `write-test.js` | Testar operações de escrita | ~5 min |

## ⚙️ Instalação do k6

### Windows

```powershell
# Via Chocolatey
choco install k6

# Ou via Scoop
scoop install k6

# Ou baixar instalador
# https://github.com/grafana/k6/releases
```

### Verificar instalação

```bash
k6 version
```

## 🚀 Executar Testes

### 1. Load Test (Teste de Carga Normal)

Simula 100-150 usuários simultâneos em cenários realistas.

```bash
cd tests/performance
k6 run load-test.js
```

**Cenários testados:**
- Login de usuários
- Busca de dashboard (KPIs)
- Listagem de demandas
- Listagem de clientes
- Consulta financeira
- Health check

**Thresholds:**
- 95% das requisições < 500ms
- 99% das requisições < 1000ms
- Taxa de erro < 1%
- Taxa de sucesso no login > 99%

### 2. Stress Test (Teste de Estresse)

Aumenta carga gradualmente até 500 usuários para encontrar o limite.

```bash
k6 run stress-test.js
```

**Estágios:**
- 100 → 200 → 300 → 400 → 500 usuários
- Mantém 500 usuários por 10 minutos

**Thresholds:**
- 99% das requisições < 3s
- Taxa de falhas < 5%

### 3. Spike Test (Teste de Pico)

Testa recuperação após pico súbito de 500 usuários.

```bash
k6 run spike-test.js
```

**Cenário:**
- 10 usuários → **SPIKE para 500** → volta para 10

**Objetivo:** Validar que o sistema se recupera após pico.

### 4. Soak Test (Teste de Resistência)

Mantém 50 usuários por 2 horas para detectar vazamentos de memória.

```bash
k6 run soak-test.js
```

**Importante:** Execute em ambiente de staging/produção.

**Monitore:**
- Uso de memória (deve permanecer estável)
- Tempo de resposta (não deve degradar)
- Conexões de banco (não deve vazar)

### 5. Breakpoint Test (Teste de Ponto de Quebra)

Aumenta taxa de requisições até o sistema falhar.

```bash
k6 run breakpoint-test.js
```

**Estágios:**
- 50 req/s → 100 → 200 → 300 → 400 → 500 req/s

**Objetivo:** Descobrir capacidade máxima do sistema.

### 6. Write Test (Teste de Escrita)

Testa operações de CRUD (Create, Read, Update, Delete).

```bash
k6 run write-test.js
```

**Operações:**
- Criar demanda
- Atualizar demanda
- Buscar demanda
- Deletar demanda

## 📊 Interpretar Resultados

### Métricas Principais

```
checks.........................: 99.50% ✓ 1990      ✗ 10
data_received..................: 1.2 MB 40 kB/s
data_sent......................: 500 kB 17 kB/s
http_req_blocked...............: avg=1.2ms    min=0s    med=0s    max=100ms  p(90)=0s    p(95)=0s
http_req_connecting............: avg=500µs    min=0s    med=0s    max=50ms   p(90)=0s    p(95)=0s
http_req_duration..............: avg=250ms    min=50ms  med=200ms max=2s     p(90)=400ms p(95)=500ms
  { expected_response:true }...: avg=250ms    min=50ms  med=200ms max=2s     p(90)=400ms p(95)=500ms
http_req_failed................: 0.50%  ✓ 10        ✗ 1990
http_req_receiving.............: avg=1ms      min=0s    med=500µs max=50ms   p(90)=2ms   p(95)=5ms
http_req_sending...............: avg=500µs    min=0s    med=0s    max=10ms   p(90)=1ms   p(95)=2ms
http_req_tls_handshaking.......: avg=0s       min=0s    med=0s    max=0s     p(90)=0s    p(95)=0s
http_req_waiting...............: avg=248.5ms  min=50ms  med=199ms max=1.95s  p(90)=398ms p(95)=498ms
http_reqs......................: 2000   66.66/s
iteration_duration.............: avg=15s      min=10s   med=14s   max=30s    p(90)=20s   p(95)=25s
iterations.....................: 200    6.66/s
vus............................: 100    min=10      max=150
vus_max........................: 150    min=150     max=150
```

### O que observar

✅ **Bom:**
- `http_req_duration` p(95) < 500ms
- `http_req_failed` < 1%
- `checks` > 99%

⚠️ **Atenção:**
- `http_req_duration` p(95) > 1s
- `http_req_failed` > 5%
- `checks` < 95%

❌ **Crítico:**
- `http_req_duration` p(95) > 3s
- `http_req_failed` > 10%
- `checks` < 90%

## 🎨 Visualização com Grafana

### 1. Executar com output para InfluxDB

```bash
k6 run --out influxdb=http://localhost:8086/k6 load-test.js
```

### 2. Executar com k6 Cloud

```bash
k6 login cloud
k6 run --out cloud load-test.js
```

### 3. Gerar relatório HTML

```bash
k6 run --out json=results.json load-test.js
k6-reporter results.json --output report.html
```

## 🔧 Configuração Avançada

### Variáveis de Ambiente

```bash
# Alterar URL base
k6 run -e BASE_URL=https://staging.jurisconnect.com load-test.js

# Alterar número de VUs
k6 run --vus 200 --duration 5m load-test.js

# Executar em modo quiet
k6 run --quiet load-test.js
```

### Thresholds Customizados

```javascript
export const options = {
  thresholds: {
    // Falhar se P95 > 500ms
    'http_req_duration{type:api}': ['p(95)<500'],
    
    // Falhar se taxa de erro > 1%
    'http_req_failed': ['rate<0.01'],
    
    // Falhar se menos de 95% dos checks passarem
    'checks': ['rate>0.95'],
  },
};
```

## 📈 Benchmarks Esperados

### Hardware de Referência
- **CPU**: 4 cores
- **RAM**: 8 GB
- **Banco**: PostgreSQL 15 (mesma máquina)

### Resultados Esperados

| Métrica | Valor Esperado |
|---------|----------------|
| Throughput | 100-200 req/s |
| Latência P95 | < 500ms |
| Latência P99 | < 1000ms |
| Taxa de erro | < 1% |
| Usuários simultâneos | 100-150 |

## 🐛 Troubleshooting

### Erro: "connection refused"

```bash
# Verificar se backend está rodando
curl http://localhost:3000/api/v1/health
```

### Erro: "too many open files"

```bash
# Linux/Mac - aumentar limite
ulimit -n 10000

# Windows - não aplicável
```

### Performance ruim

1. **Verificar banco de dados:**
   ```sql
   -- Ver queries lentas
   SELECT * FROM pg_stat_statements 
   ORDER BY mean_exec_time DESC LIMIT 10;
   ```

2. **Verificar índices:**
   ```sql
   -- Ver tabelas sem índices
   SELECT tablename FROM pg_tables 
   WHERE schemaname = 'public';
   ```

3. **Verificar conexões:**
   ```sql
   -- Ver conexões ativas
   SELECT count(*) FROM pg_stat_activity;
   ```

## 📝 Checklist de Performance

Antes de deploy em produção:

- [ ] Load test passa com sucesso
- [ ] Stress test identifica limite do sistema
- [ ] Spike test valida recuperação
- [ ] Soak test não mostra vazamentos (2h)
- [ ] P95 < 500ms em todos os endpoints
- [ ] Taxa de erro < 1%
- [ ] Banco de dados otimizado (índices, queries)
- [ ] Connection pooling configurado
- [ ] Logs de performance habilitados
- [ ] Monitoramento configurado (Grafana/Prometheus)

## 🚀 CI/CD Integration

### GitHub Actions

```yaml
name: Performance Tests

on:
  schedule:
    - cron: '0 2 * * *'  # Diariamente às 2h
  workflow_dispatch:

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install k6
        run: |
          sudo gpg -k
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
      
      - name: Run load test
        run: |
          cd tests/performance
          k6 run --out json=results.json load-test.js
      
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: performance-results
          path: tests/performance/results.json
```

## 📚 Recursos Adicionais

- [Documentação k6](https://k6.io/docs/)
- [k6 Examples](https://github.com/grafana/k6-examples)
- [Best Practices](https://k6.io/docs/testing-guides/test-types/)

---

**Última atualização**: 2025-11-25  
**Versão**: 1.0.0
