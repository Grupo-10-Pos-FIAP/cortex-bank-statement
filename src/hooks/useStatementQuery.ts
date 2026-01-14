import { useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTransactionsQuery } from "./queries/useTransactionsQuery";
import { TransactionFilters, Transaction, Balance } from "@/types/statement";
import {
  filterBySearch,
  filterByType,
  filterByValueRange,
  filterByDateRange,
} from "@/utils/filterUtils";
import { calculateBalance } from "@/utils/balanceCalculator";

const DEFAULT_PAGE_SIZE = 25;

interface UseStatementQueryOptions {
  accountId: string | null;
  filters: TransactionFilters;
}

interface UseStatementQueryReturn {
  balance: Balance | null;
  allTransactions: Transaction[];
  filteredTransactions: Transaction[];
  loading: boolean;
  loadingMore: boolean;
  error: ReturnType<typeof useTransactionsQuery>["error"];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  loadMore: () => void;
  refetch: () => void;
  invalidateCache: () => void;
}

export function useStatementQuery({
  accountId,
  filters,
}: UseStatementQueryOptions): UseStatementQueryReturn {
  const queryClient = useQueryClient();

  const transactionsQuery = useTransactionsQuery({ accountId, filters });

  const allTransactions = useMemo(() => {
    return transactionsQuery.data?.pages.flatMap((page) => page.data) || [];
  }, [transactionsQuery.data]);

  const balance = useMemo(() => {
    if (allTransactions.length === 0) {
      return null;
    }
    return calculateBalance(allTransactions);
  }, [allTransactions]);

  const filteredTransactions = useMemo(() => {
    let filtered = [...allTransactions];

    filtered = filterByDateRange(
      filtered,
      filters.dateRange.startDate,
      filters.dateRange.endDate
    );
    filtered = filterBySearch(filtered, filters.searchQuery);
    filtered = filterByType(filtered, filters.transactionType);
    filtered = filterByValueRange(filtered, filters.valueRange);

    return filtered;
  }, [
    allTransactions,
    filters.dateRange.startDate,
    filters.dateRange.endDate,
    filters.searchQuery,
    filters.transactionType,
    filters.valueRange,
  ]);

  const pagination = useMemo(() => {
    const lastPage = transactionsQuery.data?.pages[transactionsQuery.data.pages.length - 1];
    if (!lastPage) {
      return {
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        total: 0,
        totalPages: 0,
        hasMore: false,
      };
    }

    return {
      page: lastPage.pagination.page,
      pageSize: lastPage.pagination.pageSize,
      total: lastPage.pagination.total,
      totalPages: lastPage.pagination.totalPages,
      hasMore: transactionsQuery.hasNextPage,
    };
  }, [transactionsQuery.data, transactionsQuery.hasNextPage]);

  const loadMore = useCallback(() => {
    if (transactionsQuery.hasNextPage && !transactionsQuery.isFetchingNextPage) {
      transactionsQuery.fetchNextPage();
    }
  }, [transactionsQuery]);

  const refetch = useCallback(() => {
    transactionsQuery.refetch();
  }, [transactionsQuery]);

  const invalidateCache = useCallback(() => {
    if (accountId) {
      queryClient.invalidateQueries({ queryKey: ["transactions", accountId] });
    }
  }, [accountId, queryClient]);

  return {
    balance,
    allTransactions,
    filteredTransactions,
    loading: transactionsQuery.isLoading,
    loadingMore: transactionsQuery.isFetchingNextPage,
    error: transactionsQuery.error ?? null,
    pagination,
    loadMore,
    refetch,
    invalidateCache,
  };
}
