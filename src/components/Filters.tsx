import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button, Text, Input } from "@grupo10-pos-fiap/design-system";
import { TransactionFilters, TransactionTypeFilter, ValueRange } from "@/types/statement";
import { formatDateRange, getStartOfMonth, getEndOfMonth } from "@/utils/dateUtils";
import styles from "./Filters.module.css";

interface FiltersProps {
  filters: TransactionFilters;
  onDateRangeChange: (_start: Date | null, _end: Date | null) => void;
  onTransactionTypeChange: (_type: TransactionTypeFilter) => void;
  onValueRangeChange: (_range: ValueRange) => void;
  onReset: () => void;
  activeFiltersCount: number;
}

function Filters({
  filters,
  onDateRangeChange,
  onTransactionTypeChange,
  onValueRangeChange,
  onReset,
  activeFiltersCount,
}: FiltersProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const effectiveStartDate = useMemo(
    () => filters.dateRange.startDate || getStartOfMonth(),
    [filters.dateRange.startDate]
  );
  const effectiveEndDate = useMemo(
    () => filters.dateRange.endDate || getEndOfMonth(),
    [filters.dateRange.endDate]
  );

  const displayDateRange = useMemo(
    () => formatDateRange(effectiveStartDate, effectiveEndDate),
    [effectiveStartDate, effectiveEndDate]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };

    if (isDatePickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDatePickerOpen]);

  const handleToggleDatePicker = useCallback(() => {
    setIsDatePickerOpen(!isDatePickerOpen);
  }, [isDatePickerOpen]);

  const applyDatePreset = useCallback(
    (preset: "today" | "week" | "month") => {
      const today = new Date();
      let newStartDate: Date;
      let newEndDate: Date = new Date(today);

      switch (preset) {
        case "today":
          newStartDate = new Date(today);
          newEndDate = new Date(today);
          break;
        case "week":
          newStartDate = new Date(today);
          newStartDate.setDate(today.getDate() - 7);
          break;
        case "month":
          newStartDate = getStartOfMonth();
          newEndDate = getEndOfMonth();
          break;
        default:
          return;
      }

      onDateRangeChange(newStartDate, newEndDate);
      setIsDatePickerOpen(false);
    },
    [onDateRangeChange]
  );

  const formatDateForInput = useCallback((date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const handleStartDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const date = new Date(e.target.value);
      if (!isNaN(date.getTime())) {
        const newEndDate = filters.dateRange.endDate || effectiveEndDate;
        if (newEndDate && date > newEndDate) {
          return;
        }
        onDateRangeChange(date, newEndDate);
      }
    },
    [filters.dateRange.endDate, effectiveEndDate, onDateRangeChange]
  );

  const handleEndDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const date = new Date(e.target.value);
      if (!isNaN(date.getTime())) {
        const newStartDate = filters.dateRange.startDate || effectiveStartDate;
        if (newStartDate && date < newStartDate) {
          return;
        }
        onDateRangeChange(newStartDate, date);
      }
    },
    [filters.dateRange.startDate, effectiveStartDate, onDateRangeChange]
  );

  const [minValue, setMinValue] = useState<string>(filters.valueRange.min?.toString() || "");
  const [maxValue, setMaxValue] = useState<string>(filters.valueRange.max?.toString() || "");

  useEffect(() => {
    setMinValue(filters.valueRange.min?.toString() || "");
    setMaxValue(filters.valueRange.max?.toString() || "");
  }, [filters.valueRange]);

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setMinValue(inputValue);

      const numValue = parseFloat(inputValue);
      if (inputValue === "") {
        onValueRangeChange({ ...filters.valueRange, min: undefined });
      } else if (!isNaN(numValue) && numValue >= 0) {
        onValueRangeChange({ ...filters.valueRange, min: numValue });
      }
    },
    [filters.valueRange, onValueRangeChange]
  );

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setMaxValue(inputValue);

      const numValue = parseFloat(inputValue);
      if (inputValue === "") {
        onValueRangeChange({ ...filters.valueRange, max: undefined });
      } else if (!isNaN(numValue) && numValue >= 0) {
        onValueRangeChange({ ...filters.valueRange, max: numValue });
      }
    },
    [filters.valueRange, onValueRangeChange]
  );

  const isInvalidRange =
    filters.valueRange.min !== undefined &&
    filters.valueRange.max !== undefined &&
    filters.valueRange.min > filters.valueRange.max;

  return (
    <div className={styles.filters}>
      <div className={styles.filterHeader}>
        <Text variant="subtitle" weight="semibold" className={styles.filterTitle}>
          Filtros
        </Text>
        {activeFiltersCount > 0 && (
          <span
            className={styles.activeFiltersBadge}
            aria-label={`${activeFiltersCount} filtro(s) ativo(s)`}
          >
            {activeFiltersCount}
          </span>
        )}
      </div>

      {/* Período */}
      <div className={styles.filterGroup}>
        <Text variant="body" weight="medium" className={styles.filterLabel}>
          Período
        </Text>
        <div className={styles.datePickerContainer} ref={datePickerRef}>
          <div
            onClick={handleToggleDatePicker}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleToggleDatePicker();
              }
            }}
            style={{ cursor: "pointer" }}
          >
            <Input
              type="text"
              value={displayDateRange}
              readOnly
              placeholder="DD/MM/YYYY - DD/MM/YYYY"
              trailingIcon="Calendar"
              variant="outlined"
              status="neutral"
              width="100%"
              ariaLabel="Selecionar período"
            />
          </div>
          {isDatePickerOpen && (
            <div className={styles.datePicker}>
              <div className={styles.presets}>
                <Button variant="outlined" onClick={() => applyDatePreset("today")} width="auto">
                  Hoje
                </Button>
                <Button variant="outlined" onClick={() => applyDatePreset("week")} width="auto">
                  Últimos 7 dias
                </Button>
                <Button variant="outlined" onClick={() => applyDatePreset("month")} width="auto">
                  Este mês
                </Button>
              </div>
              <div className={styles.dateInputs}>
                <Input
                  type="date"
                  label="Data Inicial"
                  value={formatDateForInput(effectiveStartDate)}
                  onChange={handleStartDateChange}
                  max={formatDateForInput(effectiveEndDate)}
                  variant="outlined"
                  status="neutral"
                  width="100%"
                />
                <Input
                  type="date"
                  label="Data Final"
                  value={formatDateForInput(effectiveEndDate)}
                  onChange={handleEndDateChange}
                  min={formatDateForInput(effectiveStartDate)}
                  variant="outlined"
                  status="neutral"
                  width="100%"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tipo de Transação */}
      <div className={styles.filterGroup}>
        <Text variant="body" weight="medium" className={styles.filterLabel}>
          Tipo de Transação
        </Text>
        <div className={styles.radioGroup}>
          <Input
            type="radio"
            name="transactionType"
            value="all"
            checked={filters.transactionType === "all"}
            onChange={(e) => onTransactionTypeChange(e.target.value as TransactionTypeFilter)}
            label="Todas"
          />
          <Input
            type="radio"
            name="transactionType"
            value="Credit"
            checked={filters.transactionType === "Credit"}
            onChange={(e) => onTransactionTypeChange(e.target.value as TransactionTypeFilter)}
            label="Crédito"
          />
          <Input
            type="radio"
            name="transactionType"
            value="Debit"
            checked={filters.transactionType === "Debit"}
            onChange={(e) => onTransactionTypeChange(e.target.value as TransactionTypeFilter)}
            label="Débito"
          />
        </div>
      </div>

      {/* Faixa de Valores */}
      <div className={styles.filterGroup}>
        <Text variant="body" weight="medium" className={styles.filterLabel}>
          Faixa de Valores
        </Text>
        <div className={styles.rangeInputs}>
          <div className={styles.rangeInputWrapper}>
            <Input
              type="number"
              label="Mínimo"
              value={minValue}
              onChange={handleMinChange}
              placeholder="0,00"
              min="0"
              step="0.01"
              variant="outlined"
              status={isInvalidRange ? "error" : "neutral"}
              width="100%"
              ariaLabel="Valor mínimo"
              helperText={isInvalidRange ? "Valor inválido" : undefined}
            />
          </div>
          <div className={styles.rangeInputWrapper}>
            <Input
              type="number"
              label="Máximo"
              value={maxValue}
              onChange={handleMaxChange}
              placeholder="0,00"
              min="0"
              step="0.01"
              variant="outlined"
              status={isInvalidRange ? "error" : "neutral"}
              width="100%"
              ariaLabel="Valor máximo"
              helperText={isInvalidRange ? "Valor inválido" : undefined}
            />
          </div>
        </div>
        {isInvalidRange && (
          <Text variant="caption" color="error" className={styles.errorMessage}>
            O valor mínimo não pode ser maior que o máximo
          </Text>
        )}
      </div>

      {/* Botão Limpar Filtros */}
      {activeFiltersCount > 0 && (
        <div className={styles.filterActions}>
          <Button
            variant="outlined"
            onClick={onReset}
            aria-label="Limpar todos os filtros"
            width="auto"
          >
            Limpar Filtros
          </Button>
        </div>
      )}
    </div>
  );
}

export default React.memo(Filters);
