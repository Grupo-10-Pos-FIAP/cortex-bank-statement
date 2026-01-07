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
  allTransactions: Transaction[];
  filteredTransactions: Transaction[];
  loading: boolean;
  loadingMore: boolean;
  error: AppError | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  loadMore: () => Promise<void>;
  refetch: () => void;
}

const DEFAULT_PAGE_SIZE = 25;

export function useStatement({ accountId, filters }: UseStatementOptions): UseStatementReturn {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<AppError | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });

  const currentBalanceRequestId = useRef<symbol | null>(null);
  const currentTransactionsRequestId = useRef<symbol | null>(null);
  const isLoadingMoreRef = useRef<boolean>(false);
  const filtersRef = useRef<TransactionFilters | undefined>(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const prevDateRangeRef = useRef<{
    startDate: Date | null;
    endDate: Date | null;
  } | null>(null);

  const prevClientFiltersRef = useRef<{
    searchQuery: string;
    transactionType: string;
    valueRange: { min?: number; max?: number };
  } | null>(null);

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

  const currentDateRange = useMemo(
    () => ({
      startDate: filters?.dateRange?.startDate || null,
      endDate: filters?.dateRange?.endDate || null,
    }),
    [filters?.dateRange?.startDate, filters?.dateRange?.endDate]
  );

  useEffect(() => {
    const prev = prevDateRangeRef.current;
    const current = currentDateRange;

    const dateRangeChanged =
      prev === null ||
      prev.startDate?.getTime() !== current.startDate?.getTime() ||
      prev.endDate?.getTime() !== current.endDate?.getTime();

    if (dateRangeChanged) {
      setAllTransactions([]);
      setLoadingMore(false);
      isLoadingMoreRef.current = false;
      setPagination({
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        total: 0,
        totalPages: 0,
        hasMore: false,
      });
      prevDateRangeRef.current = current;
    }
  }, [currentDateRange]);

  const loadTransactions = useCallback(
    async (page = 1, append = false) => {
      if (!accountId) {
        setAllTransactions([]);
        setError(null);
        return;
      }

      const requestId = Symbol();
      currentTransactionsRequestId.current = requestId;

      try {
        if (!append) {
          setLoading(true);
        }
        setError(null);

        const currentFilters = filtersRef.current;
        if (!currentFilters) {
          return;
        }

        const filtersWithPagination: TransactionFilters = {
          ...currentFilters,
          pagination: {
            page,
            pageSize: DEFAULT_PAGE_SIZE,
          },
        };

        const response = await fetchTransactions(accountId, filtersWithPagination);

        if (currentTransactionsRequestId.current === requestId) {
          if (append) {
            setAllTransactions((prev) => {
              const existingIds = new Set(prev.map((t) => t.id));
              const newTransactions = response.data.filter((t) => !existingIds.has(t.id));
              return [...prev, ...newTransactions];
            });
          } else {
            setAllTransactions(response.data);
          }

          const isLastPage = response.pagination.page >= response.pagination.totalPages;
          const isLastPageByData = response.data.length < response.pagination.pageSize;

          const hasMoreData =
            !isLastPage &&
            !isLastPageByData &&
            response.pagination.hasMore &&
            response.data.length > 0;

          setPagination({
            page: response.pagination.page,
            pageSize: response.pagination.pageSize,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages,
            hasMore: hasMoreData,
          });
        }
      } catch (err) {
        const appError = classifyError(err);
        if (currentTransactionsRequestId.current === requestId) {
          setError(appError);
          if (!append) {
            setAllTransactions([]);
          }
        }
      } finally {
        if (currentTransactionsRequestId.current === requestId && !append) {
          setLoading(false);
        }
      }
    },
    [accountId]
  );

  const loadMore = useCallback(async () => {
    if (isLoadingMoreRef.current || !pagination.hasMore || !accountId || loadingMore) {
      return;
    }

    if (pagination.page >= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, hasMore: false }));
      return;
    }

    isLoadingMoreRef.current = true;
    setLoadingMore(true);
    const nextPage = pagination.page + 1;

    try {
      await loadTransactions(nextPage, true);
    } finally {
      isLoadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [
    accountId,
    pagination.hasMore,
    pagination.page,
    pagination.totalPages,
    loadTransactions,
    loadingMore,
  ]);

  const refetch = useCallback(() => {
    loadBalance();
    setAllTransactions([]);
    setPagination({
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      total: 0,
      totalPages: 0,
      hasMore: false,
    });
    loadTransactions(1, false);
  }, [loadBalance, loadTransactions]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  useEffect(() => {
    if (accountId && filtersRef.current && allTransactions.length === 0 && !loading) {
      loadTransactions(1, false);
    }
  }, [accountId, currentDateRange, allTransactions.length, loading, loadTransactions]);

  const filterKey = useMemo(() => {
    if (!filters) return "";
    return `${filters.searchQuery}|${filters.transactionType}|${filters.valueRange.min}|${filters.valueRange.max}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters?.searchQuery,
    filters?.transactionType,
    filters?.valueRange.min,
    filters?.valueRange.max,
  ]);

  const filteredTransactions = useMemo(() => {
    const currentFilters = filtersRef.current;
    if (!currentFilters) {
      return allTransactions;
    }

    let filtered = [...allTransactions];

    filtered = filterBySearch(filtered, currentFilters.searchQuery);
    filtered = filterByType(filtered, currentFilters.transactionType);
    filtered = filterByValueRange(filtered, currentFilters.valueRange);

    return filtered;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTransactions, filterKey]);

  useEffect(() => {
    const currentFilters = filtersRef.current;
    if (!currentFilters) return;

    const currentClientFilters = {
      searchQuery: currentFilters.searchQuery,
      transactionType: currentFilters.transactionType,
      valueRange: {
        min: currentFilters.valueRange.min,
        max: currentFilters.valueRange.max,
      },
    };

    prevClientFiltersRef.current = currentClientFilters;
  }, [filterKey]);

  return {
    balance,
    allTransactions,
    filteredTransactions,
    loading,
    loadingMore,
    error,
    pagination,
    loadMore,
    refetch,
  };
}
