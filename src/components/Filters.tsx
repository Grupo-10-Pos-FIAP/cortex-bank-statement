import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Text, Input, Dropdown } from "@grupo10-pos-fiap/design-system";
import { TransactionFilters, TransactionTypeFilter, ValueRange } from "@/types/statement";
import DateRangePicker from "./DateRangePicker";
import { getMinAllowedDate, getMaxAllowedDate } from "@/utils/dateUtils";
import { maskCurrency, unmaskCurrency } from "@/utils/formatters";
import { EraserIcon } from "./Filters/EraserIcon";
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
  value?: string;
  onValueChange?: (_value: string) => void;
}

const FilterDropdown = React.memo(
  ({ label, items, placeholder, value, onValueChange }: FilterDropdownProps) => (
    <div className={styles.filterGroup}>
      <div className={styles.dropdownWrapper}>
        <Dropdown
          key={value}
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
        type="text"
        label={label}
        value={value}
        onChange={onChange}
        placeholder="R$ 0,00"
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
  const [minValue, setMinValue] = useState<string>(
    valueRange.min !== undefined ? maskCurrency(valueRange.min) : ""
  );
  const [maxValue, setMaxValue] = useState<string>(
    valueRange.max !== undefined ? maskCurrency(valueRange.max) : ""
  );

  useEffect(() => {
    setMinValue(valueRange.min !== undefined ? maskCurrency(valueRange.min) : "");
    setMaxValue(valueRange.max !== undefined ? maskCurrency(valueRange.max) : "");
  }, [valueRange]);

  const handleValueChange = useCallback(
    (type: "min" | "max") => (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const setter = type === "min" ? setMinValue : setMaxValue;

      if (inputValue === "") {
        setter("");
        onValueRangeChange({ ...valueRange, [type]: undefined });
        return;
      }

      const maskedValue = maskCurrency(inputValue);
      setter(maskedValue);

      const numValue = unmaskCurrency(maskedValue);

      if (numValue === undefined) {
        onValueRangeChange({ ...valueRange, [type]: undefined });
      } else if (numValue >= 0 && numValue <= MAX_VALUE) {
        onValueRangeChange({ ...valueRange, [type]: numValue });
      }
    },
    [valueRange, onValueRangeChange]
  );

  const isInvalidRange =
    valueRange.min !== undefined && valueRange.max !== undefined && valueRange.min > valueRange.max;

  return (
    <div className={styles.filterGroup}>
      <div className={styles.rangeInputs}>
        <NumberInput
          label="Valor mínimo"
          value={minValue}
          onChange={handleValueChange("min")}
          hasError={isInvalidRange}
          errorText="Valor inválido"
        />
        <NumberInput
          label="Valor máximo"
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
          value={filters.transactionType}
          onValueChange={(value) => onTransactionTypeChange(value as TransactionTypeFilter)}
        />
      </div>

      <ValueRangeInputs valueRange={filters.valueRange} onValueRangeChange={onValueRangeChange} />

      {activeFiltersCount > 0 && (
        <div className={styles.filterActions}>
          <div className={styles.clearButtonWrapper}>
            <Button variant="primary" onClick={onReset} aria-label="Limpar todos os filtros">
              <span className={styles.clearButtonContent}>
                <EraserIcon />
                Limpar Filtros
              </span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(Filters);
