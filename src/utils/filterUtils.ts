import { Transaction, ValueRange, TransactionTypeFilter } from "@/types/statement";

export function filterByType(
  transactions: Transaction[],
  type: TransactionTypeFilter
): Transaction[] {
  if (type === "all") {
    return transactions;
  }
  return transactions.filter((transaction) => transaction.type === type);
}

export function filterByValueRange(
  transactions: Transaction[],
  valueRange: ValueRange
): Transaction[] {
  if (!valueRange || (valueRange.min === undefined && valueRange.max === undefined)) {
    return transactions;
  }

  return transactions.filter((transaction) => {
    const absoluteValue = Math.abs(transaction.value);
    if (valueRange.min !== undefined && absoluteValue < valueRange.min) {
      return false;
    }
    if (valueRange.max !== undefined && absoluteValue > valueRange.max) {
      return false;
    }
    return true;
  });
}

export function filterBySearch(transactions: Transaction[], searchQuery: string): Transaction[] {
  if (!searchQuery || searchQuery.trim() === "") {
    return transactions;
  }

  const query = searchQuery.toLowerCase().trim();

  return transactions.filter((transaction) => {
    if (transaction.from?.toLowerCase().includes(query)) {
      return true;
    }

    if (transaction.to?.toLowerCase().includes(query)) {
      return true;
    }

    if (transaction.id.toLowerCase().includes(query)) {
      return true;
    }

    if (transaction.value.toString().includes(query)) {
      return true;
    }

    return false;
  });
}
