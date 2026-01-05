import { useState, useEffect, useCallback, useMemo } from "react";
import { Balance, Transaction, TransactionFilters } from "@/types/statement";
import { fetchBalance, fetchTransactions } from "@/api/statement.api";
import { filterBySearch, filterByType, filterByValueRange } from "@/utils/filterUtils";
import { classifyError, AppError } from "@/utils/errorHandler";

interface UseStatementOptions {
  accountId: string | null;
  filters?: TransactionFilters;
}

interface UseStatementReturn {
  balance: Balance | null;
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  loading: boolean;
  error: AppError | null;
  refetch: () => void;
}

export function useStatement({ accountId, filters }: UseStatementOptions): UseStatementReturn {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<AppError | null>(null);

  const loadBalance = useCallback(async () => {
    if (!accountId) {
      setBalance(null);
      setError(null);
      return;
    }

    try {
      setError(null);
      const balanceData = await fetchBalance(accountId);
      setBalance(balanceData);
    } catch (err) {
      const appError = classifyError(err);
      setError(appError);
      setBalance(null);
    }
  }, [accountId]);

  const loadTransactions = useCallback(async () => {
    if (!accountId) {
      setTransactions([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const transactionsData = await fetchTransactions(accountId, filters);
      setTransactions(transactionsData);
    } catch (err) {
      const appError = classifyError(err);
      setError(appError);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    accountId,
    filters?.dateRange?.startDate?.getTime(),
    filters?.dateRange?.endDate?.getTime(),
    filters?.transactionType,
    filters?.valueRange?.min,
    filters?.valueRange?.max,
  ]);

  const refetch = useCallback(() => {
    loadBalance();
    loadTransactions();
  }, [loadBalance, loadTransactions]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const filteredTransactions = useMemo(() => {
    if (!filters) {
      return transactions;
    }

    let filtered = [...transactions];

    filtered = filterBySearch(filtered, filters.searchQuery);
    filtered = filterByType(filtered, filters.transactionType);
    filtered = filterByValueRange(filtered, filters.valueRange);

    return filtered;
  }, [transactions, filters]);

  return {
    balance,
    transactions,
    filteredTransactions,
    loading,
    error,
    refetch,
  };
}
