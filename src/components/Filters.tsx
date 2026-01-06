import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Text, Input, Dropdown } from "@grupo10-pos-fiap/design-system";
import { TransactionFilters, TransactionTypeFilter, ValueRange } from "@/types/statement";
import DateRangePicker from "./DateRangePicker";
import { getMinAllowedDate, getMaxAllowedDate } from "@/utils/dateUtils";
import styles from "./Filters.module.css";

const MAX_VALUE = 999999.99;

interface FiltersProps {
  filters: TransactionFilters;
  onDateRangeChange: (_start: Date | null, _end: Date | null) => void;
  onTransactionTypeChange: (_type: TransactionTypeFilter) => void;
  onValueRangeChange: (_range: ValueRange) => void;
  onReset: () => void;
  activeFiltersCount: number;
}

function ValueRangeInputs({
  valueRange,
  onValueRangeChange,
}: {
  valueRange: ValueRange;
  onValueRangeChange: (_range: ValueRange) => void;
}) {
  const [minValue, setMinValue] = useState<string>(valueRange.min?.toString() || "");
  const [maxValue, setMaxValue] = useState<string>(valueRange.max?.toString() || "");

  useEffect(() => {
    setMinValue(valueRange.min?.toString() || "");
    setMaxValue(valueRange.max?.toString() || "");
  }, [valueRange]);

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setMinValue(inputValue);

      const numValue = parseFloat(inputValue);
      if (inputValue === "") {
        onValueRangeChange({ ...valueRange, min: undefined });
      } else if (!isNaN(numValue) && numValue >= 0 && numValue <= MAX_VALUE) {
        onValueRangeChange({ ...valueRange, min: numValue });
      }
    },
    [valueRange, onValueRangeChange]
  );

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setMaxValue(inputValue);

      const numValue = parseFloat(inputValue);
      if (inputValue === "") {
        onValueRangeChange({ ...valueRange, max: undefined });
      } else if (!isNaN(numValue) && numValue >= 0 && numValue <= MAX_VALUE) {
        onValueRangeChange({ ...valueRange, max: numValue });
      }
    },
    [valueRange, onValueRangeChange]
  );

  const isInvalidRange =
    valueRange.min !== undefined && valueRange.max !== undefined && valueRange.min > valueRange.max;

  return (
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
            max={MAX_VALUE}
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
            max={MAX_VALUE}
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
  );
}

function Filters({
  filters,
  onDateRangeChange,
  onTransactionTypeChange,
  onValueRangeChange,
  onReset,
  activeFiltersCount,
}: FiltersProps) {
  const minDate = useMemo(() => getMinAllowedDate(), []);
  const maxDate = useMemo(() => getMaxAllowedDate(), []);

  return (
    <div className={styles.filters}>
      <div className={styles.filterHeader}></div>

      <div className={styles.filterRow}>
        <div className={styles.filterGroup}>
          <Text variant="body" weight="medium" className={styles.filterLabel}>
            Período
          </Text>
          <DateRangePicker
            startDate={filters.dateRange.startDate}
            endDate={filters.dateRange.endDate}
            onStartDateChange={(date) => onDateRangeChange(date, filters.dateRange.endDate)}
            onEndDateChange={(date) => onDateRangeChange(filters.dateRange.startDate, date)}
            onDateRangeChange={onDateRangeChange}
            minDate={minDate}
            maxDate={maxDate}
          />
        </div>

        <div className={styles.filterGroup}>
          <Text variant="body" weight="medium" className={styles.filterLabel}>
            Tipo de Transação
          </Text>
          <Dropdown
            items={[
              {
                label: "Todas",
                value: "all",
                onClick: () => onTransactionTypeChange("all"),
              },
              {
                label: "Crédito",
                value: "Credit",
                onClick: () => onTransactionTypeChange("Credit"),
              },
              {
                label: "Débito",
                value: "Debit",
                onClick: () => onTransactionTypeChange("Debit"),
              },
            ]}
            placeholder={
              filters.transactionType === "all"
                ? "Todas"
                : filters.transactionType === "Credit"
                ? "Crédito"
                : "Débito"
            }
            onValueChange={(value) => onTransactionTypeChange(value as TransactionTypeFilter)}
            width="100%"
          />
        </div>
      </div>

      <ValueRangeInputs valueRange={filters.valueRange} onValueRangeChange={onValueRangeChange} />

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
