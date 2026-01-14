import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Text, Input, Dropdown } from "@grupo10-pos-fiap/design-system";
import { TransactionFilters, TransactionTypeFilter, ValueRange } from "@/types/statement";
import DateRangePicker from "./DateRangePicker";
import { getMinAllowedDate, getMaxAllowedDate } from "@/utils/dateUtils";
import styles from "./Filters.module.css";

const MAX_VALUE = 999999.99;

const TRANSACTION_TYPE_OPTIONS = [
  { label: "Todas", value: "all" },
  { label: "Crédito", value: "Credit" },
  { label: "Débito", value: "Debit" },
] as const;

interface FiltersProps {
  filters: TransactionFilters;
  onDateRangeChange: (_start: Date | null, _end: Date | null) => void;
  onTransactionTypeChange: (_type: TransactionTypeFilter) => void;
  onValueRangeChange: (_range: ValueRange) => void;
  onReset: () => void;
  activeFiltersCount: number;
}

interface FilterDropdownProps {
  label: string;
  items: Array<{ label: string; value: string; onClick: () => void }>;
  placeholder: string;
  onValueChange?: (_value: string) => void;
}

const FilterDropdown = React.memo(
  ({ label, items, placeholder, onValueChange }: FilterDropdownProps) => (
    <div className={styles.filterGroup}>
      <div className={styles.dropdownWrapper}>
        <Dropdown
          label={label}
          items={items}
          placeholder={placeholder}
          onValueChange={onValueChange}
          width="100%"
        />
      </div>
    </div>
  )
);

FilterDropdown.displayName = "FilterDropdown";

interface FilterWrapperProps {
  label: string;
  children: React.ReactNode;
}

const FilterWrapper = React.memo(({ label, children }: FilterWrapperProps) => (
  <div className={styles.filterGroup}>
    <Text variant="small" weight="medium" className={styles.filterLabel}>
      {label}
    </Text>
    <div className={styles.dropdownWrapper}>{children}</div>
  </div>
));

FilterWrapper.displayName = "FilterWrapper";

interface NumberInputProps {
  label: string;
  value: string;
  onChange: (_e: React.ChangeEvent<HTMLInputElement>) => void;
  hasError: boolean;
  errorText?: string;
}

const NumberInput = React.memo(
  ({ label, value, onChange, hasError, errorText }: NumberInputProps) => (
    <div className={styles.rangeInputWrapper}>
      <Input
        type="number"
        label={label}
        value={value}
        onChange={onChange}
        placeholder="0,00"
        min="0"
        max={MAX_VALUE}
        step="0.01"
        variant="outlined"
        status={hasError ? "error" : "neutral"}
        width="100%"
        ariaLabel={`Valor ${label.toLowerCase()}`}
        helperText={hasError ? errorText : undefined}
      />
    </div>
  )
);

NumberInput.displayName = "NumberInput";

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

  const handleValueChange = useCallback(
    (type: "min" | "max") => (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const setter = type === "min" ? setMinValue : setMaxValue;
      setter(inputValue);

      const numValue = parseFloat(inputValue);
      if (inputValue === "") {
        onValueRangeChange({ ...valueRange, [type]: undefined });
      } else if (!isNaN(numValue) && numValue >= 0 && numValue <= MAX_VALUE) {
        onValueRangeChange({ ...valueRange, [type]: numValue });
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
        <NumberInput
          label="Mínimo"
          value={minValue}
          onChange={handleValueChange("min")}
          hasError={isInvalidRange}
          errorText="Valor inválido"
        />
        <NumberInput
          label="Máximo"
          value={maxValue}
          onChange={handleValueChange("max")}
          hasError={isInvalidRange}
          errorText="Valor inválido"
        />
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

  const transactionTypeLabel = useMemo(() => {
    const option = TRANSACTION_TYPE_OPTIONS.find((opt) => opt.value === filters.transactionType);
    return option?.label || "Todas";
  }, [filters.transactionType]);

  const transactionTypeItems = useMemo(
    () =>
      TRANSACTION_TYPE_OPTIONS.map((option) => ({
        ...option,
        onClick: () => onTransactionTypeChange(option.value as TransactionTypeFilter),
      })),
    [onTransactionTypeChange]
  );

  return (
    <div className={styles.filters}>
      <div className={styles.filterRow}>
        <FilterWrapper label="Período">
          <DateRangePicker
            startDate={filters.dateRange.startDate}
            endDate={filters.dateRange.endDate}
            onStartDateChange={(date) => onDateRangeChange(date, filters.dateRange.endDate)}
            onEndDateChange={(date) => onDateRangeChange(filters.dateRange.startDate, date)}
            onDateRangeChange={onDateRangeChange}
            minDate={minDate}
            maxDate={maxDate}
          />
        </FilterWrapper>

        <FilterDropdown
          label="Tipo de Transação"
          items={transactionTypeItems}
          placeholder={transactionTypeLabel}
          onValueChange={(value) => onTransactionTypeChange(value as TransactionTypeFilter)}
        />
      </div>

      <ValueRangeInputs valueRange={filters.valueRange} onValueRangeChange={onValueRangeChange} />

      {activeFiltersCount > 0 && (
        <div className={styles.filterActions}>
          <Button
            variant="primary"
            onClick={onReset}
            aria-label="Limpar todos os filtros"
            width="120px"
          >
            Limpar Filtros
          </Button>
        </div>
      )}
    </div>
  );
}

export default React.memo(Filters);
