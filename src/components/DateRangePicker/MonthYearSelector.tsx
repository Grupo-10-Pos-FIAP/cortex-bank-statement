import React, { useMemo, useState } from "react";
import { MONTHS } from "./constants";
import styles from "./DateRangePicker.module.css";

interface MonthYearSelectorProps {
  currentMonth: number;
  currentYear: number;
  onSelectMonthYear: (_month: number, _year: number) => void;
  onClose: () => void;
}

export const MonthYearSelector = React.memo(
  ({ currentMonth, currentYear, onSelectMonthYear, onClose }: MonthYearSelectorProps) => {
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const today = useMemo(() => new Date(), []);
    const currentYearValue = today.getFullYear();
    const currentMonthValue = today.getMonth();

    const availableYears = useMemo(() => {
      const years: number[] = [];
      const startYear = 2024;
      const endYear = Math.min(2026, currentYearValue);
      for (let year = startYear; year <= endYear; year++) {
        years.push(year);
      }
      return years;
    }, [currentYearValue]);

    const isMonthDisabled = useMemo(
      () => (_month: number, _year: number) => {
        if (_year < currentYearValue) return false;
        if (_year > currentYearValue) return true;
        return _month > currentMonthValue;
      },
      [currentYearValue, currentMonthValue]
    );

    const handleYearClick = (year: number) => {
      setSelectedYear(year);
    };

    const handleMonthClick = (month: number) => {
      if (!isMonthDisabled(month, selectedYear)) {
        onSelectMonthYear(month, selectedYear);
        onClose();
      }
    };

    return (
      <div
        className={styles.monthYearSelectorDropdown}
        role="region"
        aria-label="Seletor de mês e ano"
      >
        <div className={styles.yearsContainer}>
          {availableYears.map((year) => (
            <button
              key={year}
              type="button"
              className={`${styles.yearButton} ${
                year === selectedYear ? styles.yearButtonActive : ""
              }`}
              onClick={() => handleYearClick(year)}
            >
              {year}
            </button>
          ))}
        </div>
        <div className={styles.monthsContainer}>
          {MONTHS.map((monthName, monthIndex) => {
            const isDisabled = isMonthDisabled(monthIndex, selectedYear);
            const isSelected = monthIndex === currentMonth && selectedYear === currentYear;
            return (
              <button
                key={`month-${selectedYear}-${monthName}`}
                type="button"
                className={`${styles.monthButton} ${isSelected ? styles.monthButtonActive : ""} ${
                  isDisabled ? styles.monthButtonDisabled : ""
                }`}
                onClick={() => handleMonthClick(monthIndex)}
                disabled={isDisabled}
              >
                {monthName}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);

MonthYearSelector.displayName = "MonthYearSelector";
