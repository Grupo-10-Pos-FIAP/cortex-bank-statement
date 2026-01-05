import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateTransactions() {
  const transactions = [];
  const accountId = "acc-001";

  // Setembro 2025 até hoje
  const startDate = new Date(2025, 8, 1); // Setembro = mês 8 (0-indexed)
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  let transactionId = 1;
  // eslint-disable-next-line prefer-const
  let currentDate = new Date(startDate);

  const transactionTypes = [
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
    { type: "Credit", from: "Investimento", to: "Dividendos", values: [500, 800, 1000, 600, 700] },
    { type: "Credit", from: "Reembolso", to: "Conta corrente", values: [200, 300, 500, 150, 400] },
    { type: "Credit", from: "Bônus", to: "Conta corrente", values: [1000, 1500, 2000, 800, 1200] },
    { type: "Debit", from: "Supermercado", to: "Compras", values: [-150, -200, -300, -180, -250] },
    { type: "Debit", from: "Restaurante", to: "Pagamento", values: [-80, -120, -200, -100, -150] },
    {
      type: "Debit",
      from: "Streaming",
      to: "Assinatura mensal",
      values: [-45, -50, -60, -40, -55],
    },
    { type: "Debit", from: "Transporte", to: "Uber", values: [-25, -35, -50, -30, -40] },
    { type: "Debit", from: "Farmácia", to: "Medicamentos", values: [-100, -150, -200, -120, -180] },
    { type: "Debit", from: "Academia", to: "Mensalidade", values: [-150, -200, -250, -180, -220] },
    { type: "Debit", from: "Combustível", to: "Posto", values: [-200, -250, -300, -220, -280] },
  ];

  // Gerar transações semanais (5 por semana)
  while (currentDate <= endDate) {
    let weekHasTransactions = false;

    // 5 transações por semana
    for (let i = 0; i < 5; i++) {
      const dayOffset = i; // Distribuir ao longo da semana (0-4 dias)
      const transactionDate = new Date(currentDate);
      transactionDate.setDate(currentDate.getDate() + dayOffset);

      if (transactionDate > endDate) break;

      const hour = 9 + i * 2; // Horas diferentes (9, 11, 13, 15, 17)
      transactionDate.setHours(hour, (i * 10) % 60, 0, 0);

      const txType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const value = txType.values[Math.floor(Math.random() * txType.values.length)];

      transactions.push({
        id: `txn-${String(transactionId).padStart(3, "0")}`,
        accountId,
        type: txType.type,
        value,
        date: transactionDate.toISOString(),
        from: txType.from,
        to: txType.to,
      });

      transactionId++;
      weekHasTransactions = true;
    }

    // Se não gerou nenhuma transação nesta semana, parar
    if (!weekHasTransactions) break;

    // Avançar para próxima semana
    currentDate.setDate(currentDate.getDate() + 7);

    // Verificar se a próxima semana ainda está dentro do range
    if (currentDate > endDate) break;
  }

  // Ordenar por data
  transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

  return transactions;
}

const transactions = generateTransactions();
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
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");

console.log(`Generated ${transactions.length} transactions`);
console.log(`Date range: ${transactions[0].date} to ${transactions[transactions.length - 1].date}`);
