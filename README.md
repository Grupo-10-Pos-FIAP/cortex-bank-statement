# Cortex Bank - Statement Microfrontend

Microfrontend de extrato bancário desenvolvido como parte do projeto Cortex Bank para a pós-graduação em Engenharia de Software Frontend.

## 📋 Sobre o Projeto

Este é um microfrontend responsável pelo módulo de extrato bancário do sistema Cortex Bank. A aplicação permite visualizar transações financeiras com sistema avançado de filtros, busca textual, paginação client-side e performance otimizada para grandes volumes de dados.

## 🏗️ Arquitetura

A aplicação foi desenvolvida utilizando a arquitetura de **microfrontends** com **Single-SPA**, permitindo:

- **Desenvolvimento independente**: Cada microfrontend pode ser desenvolvido e deployado separadamente
- **Integração flexível**: Pode ser executado de forma standalone ou integrado ao shell principal
- **Reutilização de componentes**: Utiliza o Design System compartilhado `@grupo10-pos-fiap/design-system`
- **Código Limpo**: Projeto refatorado seguindo princípios de Clean Code, SOLID e KISS

## 🚀 Tecnologias

- **React 19.2.0** - Biblioteca para construção da interface
- **TypeScript 4.3.5** - Tipagem estática
- **Single-SPA 5.9.3** - Framework para microfrontends
- **Webpack 5.89.0** - Bundler e build tool
- **@tanstack/react-query 5.90.16** - Gerenciamento de estado servidor e cache
- **@tanstack/react-virtual 3.13.13** - Virtualização de listas para performance
- **use-debounce 10.0.6** - Debounce de valores em buscas e filtros
- **react-intersection-observer 10.0.0** - Scroll infinito
- **ESLint + Prettier** - Linting e formatação de código
- **Husky** - Git hooks para qualidade de código

## 📦 Estrutura do Projeto

```
statement/
├── src/
│   ├── api/              # Camada de comunicação com API
│   ├── app/              # Componente raiz e configuração
│   ├── components/       # Componentes React reutilizáveis
│   │   ├── DateRangePicker/  # Seletor de período de datas
│   │   ├── Filters.tsx       # Componente de filtros
│   │   ├── Search.tsx       # Campo de busca
│   │   ├── StatementHeader.tsx  # Header com saldo
│   │   ├── TransactionList.tsx  # Lista de transações
│   │   └── TransactionItem.tsx   # Item individual de transação
│   ├── config/           # Configurações (API, transações)
│   ├── constants/         # Constantes da aplicação
│   ├── hooks/            # Custom hooks
│   │   ├── queries/      # Hooks de queries (React Query)
│   │   ├── useStatementQuery.ts
│   │   ├── useStatementFilters.ts
│   │   ├── useSearch.ts
│   │   └── useInfiniteScrollTrigger.ts
│   ├── types/            # Definições TypeScript
│   ├── utils/            # Funções utilitárias
│   └── styles/           # Estilos globais
├── mock/                 # Mock server (JSON Server)
├── .github/              # Workflows CI/CD
├── webpack.config.js     # Configuração do Webpack
└── package.json          # Dependências e scripts
```

## 🎯 Funcionalidades

### Extrato Bancário

- ✅ **Visualização de transações**: Lista completa de transações com informações detalhadas
- ✅ **Card de saldo**: Exibição do saldo atual com toggle de visibilidade e cálculo de rendimento
- ✅ **Ordenação automática**: Transações ordenadas por data (mais recentes primeiro)
- ✅ **Estados de UI**: Loading, erro e vazio bem tratados

### Sistema de Filtros

- ✅ **Busca textual**: Busca em tempo real em nome, ID, valor e destinatário/remetente (debounce de 300ms)
- ✅ **Filtro por tipo**: Filtrar por Crédito, Débito ou Todas as transações
- ✅ **Faixa de valores**: Filtrar por valor mínimo e máximo com validação automática e máscara de moeda
- ✅ **Período de datas**: Seletor de data com presets (Últimos 7, 15, 30 ou 90 dias) e seleção manual
- ✅ **Limite de 90 dias**: Validação automática para garantir busca apenas nos últimos 90 dias
- ✅ **Indicador de filtros ativos**: Badge visual mostrando quantos filtros estão aplicados
- ✅ **Limpar filtros**: Botão para resetar todos os filtros de uma vez

### Performance

- ✅ **Paginação client-side**: Scroll infinito com paginação automática (25 itens por página)
- ✅ **Virtualização automática**: Renderização otimizada que mostra apenas itens visíveis para listas grandes (> 50 itens)
- ✅ **Cache inteligente**: React Query com cache de 5 minutos para reduzir requisições à API
- ✅ **Memoização**: Componentes memoizados com React.memo, useMemo e useCallback
- ✅ **Retry automático**: 3 tentativas com exponential backoff para resiliência

### Integração

- 🔗 **Single-SPA**: Integração com shell principal
- 🔗 **Design System**: Componentes visuais padronizados
- 🔗 **API REST**: Comunicação com backend
- 🔗 **LocalStorage**: Persistência de dados do usuário (accountId, token)
- 🔗 **Mock Server**: Servidor JSON Server para desenvolvimento local

## 🛠️ Instalação

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

### Passos

1. Clone o repositório:

```bash
git clone <repository-url>
cd statement
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente (opcional):

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
API_BASE_URL=http://localhost:8080
USE_MOCK=false
MOCK_API_BASE_URL=http://localhost:8080
```

## 🚀 Executando a Aplicação

### Modo Standalone (Desenvolvimento)

Executa a aplicação de forma independente, útil para desenvolvimento:

```bash
npm run start:standalone
```

A aplicação estará disponível em `http://localhost:4040`

### Modo Integrado (Microfrontend)

Executa a aplicação configurada para integração com Single-SPA:

```bash
npm start
```

A aplicação estará disponível em `http://localhost:3004`

### Modo Mock (Recomendado para Desenvolvimento)

Executa mock server + frontend, útil para desenvolvimento sem backend:

```bash
npm run start:mock
```

Isso inicia:

- Mock server (JSON Server) na porta 8080
- Frontend na porta 3004

**Vantagens:**

- ✅ Não precisa do backend real rodando
- ✅ Dados mock consistentes para desenvolvimento
- ✅ Desenvolvimento mais rápido

### Modo Standalone com Backend Local

Executa em modo standalone apontando para backend local:

```bash
npm run start:backend
```

## 📝 Scripts Disponíveis

| Script                     | Descrição                                                               |
| -------------------------- | ----------------------------------------------------------------------- |
| `npm start`                | Inicia o servidor de desenvolvimento (modo microfrontend) na porta 3004 |
| `npm run start:standalone` | Inicia em modo standalone na porta 4040                                 |
| `npm run start:mock`       | Inicia mock server + frontend (recomendado para desenvolvimento)        |
| `npm run start:backend`    | Inicia standalone com backend local                                     |
| `npm run build`            | Gera build de produção                                                  |
| `npm run build:webpack`    | Build apenas do webpack                                                 |
| `npm run build:types`      | Gera arquivos de tipos TypeScript                                       |
| `npm run lint`             | Executa o linter                                                        |
| `npm run lint:fix`         | Corrige erros de lint automaticamente                                   |
| `npm run format`           | Formata o código com Prettier                                           |
| `npm run check-format`     | Verifica formatação sem alterar arquivos                                |
| `npm run analyze`          | Analisa o bundle gerado                                                 |

## 🏗️ Build de Produção

Para gerar o build de produção:

```bash
npm run build
```

Os arquivos serão gerados no diretório `dist/`.

## 🔧 Configuração

### Variáveis de Ambiente

| Variável            | Descrição                | Padrão                  |
| ------------------- | ------------------------ | ----------------------- |
| `API_BASE_URL`      | URL base da API backend  | `http://localhost:8080` |
| `USE_MOCK`          | Habilita uso de API mock | `false`                 |
| `MOCK_API_BASE_URL` | URL da API mock          | `http://localhost:8080` |

### Porta

A aplicação roda na porta **3004** por padrão (modo microfrontend) ou **4040** (modo standalone). Para alterar, edite `webpack.config.js`.

### Autenticação

A aplicação utiliza autenticação via Bearer token (JWT) quando conectada ao backend real:

- O token deve estar armazenado no `localStorage` com a chave `'token'`
- O token é automaticamente incluído no header `Authorization: Bearer {token}` em todas as requisições
- **Mock Server**: Não requer autenticação (permite todas as requisições em modo desenvolvimento)

## 📚 Estrutura de Componentes

### Componentes Principais

- **`Statement`**: Componente principal que gerencia o fluxo do extrato
- **`StatementHeader`**: Header com card de saldo e toggle de visibilidade
- **`TransactionList`**: Lista virtualizada de transações com scroll infinito
- **`TransactionItem`**: Item individual de transação
- **`Filters`**: Componente de filtros (tipo, valor, data)
- **`Search`**: Campo de busca textual
- **`DateRangePicker`**: Seletor de período de datas com presets
- **`ErrorMessage`**: Componente de exibição de erros

### Hooks Customizados

- **`useStatementQuery`**: Gerencia busca, filtros e paginação de transações
- **`useTransactionsQuery`**: Hook de query React Query para buscar transações
- **`useStatementFilters`**: Gerencia estado e lógica de filtros
- **`useSearch`**: Gerencia busca textual com debounce
- **`useInfiniteScrollTrigger`**: Trigger para scroll infinito

## 🔌 Integração com Single-SPA

A aplicação está configurada para ser registrada no Single-SPA:

```javascript
// No shell principal
import { registerApplication } from "single-spa";

registerApplication({
  name: "@cortex-bank/statement",
  app: () => System.import("@cortex-bank/statement"),
  activeWhen: ["/statement"],
});
```

## 📡 API

A aplicação consome os seguintes endpoints:

- `GET /account` - Buscar conta do usuário
- `GET /account/{accountId}/statement` - Buscar extrato completo

**Limitações do Backend:**

- ❌ **Não suporta paginação server-side**: O backend retorna todas as transações de uma vez. A paginação é implementada client-side.
- ❌ **Não suporta filtros de data server-side**: Os parâmetros `startDate` e `endDate` não são processados pelo backend. Os filtros de data são aplicados client-side.
- ❌ **Não possui endpoint dedicado para balance**: O balance é calculado localmente no frontend a partir das transações retornadas.
- ⚠️ **Status code incorreto**: O backend retorna `201` (Created) em vez de `200` (OK) para GET statement (problema conhecido do backend).

## 🎨 Design System

A aplicação utiliza o Design System `@grupo10-pos-fiap/design-system`, que fornece:

- Componentes padronizados (Card, Button, Text, Loading, etc.)
- Tokens de design (cores, espaçamentos, tipografia)
- Consistência visual entre microfrontends

## 🔒 Qualidade de Código

O projeto utiliza:

- **ESLint**: Para análise estática de código
- **Prettier**: Para formatação consistente
- **Husky**: Git hooks para garantir qualidade antes do commit
- **TypeScript**: Tipagem estática para maior segurança
- **Clean Code, SOLID, KISS**: Princípios aplicados na arquitetura

## 🚢 Deploy

O projeto está configurado para deploy no Vercel. O workflow de CI/CD está em `.github/workflows/vercel-deploy-check.yml`.

### Deploy Manual

```bash
# Build de produção
npm run build

# Deploy (se configurado)
vercel --prod
```

## 📄 Licença

Este projeto foi desenvolvido como parte de uma pós-graduação em Engenharia de Software Frontend.

---
