export function formatDate(date: string | Date): string {
  if (!date) {
    return "";
  }

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return "";
  }

  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateRange(startDate: Date, endDate: Date): string {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

export function getLast30DaysStart(): Date {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - 29);
  startDate.setHours(0, 0, 0, 0);
  return startDate;
}

export function getLast30DaysEnd(): Date {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);
  return endDate;
}

/**
 * Calcula a data máxima permitida para busca (hoje)
 * Limite de 90 dias: de hoje - 89 dias até hoje
 */
export function getMaxAllowedDate(): Date {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
}

/**
 * Calcula a data mínima permitida para busca (hoje - 89 dias)
 * Limite de 90 dias: de hoje - 89 dias até hoje
 */
export function getMinAllowedDate(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = new Date(today);
  minDate.setDate(today.getDate() - 89);
  minDate.setHours(0, 0, 0, 0);
  return minDate;
}

/**
 * Valida se uma data está dentro do intervalo permitido de 90 dias (hoje - 89 dias até hoje)
 * @param date Data a ser validada
 * @returns true se a data está dentro do intervalo permitido
 */
export function isDateWithin90DayLimit(date: Date): boolean {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const dateToCheck = new Date(date);
  dateToCheck.setHours(0, 0, 0, 0);

  const minDate = getMinAllowedDate();
  minDate.setHours(0, 0, 0, 0);

  return dateToCheck >= minDate && dateToCheck <= today;
}

/**
 * Valida se um intervalo de datas está dentro do limite de 90 dias (hoje - 89 dias até hoje)
 * @param startDate Data inicial
 * @param endDate Data final
 * @returns true se o intervalo está dentro do limite de 90 dias
 */
export function isDateRangeWithin90DayLimit(startDate: Date, endDate: Date): boolean {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const minDate = getMinAllowedDate();
  minDate.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  if (start < minDate || end > today) {
    return false;
  }

  const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return daysDiff <= 90;
}

/**
 * Corrige uma data para o limite mínimo permitido (hoje - 89 dias) se for anterior
 * ou para o limite máximo (hoje) se for futura
 * @param date Data a ser corrigida
 * @returns Data corrigida
 */
export function clampDateTo90DayLimit(date: Date): Date {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const minDate = getMinAllowedDate();
  minDate.setHours(0, 0, 0, 0);
  const dateToCheck = new Date(date);
  dateToCheck.setHours(0, 0, 0, 0);

  if (dateToCheck < minDate) {
    return minDate;
  }

  if (dateToCheck > today) {
    return today;
  }

  return date;
}

/**
 * Corrige um intervalo de datas para respeitar o limite de 90 dias (hoje - 89 dias até hoje)
 * @param startDate Data inicial
 * @param endDate Data final
 * @returns Objeto com startDate e endDate corrigidos
 */
export function clampDateRangeTo90DayLimit(
  startDate: Date | null,
  endDate: Date | null
): { startDate: Date | null; endDate: Date | null } {
  if (!startDate || !endDate) {
    return { startDate, endDate };
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const minDate = getMinAllowedDate();
  minDate.setHours(0, 0, 0, 0);

  let correctedStart = new Date(startDate);
  let correctedEnd = new Date(endDate);

  correctedStart.setHours(0, 0, 0, 0);
  correctedEnd.setHours(23, 59, 59, 999);

  const daysDiff =
    Math.floor((correctedEnd.getTime() - correctedStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const isWithinDateLimits = correctedStart >= minDate && correctedEnd <= today;
  const isWithin90Days = daysDiff <= 90;

  if (isWithinDateLimits && isWithin90Days) {
    return { startDate: new Date(startDate), endDate: new Date(endDate) };
  }

  if (correctedStart < minDate) {
    correctedStart = new Date(minDate);
    correctedStart.setHours(0, 0, 0, 0);
  }

  if (correctedEnd > today) {
    correctedEnd = new Date(today);
    correctedEnd.setHours(23, 59, 59, 999);
  }

  const finalDaysDiff =
    Math.floor((correctedEnd.getTime() - correctedStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  if (finalDaysDiff > 90) {
    correctedStart = new Date(correctedEnd);
    correctedStart.setDate(correctedStart.getDate() - 89);
    correctedStart.setHours(0, 0, 0, 0);

    if (correctedStart < minDate) {
      correctedStart = new Date(minDate);
      correctedStart.setHours(0, 0, 0, 0);
    }
  }

  return { startDate: correctedStart, endDate: correctedEnd };
}
