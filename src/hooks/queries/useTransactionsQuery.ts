import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTransactions } from "@/api/statement.api";
import { Transaction, TransactionFilters } from "@/types/statement";
import { classifyError, AppError } from "@/utils/errorHandler";

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
  const serializedFilters = useMemo(() => serializeFiltersForQueryKey(filters), [filters]);

  return useQuery<Transaction[], AppError>({
    queryKey: ["transactions", accountId, serializedFilters],
    queryFn: async () => {
      if (!accountId) {
        throw new Error("Account ID is required");
      }
      try {
        return await fetchTransactions(accountId);
      } catch (error) {
        throw classifyError(error);
      }
    },
    enabled: !!accountId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    throwOnError: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    placeholderData: undefined,
  });
}
