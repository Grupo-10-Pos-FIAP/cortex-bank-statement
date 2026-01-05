import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getDb() {
  const dbPath = path.join(__dirname, "db.json");
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

function calculateBalance(transactions) {
  const balance = transactions.reduce((acc, transaction) => {
    if (transaction.type === "Credit") {
      return acc + transaction.value;
    } else {
      return acc - Math.abs(transaction.value);
    }
  }, 0);

  // Calcula rendimento (simplificado - 3% fixo por enquanto)
  const yieldPercentage = 3;

  return {
    value: balance,
    yieldPercentage,
  };
}

function isProtectedRoute(req) {
  const protectedRoutes = [
    "/account",
    "/account/:accountId/statement",
    "/account/:accountId/balance",
  ];
  return protectedRoutes.some((route) => {
    if (route.includes(":accountId")) {
      return req.path.match(/^\/account\/[^/]+\/(statement|balance)/);
    }
    return req.path === route;
  });
}

function handleAuth(req) {
  const authHeader = req.headers["authorization"];

  if (authHeader) {
    const [scheme, token] = authHeader.split(" ");

    if (scheme === "Bearer" && token) {
      console.log(`[Mock Auth] Token encontrado: ${token.substring(0, 10)}... - acesso permitido`);
      req.token = token;
    } else {
      console.log("[Mock Auth] Formato de token inválido - mas permitindo acesso (modo dev)");
    }
  } else {
    console.log("[Mock Auth] Token não encontrado - mas permitindo acesso (modo dev)");
  }

  console.log("[Mock Auth] Modo desenvolvimento: todas as requisições são permitidas");
}

function handleSimulatedError(req, res, simulateError) {
  if (simulateError === "500") {
    return res.status(500).json({
      message: "Erro interno do servidor (simulado para testes)",
      error: "Internal Server Error",
    });
  }

  if (simulateError === "timeout") {
    // Simula timeout não retornando resposta (o cliente vai timeoutar)
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return new Promise(() => {
      // Nunca resolve - intencional para simular timeout
    });
  }

  return null;
}

function handleAccountEndpoint(req, res) {
  const db = getDb();
  const account = db.accounts[0];
  const transactions = db.transactions.filter((t) => t.accountId === account.id);
  const cards = db.cards || [];

  return res.json({
    message: "Conta encontrada carregado com sucesso",
    result: {
      account: [account],
      transactions,
      cards,
    },
  });
}

function filterTransactionsByDate(transactions, startDate, endDate) {
  if (!startDate && !endDate) {
    return transactions;
  }

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  return transactions.filter((t) => {
    const txDate = new Date(t.date);
    if (start && txDate < start) {
      return false;
    }
    if (end) {
      const endOfDay = new Date(end);
      endOfDay.setHours(23, 59, 59, 999);
      if (txDate > endOfDay) {
        return false;
      }
    }
    return true;
  });
}

function handleBalanceEndpoint(req, res) {
  const simulateError = req.query.simulateError;
  const errorResponse = handleSimulatedError(req, res, simulateError);
  if (errorResponse) {
    return errorResponse;
  }

  const db = getDb();
  const accountId = req.path.split("/")[2];
  const transactions = db.transactions.filter((t) => t.accountId === accountId);
  const balance = calculateBalance(transactions);

  return res.json({
    message: "Saldo encontrado com sucesso",
    result: {
      balance,
    },
  });
}

function handleStatementEndpoint(req, res) {
  const simulateError = req.query.simulateError;
  const errorResponse = handleSimulatedError(req, res, simulateError);
  if (errorResponse) {
    return errorResponse;
  }

  const db = getDb();
  const accountId = req.path.split("/")[2];
  let transactions = db.transactions.filter((t) => t.accountId === accountId);

  transactions = filterTransactionsByDate(transactions, req.query.startDate, req.query.endDate);

  return res.json({
    message: "Transação criada com sucesso",
    result: {
      transactions,
    },
  });
}

function middleware(req, res, next) {
  if (isProtectedRoute(req)) {
    handleAuth(req);
  }

  if (req.path === "/account" && req.method === "GET") {
    return handleAccountEndpoint(req, res);
  }

  if (req.path.match(/^\/account\/[^/]+\/balance/) && req.method === "GET") {
    return handleBalanceEndpoint(req, res);
  }

  if (req.path.match(/^\/account\/[^/]+\/statement/) && req.method === "GET") {
    return handleStatementEndpoint(req, res);
  }

  next();
}

export default middleware;
