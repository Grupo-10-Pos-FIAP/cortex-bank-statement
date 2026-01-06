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
  const balance = transactions.reduce((acc, tx) => acc + tx.value, 0);
  return { value: balance, yieldPercentage: 3 };
}

function handleAuth(req) {
  const authHeader = req.headers["authorization"];
  if (authHeader?.startsWith("Bearer ")) {
    req.token = authHeader.split(" ")[1];
  }
}

function handleSimulatedError(req, res, simulateError) {
  if (simulateError === "500") {
    return res.status(500).json({
      message: "Erro interno do servidor (simulado para testes)",
      error: "Internal Server Error",
    });
  }
  if (simulateError === "timeout") {
    return new Promise(() => undefined);
  }
  return null;
}

function handleAccountEndpoint(req, res) {
  const db = getDb();
  const account = db.accounts[0];
  return res.json({
    message: "Conta encontrada carregado com sucesso",
    result: {
      account: [account],
      // Removido transactions e cards - não são utilizados
    },
  });
}

function filterTransactionsByDate(transactions, startDate, endDate) {
  if (!startDate && !endDate) return transactions;

  let start = startDate ? new Date(startDate) : null;
  let end = endDate ? new Date(endDate) : null;

  if (start && end && start > end) [start, end] = [end, start];

  const startTimestamp = start
    ? new Date(
        Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate(), 0, 0, 0, 0)
      ).getTime()
    : null;
  const endTimestamp = end
    ? new Date(
        Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate(), 23, 59, 59, 999)
      ).getTime()
    : null;

  return transactions.filter((t) => {
    const txTimestamp = new Date(t.date).getTime();
    return (
      (!startTimestamp || txTimestamp >= startTimestamp) &&
      (!endTimestamp || txTimestamp <= endTimestamp)
    );
  });
}

function handleBalanceEndpoint(req, res) {
  const errorResponse = handleSimulatedError(req, res, req.query.simulateError);
  if (errorResponse) return errorResponse;

  const db = getDb();
  const accountId = req.path.split("/")[2];
  const transactions = db.transactions.filter((t) => t.accountId === accountId);

  return res.json({
    message: "Saldo encontrado com sucesso",
    result: { balance: calculateBalance(transactions) },
  });
}

function handleStatementEndpoint(req, res) {
  const errorResponse = handleSimulatedError(req, res, req.query.simulateError);
  if (errorResponse) return errorResponse;

  const db = getDb();
  const accountId = req.path.split("/")[2];
  let transactions = db.transactions.filter((t) => t.accountId === accountId);

  // Filtrar por data
  transactions = filterTransactionsByDate(transactions, req.query.startDate, req.query.endDate);

  // Ordenar por data (mais recente primeiro)
  transactions.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Paginação
  const page = parseInt(req.query.page || "1", 10);
  const pageSize = parseInt(req.query.pageSize || "25", 10);
  const total = transactions.length;
  const totalPages = Math.ceil(total / pageSize);

  // Calcular índices para paginação
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTransactions = transactions.slice(startIndex, endIndex);

  return res.json({
    message: "Transação criada com sucesso",
    result: {
      transactions: paginatedTransactions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    },
  });
}

function middleware(req, res, next) {
  if (req.path.startsWith("/account")) {
    handleAuth(req);
  }

  if (req.method !== "GET") return next();

  if (req.path === "/account") return handleAccountEndpoint(req, res);
  if (req.path.match(/^\/account\/[^/]+\/balance/)) return handleBalanceEndpoint(req, res);
  if (req.path.match(/^\/account\/[^/]+\/statement/)) return handleStatementEndpoint(req, res);

  next();
}

export default middleware;
