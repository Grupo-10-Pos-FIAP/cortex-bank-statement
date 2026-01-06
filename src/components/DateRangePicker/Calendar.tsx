import React, { useMemo } from "react";
import { CalendarProps } from "./types";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarGrid } from "./CalendarGrid";
import { getDaysInMonth, createDateValidators } from "./utils";
import { MONTHS } from "./constants";
import styles from "./DateRangePicker.module.css";

export const Calendar = React.memo(
  ({
    startDate,
    endDate,
    minDate,
    maxDate,
    onDateClick,
    currentMonth,
    onNavigateMonth,
    onSelectMonthYear,
  }: CalendarProps) => {
    const calendarDays = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);
    const { isDateInRange, isDateSelected, isDateDisabled } = useMemo(
      () => createDateValidators(startDate, endDate, minDate, maxDate),
      [startDate, endDate, minDate, maxDate]
    );
    const currentMonthName = MONTHS[currentMonth.getMonth()];
    const currentYear = currentMonth.getFullYear();

    return (
      <div className={styles.calendarContainer}>
        <CalendarHeader
          currentMonthName={currentMonthName}
          currentYear={currentYear}
          currentMonth={currentMonth}
          onNavigateMonth={onNavigateMonth}
          onSelectMonthYear={onSelectMonthYear}
        />
        <CalendarGrid
          calendarDays={calendarDays}
          onDateClick={onDateClick}
          isDateSelected={isDateSelected}
          isDateInRange={isDateInRange}
          isDateDisabled={isDateDisabled}
        />
      </div>
    );
  }
);

Calendar.displayName = "Calendar";
