export function formatCurrency(value: number): string {
  if (typeof value !== "number" || isNaN(value)) {
    return "R$ 0,00";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatValue(value: number): string {
  if (typeof value !== "number" || isNaN(value)) {
    return "0,00";
  }

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Aplica máscara de moeda brasileira (R$ 0,00) em um valor de entrada
 * @param value - Valor numérico ou string a ser formatado
 * @returns String formatada como moeda brasileira (ex: "R$ 1.234,56")
 */
export function maskCurrency(value: number | string): string {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  if (typeof value === "number") {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  const numericValue = String(value).replace(/\D/g, "");

  if (numericValue === "") {
    return "";
  }

  const numberValue = Number(numericValue) / 100;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numberValue);
}

/**
 * Remove a máscara de moeda e retorna o valor numérico
 * @param maskedValue - String com valor formatado (ex: "R$ 1.234,56")
 * @returns Número correspondente (ex: 1234.56) ou undefined se vazio
 */
export function unmaskCurrency(maskedValue: string): number | undefined {
  if (!maskedValue || maskedValue.trim() === "") {
    return undefined;
  }

  const numericValue = maskedValue.replace(/\D/g, "");

  if (numericValue === "") {
    return undefined;
  }

  const numberValue = Number(numericValue) / 100;

  if (isNaN(numberValue)) {
    return undefined;
  }

  return numberValue;
}
