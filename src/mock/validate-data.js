import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function validateDb() {
  const dbPath = path.join(__dirname, "db.json");

  if (!fs.existsSync(dbPath)) {
    console.error("❌ db.json não encontrado!");
    process.exit(1);
  }

  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

  const errors = [];

  if (!db.accounts || !Array.isArray(db.accounts)) {
    errors.push("❌ 'accounts' deve ser um array");
  } else if (db.accounts.length === 0) {
    errors.push("⚠️  'accounts' está vazio");
  } else {
    console.log(`✅ ${db.accounts.length} conta(s) encontrada(s)`);
    db.accounts.forEach((account, index) => {
      if (!account.id) {
        errors.push(`❌ Conta ${index} não tem 'id'`);
      }
      if (!account.type) {
        errors.push(`❌ Conta ${index} não tem 'type'`);
      }
    });
  }

  if (!db.transactions || !Array.isArray(db.transactions)) {
    errors.push("❌ 'transactions' deve ser um array");
  } else if (db.transactions.length === 0) {
    errors.push("⚠️  'transactions' está vazio");
  } else {
    console.log(`✅ ${db.transactions.length} transação(ões) encontrada(s)`);

    const requiredFields = ["id", "accountId", "type", "value", "date", "from", "to"];
    db.transactions.forEach((transaction, index) => {
      requiredFields.forEach((field) => {
        if (!(field in transaction)) {
          errors.push(`❌ Transação ${index} (${transaction.id || "sem id"}) não tem '${field}'`);
        }
      });

      if (transaction.type !== "Credit" && transaction.type !== "Debit") {
        errors.push(`❌ Transação ${index} tem tipo inválido: ${transaction.type}`);
      }

      if (typeof transaction.value !== "number") {
        errors.push(`❌ Transação ${index} tem valor inválido: ${transaction.value}`);
      }

      if (isNaN(new Date(transaction.date).getTime())) {
        errors.push(`❌ Transação ${index} tem data inválida: ${transaction.date}`);
      }
    });

    const accountIds = new Set(db.accounts.map((a) => a.id));
    const invalidAccountIds = db.transactions
      .map((t) => t.accountId)
      .filter((id) => !accountIds.has(id));

    if (invalidAccountIds.length > 0) {
      errors.push(`❌ ${invalidAccountIds.length} transação(ões) com accountId inválido`);
    }
  }

  if (!db.cards || !Array.isArray(db.cards)) {
    errors.push("❌ 'cards' deve ser um array");
  } else {
    console.log(`✅ ${db.cards.length} cartão(ões) encontrado(s)`);
  }

  if (errors.length > 0) {
    console.error("\n❌ Erros encontrados:");
    errors.forEach((error) => console.error(`   ${error}`));
    process.exit(1);
  }

  console.log("\n✅ Todos os dados são válidos!");

  const dateRange =
    db.transactions.length > 0
      ? {
          first: new Date(Math.min(...db.transactions.map((t) => new Date(t.date).getTime()))),
          last: new Date(Math.max(...db.transactions.map((t) => new Date(t.date).getTime()))),
        }
      : null;

  if (dateRange) {
    console.log(`\n📅 Período das transações:`);
    console.log(`   De: ${dateRange.first.toISOString()}`);
    console.log(`   Até: ${dateRange.last.toISOString()}`);
  }
}

validateDb();
