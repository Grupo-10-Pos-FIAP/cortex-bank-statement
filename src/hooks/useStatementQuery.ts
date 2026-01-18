import { useMemo, useCallback, useState } from "react";
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
  filteredTransactions: Transaction[]; // All filtered transactions (for display with pagination)
  loading: boolean;
  loadingMore: boolean; // Always false now, kept for compatibility
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
  const [visibleItemsCount, setVisibleItemsCount] = useState(DEFAULT_PAGE_SIZE);

  const transactionsQuery = useTransactionsQuery({ accountId, filters });

  const allTransactions = useMemo(() => {
    return transactionsQuery.data || [];
  }, [transactionsQuery.data]);

  const balance = useMemo(() => {
    if (allTransactions.length === 0) {
      return null;
    }
    return calculateBalance(allTransactions);
  }, [allTransactions]);

  const filteredTransactions = useMemo(() => {
    let filtered = [...allTransactions];

    filtered = filterByDateRange(filtered, filters.dateRange.startDate, filters.dateRange.endDate);
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

  // Reset visible items when filters change
  const filteredTotal = filteredTransactions.length;
  const currentPage = Math.ceil(visibleItemsCount / DEFAULT_PAGE_SIZE);
  const totalPages = Math.ceil(filteredTotal / DEFAULT_PAGE_SIZE);

  const pagination = useMemo(() => {
    return {
      page: currentPage,
      pageSize: DEFAULT_PAGE_SIZE,
      total: filteredTotal,
      totalPages,
      hasMore: visibleItemsCount < filteredTotal,
    };
  }, [currentPage, filteredTotal, totalPages, visibleItemsCount]);

  // Reset visible items count when filters change significantly
  useMemo(() => {
    if (filteredTotal < visibleItemsCount) {
      setVisibleItemsCount(Math.min(DEFAULT_PAGE_SIZE, filteredTotal));
    }
  }, [filteredTotal, visibleItemsCount]);

  const loadMore = useCallback(() => {
    if (visibleItemsCount < filteredTotal) {
      setVisibleItemsCount((prev) => Math.min(prev + DEFAULT_PAGE_SIZE, filteredTotal));
    }
  }, [visibleItemsCount, filteredTotal]);

  const refetch = useCallback(() => {
    transactionsQuery.refetch();
  }, [transactionsQuery]);

  const invalidateCache = useCallback(() => {
    if (accountId) {
      queryClient.invalidateQueries({ queryKey: ["transactions", accountId] });
    }
  }, [accountId, queryClient]);

  // Return only visible transactions for display (paginated client-side)
  const visibleTransactions = useMemo(() => {
    return filteredTransactions.slice(0, visibleItemsCount);
  }, [filteredTransactions, visibleItemsCount]);

  return {
    balance,
    allTransactions,
    filteredTransactions: visibleTransactions,
    loading: transactionsQuery.isLoading,
    loadingMore: false, // No longer needed since we're not fetching
    error: transactionsQuery.error ?? null,
    pagination,
    loadMore,
    refetch,
    invalidateCache,
  };
}
