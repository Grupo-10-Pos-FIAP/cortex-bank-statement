import { useMemo, useCallback, useState, useEffect } from "react";
import { useTransactionsQuery } from "./queries/useTransactionsQuery";
import { TransactionFilters, Transaction, Balance, Pagination } from "@/types/statement";
import {
  filterBySearch,
  filterByType,
  filterByValueRange,
  filterByDateRange,
} from "@/utils/filterUtils";
import { calculateBalance } from "@/utils/balanceCalculator";
import { DEFAULT_PAGE_SIZE } from "@/constants";

interface UseStatementQueryOptions {
  accountId: string | null;
  filters: TransactionFilters;
}

interface UseStatementQueryReturn {
  balance: Balance | null;
  filteredTransactions: Transaction[];
  loading: boolean;
  error: ReturnType<typeof useTransactionsQuery>["error"];
  pagination: Pagination;
  loadMore: () => void;
  refetch: () => void;
}

export function useStatementQuery({
  accountId,
  filters,
}: UseStatementQueryOptions): UseStatementQueryReturn {
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
  useEffect(() => {
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

  // Return only visible transactions for display (paginated client-side)
  const visibleTransactions = useMemo(() => {
    return filteredTransactions.slice(0, visibleItemsCount);
  }, [filteredTransactions, visibleItemsCount]);

  return {
    balance,
    filteredTransactions: visibleTransactions,
    loading: transactionsQuery.isLoading,
    error: transactionsQuery.error ?? null,
    pagination,
    loadMore,
    refetch,
  };
}
