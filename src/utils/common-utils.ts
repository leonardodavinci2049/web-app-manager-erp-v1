export function formatCurrency(value: number | null | undefined): string {
  // Handle null, undefined, or invalid numbers
  const numericValue =
    typeof value === "number" && !Number.isNaN(value) ? value : 0;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numericValue);
}

export function formatPriceValue(value: number | null | undefined): string {
  const numericValue =
    typeof value === "number" && !Number.isNaN(value) ? value : 0;

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
