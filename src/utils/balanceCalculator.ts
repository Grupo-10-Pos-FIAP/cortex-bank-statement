import { Transaction, Balance } from "@/types/statement";

export function calculateBalance(transactions: Transaction[]): Balance {
  const total = transactions.reduce((sum, transaction) => {
    return sum + transaction.value;
  }, 0);

  return {
    value: total,
    yieldPercentage: 3,
  };
}
