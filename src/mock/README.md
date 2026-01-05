# Mock Server - JSON Server

Este diretório contém a configuração do mock server usando JSON Server v0.17.4 para desenvolvimento local.

## Estrutura

- `db.json`: Banco de dados mock com contas, transações e cartões
- `routes.json`: Configuração de rotas do JSON Server
- `middleware.js`: Middleware customizado para simular comportamento do backend real
- `test-server.js`: Servidor JSON Server configurado
- `generate-transactions.js`: Script para gerar transações mock

## Como usar

### Iniciar o mock server

```bash
npm run mock:server
```

### Iniciar frontend com mock server

```bash
npm run start:mock
```

Este comando inicia tanto o mock server quanto o frontend em modo standalone.

## Endpoints disponíveis

### GET /account

Retorna a conta do usuário com transações e cartões.

**Resposta:**

```json
{
  "message": "Conta encontrada carregado com sucesso",
  "result": {
    "account": [{ "id": "acc-001", "type": "Debit" }],
    "transactions": [...],
    "cards": []
  }
}
```

### GET /account/:accountId/balance

Retorna o saldo da conta calculado a partir das transações.

**Resposta:**

```json
{
  "message": "Saldo encontrado com sucesso",
  "result": {
    "balance": {
      "value": 12345.67,
      "yieldPercentage": 3
    }
  }
}
```

### GET /account/:accountId/statement

Retorna o extrato de transações de uma conta.

**Query Parameters:**

- `startDate` (opcional): Data inicial no formato ISO (ex: `2025-12-01T00:00:00.000Z`)
- `endDate` (opcional): Data final no formato ISO (ex: `2025-12-31T23:59:59.999Z`)

**Resposta:**

```json
{
  "message": "Transação criada com sucesso",
  "result": {
    "transactions": [...]
  }
}
```

## Autenticação

O mock server simula autenticação mas **não bloqueia requisições** em modo desenvolvimento. Em produção, o backend real valida tokens JWT.

Para testar com autenticação:

1. Defina um token no `localStorage`: `localStorage.setItem('authToken', 'seu-token-aqui')`
2. O `apiClient` automaticamente incluirá o token no header `Authorization: Bearer <token>`

## Gerar novos dados

Para gerar novas transações mock:

```bash
node src/mock/generate-transactions.js
```

Isso irá gerar transações do período de setembro de 2025 até a data atual.

## Alternando entre Mock e Backend Real

### Usar Mock Server

```bash
# Certifique-se de que o backend real não está rodando na porta 8080
npm run start:mock
```

### Usar Backend Real

```bash
# Inicie o backend real na porta 8080
cd ../backend
npm run dev

# Em outro terminal, inicie o frontend
cd statement
npm run start:standalone
```

O `apiClient` automaticamente detecta o token do `localStorage` e envia nas requisições quando disponível.

## Configuração

A URL da API é configurada através da variável de ambiente `API_BASE_URL`:

```bash
# .env ou variável de ambiente
API_BASE_URL=http://localhost:8080
```

Por padrão, usa `http://localhost:8080`.
