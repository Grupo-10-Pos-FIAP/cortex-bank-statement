import React, { useState, useRef, useEffect } from "react";
import { DateRangePickerProps } from "./types";
import { DateInput } from "./DateInput";
import { Calendar } from "./Calendar";
import { useDateRangePicker } from "./useDateRangePicker";
import { formatDateForInput } from "./utils";
import { formatDateRange } from "@/utils/dateUtils";
import { CalendarIcon } from "./CalendarIcon";
import { DateValidationAlert } from "./DateValidationAlert";
import styles from "./DateRangePicker.module.css";

function usePresetSelection(
  startDate: Date | null,
  endDate: Date | null,
  onStartDateChange: (_date: Date | null) => void,
  onEndDateChange: (_date: Date | null) => void,
  onDateRangeChange?: (_start: Date | null, _end: Date | null) => void
) {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  useEffect(() => {
    if (startDate && endDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysDiff =
        Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      if (daysDiff === 7 && endDate.getTime() === today.getTime()) {
        setSelectedPreset(7);
      } else if (daysDiff === 15 && endDate.getTime() === today.getTime()) {
        setSelectedPreset(15);
      } else if (daysDiff === 30 && endDate.getTime() === today.getTime()) {
        setSelectedPreset(30);
      } else if (daysDiff === 90 && endDate.getTime() === today.getTime()) {
        setSelectedPreset(90);
      } else {
        setSelectedPreset(null);
      }
    }
  }, [startDate, endDate]);

  const handlePresetClick = (days: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setTime(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
    start.setHours(0, 0, 0, 0);

    onStartDateChange(start);
    onEndDateChange(today);
    onDateRangeChange?.(start, today);
    setSelectedPreset(days);
  };

  const handleManualDateChange = () => {
    setSelectedPreset(null);
  };

  return { selectedPreset, handlePresetClick, handleManualDateChange };
}

function PresetDropdown({
  selectedPreset,
  onPresetClick,
}: {
  selectedPreset: number | null;
  onPresetClick: (_days: number) => void;
}) {
  const presets = [
    { days: 7, label: "Últimos 7 dias" },
    { days: 15, label: "Últimos 15 dias" },
    { days: 30, label: "Últimos 30 dias" },
    { days: 90, label: "Últimos 90 dias" },
  ];

  return (
    <div className={styles.presetOptions}>
      {presets.map((preset) => (
        <label key={preset.days} className={styles.presetOption}>
          <input
            type="checkbox"
            checked={selectedPreset === preset.days}
            onChange={() => onPresetClick(preset.days)}
          />
          <span>{preset.label}</span>
        </label>
      ))}
    </div>
  );
}

function CustomDateInputs({
  startDate,
  endDate,
  onStartInputChange,
  onEndInputChange,
  onManualDateChange,
  startHandlers,
  endHandlers,
}: {
  startDate: Date | null;
  endDate: Date | null;
  onStartInputChange: (_value: string) => void;
  onEndInputChange: (_value: string) => void;
  onManualDateChange: () => void;
  startHandlers: { onFocus: () => void; onIconClick: () => void };
  endHandlers: { onFocus: () => void; onIconClick: () => void };
}) {
  return (
    <div className={styles.customDateInputs}>
      <DateInput
        label="A partir de"
        value={startDate}
        onChange={(value) => {
          onStartInputChange(value);
          onManualDateChange();
        }}
        onFocus={startHandlers.onFocus}
        onIconClick={startHandlers.onIconClick}
        ariaLabel="Data inicial"
        formatDateForInput={formatDateForInput}
      />
      <DateInput
        label="Até"
        value={endDate}
        onChange={(value) => {
          onEndInputChange(value);
          onManualDateChange();
        }}
        onFocus={endHandlers.onFocus}
        onIconClick={endHandlers.onIconClick}
        ariaLabel="Data final"
        formatDateForInput={formatDateForInput}
      />
    </div>
  );
}

function useDropdownClickOutside(
  dropdownRef: React.RefObject<HTMLDivElement>,
  isDropdownOpen: boolean,
  setIsDropdownOpen: (_value: boolean) => void
) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, dropdownRef, setIsDropdownOpen]);
}

function PeriodInputButton({
  periodDisplay,
  hasSelection,
  isDropdownOpen,
  onToggle,
}: {
  periodDisplay: string;
  hasSelection: boolean;
  isDropdownOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={styles.periodInput}
      onClick={onToggle}
      aria-label="Selecionar período"
    >
      <CalendarIcon />
      <span
        className={`${styles.periodText} ${
          hasSelection ? styles.periodValue : styles.periodPlaceholder
        }`}
      >
        {periodDisplay}
      </span>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#606060"
        strokeWidth="2"
        className={isDropdownOpen ? styles.dropdownIconOpen : ""}
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
  );
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onDateRangeChange,
  minDate,
  maxDate,
}: DateRangePickerProps) {
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleValidationError = (message: string) => {
    setValidationMessage(message);
  };

  const {
    isOpen,
    currentMonth,
    containerRef,
    handleStartInputChange,
    handleEndInputChange,
    handleDateClick,
    navigateMonth,
    navigateToMonthYear,
    startHandlers,
    endHandlers,
  } = useDateRangePicker(
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    onDateRangeChange,
    handleValidationError
  );

  const { selectedPreset, handlePresetClick, handleManualDateChange } = usePresetSelection(
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    onDateRangeChange
  );

  useDropdownClickOutside(dropdownRef, isDropdownOpen, setIsDropdownOpen);

  const hasSelection = Boolean(startDate && endDate);
  const periodDisplay =
    hasSelection && startDate && endDate
      ? formatDateRange(startDate, endDate)
      : "Selecione o período";

  return (
    <div className={styles.dateRangePicker} ref={containerRef}>
      <div className={styles.periodInputWrapper} ref={dropdownRef}>
        <PeriodInputButton
          periodDisplay={periodDisplay}
          hasSelection={hasSelection}
          isDropdownOpen={isDropdownOpen}
          onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
        />

        {isDropdownOpen && (
          <div className={styles.periodDropdown}>
            <PresetDropdown selectedPreset={selectedPreset} onPresetClick={handlePresetClick} />
            <CustomDateInputs
              startDate={startDate}
              endDate={endDate}
              onStartInputChange={handleStartInputChange}
              onEndInputChange={handleEndInputChange}
              onManualDateChange={handleManualDateChange}
              startHandlers={startHandlers}
              endHandlers={endHandlers}
            />
          </div>
        )}
      </div>

      {isOpen && (
        <Calendar
          startDate={startDate}
          endDate={endDate}
          minDate={minDate}
          maxDate={maxDate}
          onDateClick={handleDateClick}
          currentMonth={currentMonth}
          onNavigateMonth={navigateMonth}
          onSelectMonthYear={navigateToMonthYear}
        />
      )}

      <DateValidationAlert
        message={validationMessage}
        onDismiss={() => setValidationMessage(null)}
      />
    </div>
  );
}
