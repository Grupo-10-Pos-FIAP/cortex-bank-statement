import React from "react";
import { formatDate } from "@/utils/dateUtils";
import { CalendarGridProps } from "./types";
import { WEEKDAYS, WEEKDAY_NAMES } from "./constants";
import styles from "./DateRangePicker.module.css";

export const CalendarGrid = React.memo(
  ({
    calendarDays,
    onDateClick,
    isDateSelected,
    isDateInRange,
    isDateDisabled,
  }: CalendarGridProps) => (
    <div className={styles.calendarGrid}>
      <div className={styles.weekdays}>
        {WEEKDAYS.map((day, index) => (
          <div key={`weekday-${WEEKDAY_NAMES[index]}`} className={styles.weekday}>
            {day}
          </div>
        ))}
      </div>
      <div className={styles.days}>
        {calendarDays.map((day, gridPosition) => {
          if (!day) {
            const row = Math.floor(gridPosition / 7);
            const col = gridPosition % 7;
            return <div key={`empty-${row}-${col}`} className={styles.dayEmpty} />;
          }

          const isSelected = isDateSelected(day);
          const isInRange = isDateInRange(day);
          const isDisabled = isDateDisabled(day);
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <button
              key={day.toISOString()}
              type="button"
              className={`${styles.day} ${isSelected ? styles.daySelected : ""} ${
                isInRange ? styles.dayInRange : ""
              } ${isDisabled ? styles.dayDisabled : ""} ${isToday ? styles.dayToday : ""}`}
              onClick={() => !isDisabled && onDateClick(day)}
              disabled={isDisabled}
              aria-label={`Selecionar ${formatDate(day)}`}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  )
);

CalendarGrid.displayName = "CalendarGrid";
