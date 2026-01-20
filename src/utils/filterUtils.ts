import { Transaction, ValueRange, TransactionTypeFilter } from "@/types/statement";

export function filterByDateRange(
  transactions: Transaction[],
  startDate: Date | null,
  endDate: Date | null
): Transaction[] {
  if (!startDate && !endDate) {
    return transactions;
  }

  const startTimestamp = startDate
    ? new Date(
        Date.UTC(
          startDate.getUTCFullYear(),
          startDate.getUTCMonth(),
          startDate.getUTCDate(),
          0,
          0,
          0,
          0
        )
      ).getTime()
    : null;

  const endTimestamp = endDate
    ? new Date(
        Date.UTC(
          endDate.getUTCFullYear(),
          endDate.getUTCMonth(),
          endDate.getUTCDate(),
          23,
          59,
          59,
          999
        )
      ).getTime()
    : null;

  return transactions.filter((transaction) => {
    const txDate = new Date(transaction.date);
    const txDateStart = new Date(
      Date.UTC(txDate.getUTCFullYear(), txDate.getUTCMonth(), txDate.getUTCDate(), 0, 0, 0, 0)
    ).getTime();

    if (startTimestamp !== null && endTimestamp !== null) {
      return txDateStart >= startTimestamp && txDateStart <= endTimestamp;
    }

    if (startTimestamp !== null && endTimestamp === null) {
      return txDateStart >= startTimestamp;
    }

    if (startTimestamp === null && endTimestamp !== null) {
      return txDateStart <= endTimestamp;
    }

    return true;
  });
}

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

  const processedMin = valueRange.min !== undefined && valueRange.min > 0 ? valueRange.min : undefined;
  const processedMax = valueRange.max !== undefined && valueRange.max > 0 ? valueRange.max : undefined;

  if (processedMin === undefined && processedMax === undefined) {
    return transactions;
  }

  return transactions.filter((transaction) => {
    const absoluteValue = Math.abs(transaction.value);

    if (processedMin !== undefined && absoluteValue < processedMin) {
      return false;
    }

    if (processedMax !== undefined && absoluteValue > processedMax) {
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
