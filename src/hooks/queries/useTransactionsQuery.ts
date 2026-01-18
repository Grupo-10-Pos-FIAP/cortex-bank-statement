import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchTransactions } from "@/api/statement.api";
import { Transaction, TransactionFilters, PaginatedResponse } from "@/types/statement";
import { classifyError, AppError } from "@/utils/errorHandler";

const DEFAULT_PAGE_SIZE = 25;

interface UseTransactionsQueryOptions {
  accountId: string | null;
  filters: TransactionFilters;
}

function serializeFiltersForQueryKey(filters: TransactionFilters): string {
  return JSON.stringify({
    dateRange: {
      startDate: filters.dateRange.startDate?.toISOString() || null,
      endDate: filters.dateRange.endDate?.toISOString() || null,
    },
    searchQuery: filters.searchQuery,
    transactionType: filters.transactionType,
    valueRange: filters.valueRange,
  });
}

export function useTransactionsQuery({ accountId, filters }: UseTransactionsQueryOptions) {
  const startDateTimestamp = filters.dateRange.startDate?.getTime();
  const endDateTimestamp = filters.dateRange.endDate?.getTime();
  const searchQuery = filters.searchQuery;
  const transactionType = filters.transactionType;
  const valueRangeMin = filters.valueRange.min;
  const valueRangeMax = filters.valueRange.max;

  const serializedFilters = useMemo(
    () => serializeFiltersForQueryKey(filters),
    [
      startDateTimestamp,
      endDateTimestamp,
      searchQuery,
      transactionType,
      valueRangeMin,
      valueRangeMax,
    ]
  );

  return useInfiniteQuery<PaginatedResponse<Transaction>, AppError>({
    queryKey: ["transactions", accountId, serializedFilters],
    queryFn: async ({ pageParam = 1 }) => {
      if (!accountId) {
        throw new Error("Account ID is required");
      }
      try {
        return await fetchTransactions(accountId, {
          ...filters,
          pagination: {
            page: pageParam as number,
            pageSize: DEFAULT_PAGE_SIZE,
          },
        });
      } catch (error) {
        throw classifyError(error);
      }
    },
    enabled: !!accountId,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination.hasMore) {
        return undefined;
      }
      return lastPage.pagination.page + 1;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    throwOnError: false,
  });
}
