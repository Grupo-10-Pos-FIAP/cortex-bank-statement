import { useState, useCallback, useMemo } from "react";
import {
  TransactionFilters,
  initialFilters,
  TransactionTypeFilter,
  ValueRange,
} from "@/types/statement";

interface UseStatementFiltersReturn {
  filters: TransactionFilters;
  updateDateRange: (_start: Date | null, _end: Date | null) => void;
  updateSearchQuery: (_query: string) => void;
  updateTransactionType: (_type: TransactionTypeFilter) => void;
  updateValueRange: (_range: ValueRange) => void;
  resetFilters: () => void;
  activeFiltersCount: number;
}

export function useStatementFilters(): UseStatementFiltersReturn {
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters);

  const updateDateRange = useCallback((_start: Date | null, _end: Date | null) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        startDate: _start,
        endDate: _end,
      },
    }));
  }, []);

  const updateSearchQuery = useCallback((_query: string) => {
    setFilters((prev) => ({
      ...prev,
      searchQuery: _query,
    }));
  }, []);

  const updateTransactionType = useCallback((_type: TransactionTypeFilter) => {
    setFilters((prev) => ({
      ...prev,
      transactionType: _type,
    }));
  }, []);

  const updateValueRange = useCallback((_range: ValueRange) => {
    setFilters((prev) => ({
      ...prev,
      valueRange: _range,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;

    if (filters.dateRange.startDate || filters.dateRange.endDate) {
      count++;
    }
    if (filters.searchQuery.trim() !== "") {
      count++;
    }
    if (filters.transactionType !== "all") {
      count++;
    }
    if (filters.valueRange.min !== undefined || filters.valueRange.max !== undefined) {
      count++;
    }

    return count;
  }, [filters]);

  return {
    filters,
    updateDateRange,
    updateSearchQuery,
    updateTransactionType,
    updateValueRange,
    resetFilters,
    activeFiltersCount,
  };
}
