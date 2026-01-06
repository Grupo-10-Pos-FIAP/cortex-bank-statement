import { useState, useCallback, useMemo } from "react";
import {
  TransactionFilters,
  initialFilters,
  TransactionTypeFilter,
  ValueRange,
} from "@/types/statement";
import { getLast30DaysStart, getLast30DaysEnd } from "@/utils/dateUtils";

interface UseStatementFiltersReturn {
  filters: TransactionFilters;
  updateDateRange: (_start: Date | null, _end: Date | null) => void;
  updateSearchQuery: (_query: string) => void;
  updateTransactionType: (_type: TransactionTypeFilter) => void;
  updateValueRange: (_range: ValueRange) => void;
  resetFilters: () => void;
  activeFiltersCount: number;
}

// Inicializar filtros com período padrão (últimos 30 dias)
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

  const updateDateRange = useCallback((_start: Date | null, _end: Date | null) => {
    setFilters((prev) => {
      // Normaliza as datas se startDate > endDate (inverte os valores)
      let startDate = _start;
      let endDate = _end;

      if (startDate && endDate && startDate > endDate) {
        // Inverte as datas se a inicial for maior que a final
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
    updateDateRange,
    updateSearchQuery,
    updateTransactionType,
    updateValueRange,
    resetFilters,
    activeFiltersCount,
  };
}
