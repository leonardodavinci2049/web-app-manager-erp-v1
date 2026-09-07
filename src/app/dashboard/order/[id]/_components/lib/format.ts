import { formatCurrency } from "@/utils/common-utils";

export function formatOrderMoney(value: string | number): string {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? formatCurrency(numericValue) : "—";
}

export function formatOrderDateTime(value?: string): string {
  if (!value) return "Não informado";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Não informado";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatOrderCount(value: number): string {
  return Number.isFinite(value) ? value.toLocaleString("pt-BR") : "—";
}

export function formatWarranty(months: number, days: number): string {
  const parts: string[] = [];
  if (months > 0) parts.push(`${months} ${months === 1 ? "mês" : "meses"}`);
  if (days > 0) parts.push(`${days} ${days === 1 ? "dia" : "dias"}`);
  return parts.join(" e ") || "Não informada";
}
