import React from "react";
import { Text } from "@grupo10-pos-fiap/design-system";
import { DateInputProps } from "./types";
import { CalendarIcon } from "./CalendarIcon";
import styles from "./DateRangePicker.module.css";

export const DateInput = React.memo(
  ({
    label,
    value,
    onChange,
    onFocus,
    onIconClick,
    ariaLabel,
    formatDateForInput,
  }: DateInputProps) => (
    <div className={styles.inputWrapper}>
      <Text variant="body" weight="medium" className={styles.inputLabel}>
        {label}
      </Text>
      <div className={styles.inputGroup}>
        <input
          type="date"
          className={styles.dateInput}
          value={value ? formatDateForInput(value) : ""}
          max={formatDateForInput(new Date())}
          onChange={(e) => onChange(e.target.value)}
          onClick={onFocus}
          aria-label={ariaLabel}
        />
        <button
          type="button"
          className={styles.calendarIcon}
          onClick={onIconClick}
          aria-label={ariaLabel}
        >
          <CalendarIcon />
        </button>
      </div>
    </div>
  )
);

DateInput.displayName = "DateInput";
