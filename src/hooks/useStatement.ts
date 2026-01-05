import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  const currentBalanceRequestId = useRef<symbol | null>(null);
  const currentTransactionsRequestId = useRef<symbol | null>(null);

  const loadBalance = useCallback(async () => {
    if (!accountId) {
      setBalance(null);
      setError(null);
      return;
    }

    const requestId = Symbol();
    currentBalanceRequestId.current = requestId;

    try {
      setError(null);
      const balanceData = await fetchBalance(accountId);
      if (currentBalanceRequestId.current === requestId) {
        setBalance(balanceData);
      }
    } catch (err) {
      const appError = classifyError(err);
      if (currentBalanceRequestId.current === requestId) {
        setError(appError);
        setBalance(null);
      }
    }
  }, [accountId]);

  const loadTransactions = useCallback(async () => {
    if (!accountId) {
      setTransactions([]);
      setError(null);
      return;
    }

    const requestId = Symbol();
    currentTransactionsRequestId.current = requestId;

    try {
      setLoading(true);
      setError(null);
      const transactionsData = await fetchTransactions(accountId, filters);
      if (currentTransactionsRequestId.current === requestId) {
        setTransactions(transactionsData);
      }
    } catch (err) {
      const appError = classifyError(err);
      if (currentTransactionsRequestId.current === requestId) {
        setError(appError);
        setTransactions([]);
      }
    } finally {
      if (currentTransactionsRequestId.current === requestId) {
        setLoading(false);
      }
    }
  }, [
    accountId,
    filters?.dateRange?.startDate?.getTime(),
    filters?.dateRange?.endDate?.getTime(),
    filters?.transactionType,
    filters?.valueRange?.min,
    filters?.valueRange?.max,
    filters?.searchQuery,
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
