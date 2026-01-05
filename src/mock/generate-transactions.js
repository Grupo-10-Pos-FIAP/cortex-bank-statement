import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getSpecificTransactions(accountId) {
  return [
    {
      id: "txn-old-001",
      accountId,
      type: "Credit",
      value: 1000,
      date: new Date("2024-01-02T12:00:00.000Z").toISOString(),
      from: "Transação Antiga",
      to: "Conta corrente",
    },
    {
      id: "txn-future-001",
      accountId,
      type: "Credit",
      value: 2000,
      date: new Date("2025-02-25T12:00:00.000Z").toISOString(),
      from: "Transação Futura",
      to: "Conta corrente",
    },
  ];
}

function getTransactionTypes() {
  return [
    {
      type: "Credit",
      from: "Salário",
      to: "Conta corrente",
      values: [3000, 4000, 5000, 2500, 3500],
    },
    {
      type: "Credit",
      from: "Freelance",
      to: "Conta corrente",
      values: [800, 1200, 1500, 600, 1000],
    },
    {
      type: "Credit",
      from: "Investimento",
      to: "Dividendos",
      values: [500, 800, 1000, 600, 700],
    },
    {
      type: "Credit",
      from: "Reembolso",
      to: "Conta corrente",
      values: [200, 300, 500, 150, 400],
    },
    {
      type: "Credit",
      from: "Bônus",
      to: "Conta corrente",
      values: [1000, 1500, 2000, 800, 1200],
    },
    {
      type: "Debit",
      from: "Supermercado",
      to: "Compras",
      values: [-150, -200, -300, -180, -250],
    },
    {
      type: "Debit",
      from: "Restaurante",
      to: "Pagamento",
      values: [-80, -120, -200, -100, -150],
    },
    {
      type: "Debit",
      from: "Streaming",
      to: "Assinatura mensal",
      values: [-45, -50, -60, -40, -55],
    },
    {
      type: "Debit",
      from: "Transporte",
      to: "Uber",
      values: [-25, -35, -50, -30, -40],
    },
    {
      type: "Debit",
      from: "Farmácia",
      to: "Medicamentos",
      values: [-100, -150, -200, -120, -180],
    },
    {
      type: "Debit",
      from: "Academia",
      to: "Mensalidade",
      values: [-150, -200, -250, -180, -220],
    },
    {
      type: "Debit",
      from: "Combustível",
      to: "Posto",
      values: [-200, -250, -300, -220, -280],
    },
  ];
}

function generateRandomTransaction(transactionId, accountId, transactionDate, transactionTypes) {
  const txType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
  const value = txType.values[Math.floor(Math.random() * txType.values.length)];

  return {
    id: `txn-${String(transactionId).padStart(3, "0")}`,
    accountId,
    type: txType.type,
    value,
    date: transactionDate.toISOString(),
    from: txType.from,
    to: txType.to,
  };
}

function generateWeeklyTransactions(startDate, endDate, accountId, transactionTypes) {
  const transactions = [];
  let transactionId = 1;
  let weekOffset = 0;
  let currentWeekStart = new Date(startDate);
  currentWeekStart.setDate(startDate.getDate() + weekOffset * 7);

  while (currentWeekStart <= endDate) {
    let weekHasTransactions = false;

    for (let i = 0; i < 5; i++) {
      const dayOffset = i;
      const transactionDate = new Date(currentWeekStart);
      transactionDate.setDate(currentWeekStart.getDate() + dayOffset);

      if (transactionDate > endDate) break;

      const hour = 9 + i * 2;
      transactionDate.setHours(hour, (i * 10) % 60, 0, 0);

      const transaction = generateRandomTransaction(
        transactionId,
        accountId,
        transactionDate,
        transactionTypes
      );
      transactions.push(transaction);

      transactionId++;
      weekHasTransactions = true;
    }

    if (!weekHasTransactions) break;

    weekOffset++;
    currentWeekStart = new Date(startDate);
    currentWeekStart.setDate(startDate.getDate() + weekOffset * 7);
  }

  return transactions;
}

function generateTransactions() {
  const transactions = [];
  const accountId = "acc-001";

  const startDate = new Date(2024, 0, 1);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  transactions.push(...getSpecificTransactions(accountId));

  const transactionTypes = getTransactionTypes();
  const weeklyTransactions = generateWeeklyTransactions(
    startDate,
    endDate,
    accountId,
    transactionTypes
  );
  transactions.push(...weeklyTransactions);

  transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return transactions;
}

function saveTransactions(transactions) {
  const db = {
    accounts: [
      {
        id: "acc-001",
        type: "Debit",
      },
    ],
    transactions,
    cards: [],
  };

  const dbPath = path.join(__dirname, "db.json");

  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Erro ao salvar db.json:", error);
    return false;
  }
}

try {
  const transactions = generateTransactions();
  const success = saveTransactions(transactions);

  if (success && transactions.length > 0) {
    console.log(`✅ Generated ${transactions.length} transactions`);
    const firstDate = transactions[0].date;
    const lastDate = transactions[transactions.length - 1].date;
    console.log(`📅 Date range: ${firstDate} to ${lastDate}`);
  } else if (transactions.length === 0) {
    console.warn("⚠️  No transactions generated");
  }
} catch (error) {
  console.error("❌ Error generating transactions:", error);
  process.exit(1);
}
