import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createInputChangeHandler, createDateClickHandler } from "./utils";

const getInitialMonth = (startDate: Date | null, endDate: Date | null): Date => {
  if (startDate) return new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  if (endDate) return new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  return new Date();
};

function useClickOutside(
  containerRef: React.RefObject<HTMLDivElement>,
  isOpen: boolean,
  setIsOpen: (_value: boolean) => void
) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, containerRef, setIsOpen]);
}

function useCurrentMonthSync(
  isOpen: boolean,
  selectingStart: boolean,
  startDate: Date | null,
  endDate: Date | null,
  setCurrentMonth: (_date: Date) => void
) {
  useEffect(() => {
    if (isOpen) {
      const dateToShow = selectingStart ? startDate : endDate;
      if (dateToShow) {
        setCurrentMonth(new Date(dateToShow.getFullYear(), dateToShow.getMonth(), 1));
      }
    }
  }, [isOpen, selectingStart, startDate, endDate, setCurrentMonth]);
}

function useInputHandlers(
  isOpen: boolean,
  startDate: Date | null,
  endDate: Date | null,
  setCurrentMonth: (_date: Date) => void,
  setIsOpen: (_value: boolean) => void,
  setSelectingStart: (_value: boolean) => void
) {
  const createInputHandlers = useCallback(
    (isStart: boolean) => ({
      onFocus: () => {
        const dateToShow = isStart ? startDate : endDate;
        if (dateToShow) {
          setCurrentMonth(new Date(dateToShow.getFullYear(), dateToShow.getMonth(), 1));
        }
        setIsOpen(true);
        setSelectingStart(isStart);
      },
      onIconClick: () => {
        if (!isOpen) {
          const dateToShow = isStart ? startDate : endDate;
          if (dateToShow) {
            setCurrentMonth(new Date(dateToShow.getFullYear(), dateToShow.getMonth(), 1));
          }
        }
        setIsOpen(!isOpen);
        setSelectingStart(isStart);
      },
    }),
    [isOpen, startDate, endDate, setCurrentMonth, setIsOpen, setSelectingStart]
  );

  const startHandlers = useMemo(() => createInputHandlers(true), [createInputHandlers]);
  const endHandlers = useMemo(() => createInputHandlers(false), [createInputHandlers]);

  return { startHandlers, endHandlers };
}

export const useDateRangePicker = (
  startDate: Date | null,
  endDate: Date | null,
  onStartDateChange: (_date: Date | null) => void,
  onEndDateChange: (_date: Date | null) => void,
  onDateRangeChange?: (_start: Date | null, _end: Date | null) => void,
  onValidationError?: (_message: string) => void
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => getInitialMonth(startDate, endDate));
  const [selectingStart, setSelectingStart] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStartInputChange = useMemo(
    () =>
      createInputChangeHandler(
        "start",
        startDate,
        endDate,
        onStartDateChange,
        onEndDateChange,
        onDateRangeChange,
        onValidationError
      ),
    [startDate, endDate, onStartDateChange, onEndDateChange, onDateRangeChange, onValidationError]
  );

  const handleEndInputChange = useMemo(
    () =>
      createInputChangeHandler(
        "end",
        startDate,
        endDate,
        onStartDateChange,
        onEndDateChange,
        onDateRangeChange,
        onValidationError
      ),
    [startDate, endDate, onStartDateChange, onEndDateChange, onDateRangeChange, onValidationError]
  );

  const handleDateClick = useMemo(
    () =>
      createDateClickHandler(
        selectingStart,
        startDate,
        endDate,
        onStartDateChange,
        onEndDateChange,
        onDateRangeChange,
        setSelectingStart,
        setIsOpen,
        onValidationError
      ),
    [
      selectingStart,
      startDate,
      endDate,
      onStartDateChange,
      onEndDateChange,
      onDateRangeChange,
      setIsOpen,
      onValidationError,
    ]
  );

  const navigateMonth = useCallback((direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "prev" ? -1 : 1));
      return newDate;
    });
  }, []);

  const navigateToMonthYear = useCallback((_month: number, _year: number) => {
    const newDate = new Date(_year, _month, 1);
    setCurrentMonth(newDate);
  }, []);

  const { startHandlers, endHandlers } = useInputHandlers(
    isOpen,
    startDate,
    endDate,
    setCurrentMonth,
    setIsOpen,
    setSelectingStart
  );

  useClickOutside(containerRef, isOpen, setIsOpen);
  useCurrentMonthSync(isOpen, selectingStart, startDate, endDate, setCurrentMonth);

  return {
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
  };
};
