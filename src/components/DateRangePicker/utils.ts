import {
  getMaxAllowedDate,
  getMinAllowedDate,
  clampDateTo90DayLimit,
  clampDateRangeTo90DayLimit,
  isDateWithin90DayLimit,
  formatDate,
} from "@/utils/dateUtils";

export const getDaysInMonth = (date: Date): (Date | null)[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startingDayOfWeek = firstDay.getDay();
  const days: (Date | null)[] = [];

  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }

  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  return days;
};

export const formatDateForInput = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

function validateAndClampDateRange(
  start: Date | null,
  end: Date | null,
  onValidationError?: (_message: string) => void
): { startDate: Date | null; endDate: Date | null } {
  const { startDate: clampedStart, endDate: clampedEnd } = clampDateRangeTo90DayLimit(start, end);

  if (!clampedStart || !clampedEnd || !start || !end) {
    return { startDate: clampedStart, endDate: clampedEnd };
  }

  const originalStart = new Date(start);
  originalStart.setHours(0, 0, 0, 0);
  const originalEnd = new Date(end);
  originalEnd.setHours(23, 59, 59, 999);

  const clampedStartDate = new Date(clampedStart);
  clampedStartDate.setHours(0, 0, 0, 0);
  const clampedEndDate = new Date(clampedEnd);
  clampedEndDate.setHours(23, 59, 59, 999);

  const startChanged = clampedStartDate.getTime() !== originalStart.getTime();
  const endChanged = clampedEndDate.getTime() !== originalEnd.getTime();

  if (startChanged || endChanged) {
    const minDateFormatted = formatDate(getMinAllowedDate());
    const maxDateFormatted = formatDate(getMaxAllowedDate());
    onValidationError?.(
      `O período selecionado está fora do limite de 90 dias (${minDateFormatted} até ${maxDateFormatted}). As datas foram ajustadas.`
    );
  }

  return { startDate: clampedStart, endDate: clampedEnd };
}

function handleStartDateChange(
  correctedDate: Date,
  endDate: Date | null,
  onStartDateChange: (_date: Date | null) => void,
  onEndDateChange: (_date: Date | null) => void,
  onDateRangeChange?: (_start: Date | null, _end: Date | null) => void,
  onValidationError?: (_message: string) => void
) {
  if (endDate && correctedDate > endDate) {
    const { startDate: clampedStart, endDate: clampedEnd } = validateAndClampDateRange(
      endDate,
      correctedDate,
      onValidationError
    );
    onStartDateChange(clampedStart);
    onEndDateChange(clampedEnd);
    onDateRangeChange?.(clampedStart, clampedEnd);
  } else {
    const { startDate: clampedStart, endDate: clampedEnd } = validateAndClampDateRange(
      correctedDate,
      endDate,
      onValidationError
    );
    onStartDateChange(clampedStart);
    onDateRangeChange?.(clampedStart, clampedEnd);
  }
}

function handleEndDateChange(
  correctedDate: Date,
  startDate: Date | null,
  onStartDateChange: (_date: Date | null) => void,
  onEndDateChange: (_date: Date | null) => void,
  onDateRangeChange?: (_start: Date | null, _end: Date | null) => void,
  onValidationError?: (_message: string) => void
) {
  if (startDate && correctedDate < startDate) {
    const { startDate: clampedStart, endDate: clampedEnd } = validateAndClampDateRange(
      correctedDate,
      startDate,
      onValidationError
    );
    onStartDateChange(clampedStart);
    onEndDateChange(clampedEnd);
    onDateRangeChange?.(clampedStart, clampedEnd);
  } else {
    const { startDate: clampedStart, endDate: clampedEnd } = validateAndClampDateRange(
      startDate,
      correctedDate,
      onValidationError
    );
    onEndDateChange(clampedEnd);
    onDateRangeChange?.(clampedStart, clampedEnd);
  }
}

export const createInputChangeHandler = (
  type: "start" | "end",
  startDate: Date | null,
  endDate: Date | null,
  onStartDateChange: (_date: Date | null) => void,
  onEndDateChange: (_date: Date | null) => void,
  onDateRangeChange?: (_start: Date | null, _end: Date | null) => void,
  onValidationError?: (_message: string) => void
) => {
  return (value: string) => {
    let day: number, month: number, year: number;

    if (value.includes("/")) {
      const parts = value.split("/").map(Number);
      if (parts.length !== 3) return;
      [day, month, year] = parts;
    } else if (value.includes("-")) {
      const parts = value.split("-").map(Number);
      if (parts.length !== 3) return;
      [year, month, day] = parts;
    } else {
      return;
    }

    const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));

    if (isNaN(date.getTime())) {
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);

    if (dateToCheck > today) {
      return;
    }

    let correctedDate = date;
    const minDate = getMinAllowedDate();
    const maxDate = getMaxAllowedDate();
    const dateToValidate = new Date(date);
    dateToValidate.setHours(0, 0, 0, 0);

    if (dateToValidate < minDate || dateToValidate > maxDate) {
      correctedDate = clampDateTo90DayLimit(date);
      const minDateFormatted = formatDate(minDate);
      const maxDateFormatted = formatDate(maxDate);
      onValidationError?.(
        `A data inserida está fora do limite de 90 dias (${minDateFormatted} até ${maxDateFormatted}). A data foi ajustada.`
      );
    }

    if (type === "start") {
      handleStartDateChange(
        correctedDate,
        endDate,
        onStartDateChange,
        onEndDateChange,
        onDateRangeChange,
        onValidationError
      );
    } else {
      handleEndDateChange(
        correctedDate,
        startDate,
        onStartDateChange,
        onEndDateChange,
        onDateRangeChange,
        onValidationError
      );
    }
  };
};

export const createDateClickHandler = (
  selectingStart: boolean,
  startDate: Date | null,
  endDate: Date | null,
  onStartDateChange: (_date: Date | null) => void,
  onEndDateChange: (_date: Date | null) => void,
  onDateRangeChange: (_start: Date | null, _end: Date | null) => void | undefined,
  setSelectingStart: (_value: boolean) => void,
  setIsOpen: (_value: boolean) => void,
  onValidationError?: (_message: string) => void
) => {
  return (day: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayToCheck = new Date(day);
    dayToCheck.setHours(0, 0, 0, 0);

    if (!isDateWithin90DayLimit(day)) {
      return;
    }

    if (selectingStart || !startDate) {
      const newStart = day;
      const { startDate: clampedStart, endDate: clampedEnd } = clampDateRangeTo90DayLimit(
        newStart,
        endDate
      );

      if (clampedStart && clampedEnd && endDate) {
        const newStartDate = new Date(newStart);
        newStartDate.setHours(0, 0, 0, 0);
        const endDateDate = new Date(endDate);
        endDateDate.setHours(23, 59, 59, 999);
        const clampedStartDate = new Date(clampedStart);
        clampedStartDate.setHours(0, 0, 0, 0);
        const clampedEndDate = new Date(clampedEnd);
        clampedEndDate.setHours(23, 59, 59, 999);

        const startChanged = clampedStartDate.getTime() !== newStartDate.getTime();
        const endChanged = clampedEndDate.getTime() !== endDateDate.getTime();

        if (startChanged || endChanged) {
          const minDateFormatted = formatDate(getMinAllowedDate());
          const maxDateFormatted = formatDate(getMaxAllowedDate());
          onValidationError?.(
            `O período selecionado está fora do limite de 90 dias (${minDateFormatted} até ${maxDateFormatted}). As datas foram ajustadas.`
          );
        }
      }

      onStartDateChange(clampedStart);
      setSelectingStart(false);
      onDateRangeChange?.(clampedStart, clampedEnd);
      setIsOpen(false);
    } else {
      let newStart = startDate;
      let newEnd = day;

      if (day < startDate) {
        newStart = day;
        newEnd = startDate;
      }

      const { startDate: clampedStart, endDate: clampedEnd } = clampDateRangeTo90DayLimit(
        newStart,
        newEnd
      );

      if (clampedStart && clampedEnd) {
        const newStartDate = new Date(newStart);
        newStartDate.setHours(0, 0, 0, 0);
        const newEndDate = new Date(newEnd);
        newEndDate.setHours(23, 59, 59, 999);
        const clampedStartDate = new Date(clampedStart);
        clampedStartDate.setHours(0, 0, 0, 0);
        const clampedEndDate = new Date(clampedEnd);
        clampedEndDate.setHours(23, 59, 59, 999);

        const startChanged = clampedStartDate.getTime() !== newStartDate.getTime();
        const endChanged = clampedEndDate.getTime() !== newEndDate.getTime();

        if (startChanged || endChanged) {
          const minDateFormatted = formatDate(getMinAllowedDate());
          const maxDateFormatted = formatDate(getMaxAllowedDate());
          onValidationError?.(
            `O período selecionado está fora do limite de 90 dias (${minDateFormatted} até ${maxDateFormatted}). As datas foram ajustadas.`
          );
        }
      }

      onStartDateChange(clampedStart);
      onEndDateChange(clampedEnd);
      onDateRangeChange?.(clampedStart, clampedEnd);
      setSelectingStart(true);
      setIsOpen(false);
    }
  };
};

export const createDateValidators = (
  startDate: Date | null,
  endDate: Date | null,
  _minDate?: Date,
  _maxDate?: Date
) => {
  const minAllowedDate = getMinAllowedDate();
  const maxAllowedDate = getMaxAllowedDate();

  const effectiveMinDate = _minDate
    ? _minDate > minAllowedDate
      ? _minDate
      : minAllowedDate
    : minAllowedDate;
  const effectiveMaxDate = _maxDate
    ? _maxDate < maxAllowedDate
      ? _maxDate
      : maxAllowedDate
    : maxAllowedDate;

  return {
    isDateInRange: (_date: Date) => {
      if (!startDate || !endDate) return false;
      return _date >= startDate && _date <= endDate;
    },
    isDateSelected: (_date: Date) => {
      if (!startDate && !endDate) return false;
      const dateStr = _date.toDateString();
      return startDate?.toDateString() === dateStr || endDate?.toDateString() === dateStr;
    },
    isDateDisabled: (_date: Date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dateToCheck = new Date(_date);
      dateToCheck.setHours(0, 0, 0, 0);

      if (dateToCheck > today) return true;
      if (dateToCheck < effectiveMinDate) return true;
      if (dateToCheck > effectiveMaxDate) return true;
      return false;
    },
  };
};
