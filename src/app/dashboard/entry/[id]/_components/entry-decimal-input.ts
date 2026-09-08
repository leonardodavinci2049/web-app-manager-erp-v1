export function toEntryDecimalInput(value: string): string {
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? parsed.toString().replace(".", ",")
    : value.replace(".", ",");
}

export function parseEntryDecimalInput(value: string): number {
  const normalized = value.trim().replace(/\./g, "").replace(",", ".");
  if (!normalized) return Number.NaN;
  return Number(normalized);
}

export function sanitizeEntryDecimalInput(value: string): string {
  const isNegative = value.trimStart().startsWith("-");
  let cleaned = value.replace(/[^\d,]/g, "");
  const commaIndex = cleaned.indexOf(",");

  if (commaIndex >= 0) {
    const integerPart = cleaned.slice(0, commaIndex);
    const decimalPart = cleaned
      .slice(commaIndex + 1)
      .replace(/,/g, "")
      .slice(0, 4);
    cleaned = `${integerPart},${decimalPart}`;
  }

  return isNegative ? `-${cleaned}` : cleaned;
}
