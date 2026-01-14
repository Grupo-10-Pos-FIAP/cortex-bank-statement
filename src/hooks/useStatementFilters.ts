import { useState, useCallback, useMemo } from "react";
import { useDebounce } from "use-debounce";
import {
  TransactionFilters,
  initialFilters,
  TransactionTypeFilter,
  ValueRange,
} from "@/types/statement";
import { getLast30DaysStart, getLast30DaysEnd } from "@/utils/dateUtils";

interface UseStatementFiltersReturn {
  filters: TransactionFilters;
  debouncedFilters: TransactionFilters;
  updateDateRange: (_start: Date | null, _end: Date | null) => void;
  updateSearchQuery: (_query: string) => void;
  updateTransactionType: (_type: TransactionTypeFilter) => void;
  updateValueRange: (_range: ValueRange) => void;
  resetFilters: () => void;
  activeFiltersCount: number;
}

const getInitialFilters = (): TransactionFilters => {
  return {
    ...initialFilters,
    dateRange: {
      startDate: getLast30DaysStart(),
      endDate: getLast30DaysEnd(),
    },
  };
};

export function useStatementFilters(): UseStatementFiltersReturn {
  const [filters, setFilters] = useState<TransactionFilters>(getInitialFilters());

  // Debounce para data range - usar timestamps para comparar
  const dateRangeStart = filters.dateRange.startDate?.getTime() ?? null;
  const dateRangeEnd = filters.dateRange.endDate?.getTime() ?? null;
  const [debouncedDateRangeStart] = useDebounce(dateRangeStart, 500);
  const [debouncedDateRangeEnd] = useDebounce(dateRangeEnd, 500);

  // Debounce para tipo de transação
  const [debouncedTransactionType] = useDebounce(filters.transactionType, 500);

  // Debounce para range de valores
  const [debouncedValueMin] = useDebounce(filters.valueRange.min, 500);
  const [debouncedValueMax] = useDebounce(filters.valueRange.max, 500);

  // Construir filtros debounced
  const debouncedFilters = useMemo<TransactionFilters>(() => {
    return {
      dateRange: {
        startDate: debouncedDateRangeStart !== null ? new Date(debouncedDateRangeStart) : null,
        endDate: debouncedDateRangeEnd !== null ? new Date(debouncedDateRangeEnd) : null,
      },
      searchQuery: filters.searchQuery, // searchQuery já tem seu próprio debounce no useSearch
      transactionType: debouncedTransactionType,
      valueRange: {
        min: debouncedValueMin,
        max: debouncedValueMax,
      },
    };
  }, [
    filters.searchQuery,
    debouncedDateRangeStart,
    debouncedDateRangeEnd,
    debouncedTransactionType,
    debouncedValueMin,
    debouncedValueMax,
  ]);

  const updateDateRange = useCallback((_start: Date | null, _end: Date | null) => {
    setFilters((prev) => {
      let startDate = _start;
      let endDate = _end;

      if (startDate && endDate && startDate > endDate) {
        startDate = _end;
        endDate = _start;
      }

      return {
        ...prev,
        dateRange: {
          startDate,
          endDate,
        },
      };
    });
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
    setFilters(getInitialFilters());
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
    debouncedFilters,
    updateDateRange,
    updateSearchQuery,
    updateTransactionType,
    updateValueRange,
    resetFilters,
    activeFiltersCount,
  };
}
