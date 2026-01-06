export interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (_date: Date | null) => void;
  onEndDateChange: (_date: Date | null) => void;
  onDateRangeChange?: (_start: Date | null, _end: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
}

export interface DateInputProps {
  label: string;
  value: Date | null;
  onChange: (_value: string) => void;
  onFocus: () => void;
  onIconClick: () => void;
  ariaLabel: string;
  formatDateForInput: (_date: Date) => string;
}

export interface CalendarHeaderProps {
  currentMonthName: string;
  currentYear: number;
  currentMonth: Date;
  onNavigateMonth: (_direction: "prev" | "next") => void;
  onSelectMonthYear: (_month: number, _year: number) => void;
}

export interface CalendarGridProps {
  calendarDays: (Date | null)[];
  onDateClick: (_day: Date) => void;
  isDateSelected: (_date: Date) => boolean;
  isDateInRange: (_date: Date) => boolean;
  isDateDisabled: (_date: Date) => boolean;
}

export interface CalendarProps {
  startDate: Date | null;
  endDate: Date | null;
  minDate?: Date;
  maxDate?: Date;
  onDateClick: (_day: Date) => void;
  currentMonth: Date;
  onNavigateMonth: (_direction: "prev" | "next") => void;
  onSelectMonthYear: (_month: number, _year: number) => void;
}
