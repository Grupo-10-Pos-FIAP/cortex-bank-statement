import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getDb() {
  try {
    const dbPath = path.join(__dirname, "db.json");
    if (!fs.existsSync(dbPath)) {
      throw new Error(`Arquivo db.json não encontrado em ${dbPath}`);
    }
    return JSON.parse(fs.readFileSync(dbPath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`Arquivo db.json não encontrado: ${error.message}`);
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Erro ao parsear db.json: ${error.message}`);
    }
    throw error;
  }
}

function calculateBalance(transactions) {
  const balance = transactions.reduce((acc, tx) => acc + tx.value, 0);
  return { value: balance, yieldPercentage: 3 };
}

function handleAuth(req) {
  const authHeader = req.headers["authorization"];
  if (authHeader?.startsWith("Bearer ")) {
    req.token = authHeader.split(" ")[1];
    if (!req.token || req.token.trim() === "") {
      req.token = null;
    }
  }
  return req.token !== null && req.token !== undefined;
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
  try {
    const db = getDb();

    if (!db.accounts || db.accounts.length === 0) {
      return res.status(404).json({
        message: "Nenhuma conta encontrada",
        error: "Not Found",
      });
    }

    const account = db.accounts[0];

    if (!account) {
      return res.status(404).json({
        message: "Conta não encontrada",
        error: "Not Found",
      });
    }

    return res.json({
      message: "Conta encontrada e carregada com sucesso",
      result: {
        account: [account],
        // Removido transactions e cards - não são utilizados
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar conta",
      error: error.message || "Internal Server Error",
    });
  }
}

function filterTransactionsByDate(transactions, startDate, endDate) {
  if (!startDate && !endDate) return transactions;

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

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
    const txDate = new Date(t.date);
    const txDateStart = new Date(
      Date.UTC(txDate.getUTCFullYear(), txDate.getUTCMonth(), txDate.getUTCDate(), 0, 0, 0, 0)
    ).getTime();
    const txDateEnd = new Date(
      Date.UTC(txDate.getUTCFullYear(), txDate.getUTCMonth(), txDate.getUTCDate(), 23, 59, 59, 999)
    ).getTime();

    if (startTimestamp !== null && endTimestamp !== null) {
      return txDateStart >= startTimestamp && txDateStart <= endTimestamp;
    }

    if (startTimestamp !== null && endTimestamp === null) {
      return txDateStart >= startTimestamp;
    }

    if (startTimestamp === null && endTimestamp !== null) {
      return txDateEnd <= endTimestamp;
    }

    return true;
  });
}

function handleBalanceEndpoint(req, res) {
  const errorResponse = handleSimulatedError(req, res, req.query.simulateError);
  if (errorResponse) return errorResponse;

  try {
    const db = getDb();
    const accountId = req.path.split("/")[2];

    if (!accountId) {
      return res.status(400).json({
        message: "ID da conta é obrigatório",
        error: "Bad Request",
      });
    }

    const account = db.accounts?.find((acc) => acc.id === accountId);
    if (!account) {
      return res.status(404).json({
        message: `Conta com ID ${accountId} não encontrada`,
        error: "Not Found",
      });
    }

    const transactions = db.transactions?.filter((t) => t.accountId === accountId) || [];

    return res.json({
      message: "Saldo encontrado com sucesso",
      result: { balance: calculateBalance(transactions) },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao calcular saldo",
      error: error.message || "Internal Server Error",
    });
  }
}

function handleStatementEndpoint(req, res) {
  const errorResponse = handleSimulatedError(req, res, req.query.simulateError);
  if (errorResponse) return errorResponse;

  try {
    const db = getDb();
    const accountId = req.path.split("/")[2];

    if (!accountId) {
      return res.status(400).json({
        message: "ID da conta é obrigatório",
        error: "Bad Request",
      });
    }

    const account = db.accounts?.find((acc) => acc.id === accountId);
    if (!account) {
      return res.status(404).json({
        message: `Conta com ID ${accountId} não encontrada`,
        error: "Not Found",
      });
    }

    let transactions = (db.transactions || []).filter((t) => t.accountId === accountId);

    transactions = filterTransactionsByDate(transactions, req.query.startDate, req.query.endDate);

    transactions.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const pageSize = Math.max(1, Math.min(100, parseInt(req.query.pageSize || "25", 10)));
    const total = transactions.length;
    const totalPages = Math.ceil(total / pageSize);

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedTransactions = transactions.slice(startIndex, endIndex);

    return res.json({
      message: "Transações encontradas com sucesso",
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
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar extrato",
      error: error.message || "Internal Server Error",
    });
  }
}

function middleware(req, res, next) {
  if (req.path.startsWith("/account")) {
    const hasToken = handleAuth(req);
    if (!hasToken && process.env.NODE_ENV === "development") {
      console.warn("⚠️  Requisição sem token de autenticação:", req.path);
    }
  }

  if (req.method !== "GET") return next();

  try {
    if (req.path === "/account") return handleAccountEndpoint(req, res);
    if (req.path.match(/^\/account\/[^/]+\/balance/)) return handleBalanceEndpoint(req, res);
    if (req.path.match(/^\/account\/[^/]+\/statement/)) return handleStatementEndpoint(req, res);
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno do servidor",
      error: error.message || "Internal Server Error",
    });
  }

  next();
}

export default middleware;
