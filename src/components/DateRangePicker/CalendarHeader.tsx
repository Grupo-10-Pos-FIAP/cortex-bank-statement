import React, { useState, useRef, useEffect } from "react";
import { CalendarHeaderProps } from "./types";
import { MonthYearSelector } from "./MonthYearSelector";
import styles from "./DateRangePicker.module.css";

export const CalendarHeader = React.memo(
  ({
    currentMonthName,
    currentYear,
    currentMonth,
    onNavigateMonth,
    onSelectMonthYear,
  }: CalendarHeaderProps) => {
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const selectorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
          setIsSelectorOpen(false);
        }
      };

      if (isSelectorOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isSelectorOpen]);

    const handleSelectorClick = () => {
      setIsSelectorOpen((prev) => !prev);
    };

    const handleSelectMonthYear = (month: number, year: number) => {
      onSelectMonthYear(month, year);
      setIsSelectorOpen(false);
    };

    return (
      <div className={styles.calendarHeader}>
        <button
          type="button"
          className={styles.navButton}
          onClick={() => onNavigateMonth("prev")}
          aria-label="Mês anterior"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div className={styles.monthYearSelector} ref={selectorRef}>
          <button
            type="button"
            className={styles.monthYearButton}
            onClick={handleSelectorClick}
            aria-label="Selecionar mês e ano"
          >
            <span className={styles.monthYear}>
              {currentMonthName} de {currentYear}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={isSelectorOpen ? styles.dropdownIconOpen : ""}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          {isSelectorOpen && (
            <MonthYearSelector
              currentMonth={currentMonth.getMonth()}
              currentYear={currentYear}
              onSelectMonthYear={handleSelectMonthYear}
              onClose={() => setIsSelectorOpen(false)}
            />
          )}
        </div>
        <button
          type="button"
          className={styles.navButton}
          onClick={() => onNavigateMonth("next")}
          aria-label="Próximo mês"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    );
  }
);

CalendarHeader.displayName = "CalendarHeader";
