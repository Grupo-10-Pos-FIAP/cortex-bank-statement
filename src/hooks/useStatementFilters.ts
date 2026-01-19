import { useState, useCallback, useMemo } from "react";
import { useDebounce } from "use-debounce";
import {
  TransactionFilters,
  initialFilters,
  TransactionTypeFilter,
  ValueRange,
} from "@/types/statement";
import { getLast30DaysStart, getLast30DaysEnd } from "@/utils/dateUtils";
import { DEBOUNCE_DELAY_FILTERS } from "@/constants";

export interface UseStatementFiltersReturn {
  filters: TransactionFilters;
  debouncedFilters: TransactionFilters;
  updateDateRange: (_start: Date | null, _end: Date | null) => void;
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

  const dateRangeStart = filters.dateRange.startDate?.getTime() ?? null;
  const dateRangeEnd = filters.dateRange.endDate?.getTime() ?? null;
  const [debouncedDateRangeStart] = useDebounce(dateRangeStart, DEBOUNCE_DELAY_FILTERS);
  const [debouncedDateRangeEnd] = useDebounce(dateRangeEnd, DEBOUNCE_DELAY_FILTERS);

  const [debouncedTransactionType] = useDebounce(filters.transactionType, DEBOUNCE_DELAY_FILTERS);

  const [debouncedValueMin] = useDebounce(filters.valueRange.min, DEBOUNCE_DELAY_FILTERS);
  const [debouncedValueMax] = useDebounce(filters.valueRange.max, DEBOUNCE_DELAY_FILTERS);

  const debouncedFilters = useMemo<TransactionFilters>(() => {
    return {
      dateRange: {
        startDate: debouncedDateRangeStart !== null ? new Date(debouncedDateRangeStart) : null,
        endDate: debouncedDateRangeEnd !== null ? new Date(debouncedDateRangeEnd) : null,
      },
      searchQuery: filters.searchQuery,
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

  const updateDateRange = useCallback((start: Date | null, end: Date | null) => {
    setFilters((prev) => {
      let startDate = start;
      let endDate = end;

      if (startDate && endDate && startDate > endDate) {
        startDate = end;
        endDate = start;
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

  const updateTransactionType = useCallback((type: TransactionTypeFilter) => {
    setFilters((prev) => ({
      ...prev,
      transactionType: type,
    }));
  }, []);

  const updateValueRange = useCallback((range: ValueRange) => {
    setFilters((prev) => ({
      ...prev,
      valueRange: range,
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
    updateTransactionType,
    updateValueRange,
    resetFilters,
    activeFiltersCount,
  };
}
