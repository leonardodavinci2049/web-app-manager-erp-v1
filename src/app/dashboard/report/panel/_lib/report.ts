import { z } from "zod";
import {
  civilDate,
  fortalezaDate,
  type Period,
  shiftDay,
  validatePeriod,
} from "./period";

const integer = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const count = z
  .union([z.number(), z.string().regex(/^\d+(\.\d+)?$/)])
  .pipe(
    z.coerce
      .number<string | number>()
      .finite()
      .nonnegative()
      .max(Number.MAX_SAFE_INTEGER),
  );
const totalCount = z
  .union([integer, z.string().regex(/^\d+$/)])
  .pipe(
    z.coerce
      .number<string | number>()
      .int()
      .nonnegative()
      .max(Number.MAX_SAFE_INTEGER),
  );
const money = z
  .string()
  .regex(/^-?\d+(\.\d+)?$/)
  .transform(toCents);

export function toCents(value: string): number {
  if (!/^-?\d+(\.\d+)?$/.test(value)) throw new Error("Invalid decimal");
  const negative = value.startsWith("-");
  const [whole, fraction = ""] = value.replace(/^-/, "").split(".");
  const cents =
    BigInt(whole) * BigInt(100) +
    BigInt(fraction.padEnd(2, "0").slice(0, 2)) +
    BigInt(Number(fraction[2] ?? 0) >= 5 ? 1 : 0);
  const result = Number(negative ? -cents : cents);
  if (!Number.isSafeInteger(result)) throw new Error("Unsafe monetary amount");
  return result;
}

function orderDate(value: string): string {
  civilDate(value.slice(0, 10));
  if (value.length === 10) return value;
  // SQL DATETIME is a local civil value; ISO timestamps carry their offset.
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(value)) {
    if (!Number.isFinite(Date.parse(`${value.replace(" ", "T")}-03:00`)))
      throw new Error("Invalid order date");
    return value.slice(0, 10);
  }
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(
      value,
    )
  )
    throw new Error("Invalid order timestamp");
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error("Invalid order date");
  return fortalezaDate(date);
}

const rowSchema = z
  .object({
    ID_PEDIDO: integer.positive(),
    ID_CLIENTE: integer.positive(),
    ID_VENDEDOR: integer.nullable(),
    CLIENTE_NOME: z.string(),
    VENDEDOR_NOME: z.string().nullable(),
    ID_STATUS_PEDIDO: z.literal(14),
    STATUS_PEDIDO: z.string(),
    STATUS_FINANCEIRO: z.string().nullable(),
    STATUS_ENTREGA: z.string().nullable(),
    QT_ITENS: integer,
    QT_PRODUTOS_VENDIDOS: count,
    VL_SUBTOTAL: money,
    VL_TOTAL_PEDIDO: money,
    PG_FORMA: z.string().nullable(),
    DATA_PEDIDO: z.string().transform(orderDate),
  })
  .transform((row) => ({
    id: row.ID_PEDIDO,
    customerId: row.ID_CLIENTE,
    customer: row.CLIENTE_NOME,
    sellerId: row.ID_VENDEDOR,
    seller: row.VENDEDOR_NOME?.trim() || "Não informado",
    status: row.STATUS_PEDIDO,
    financial: row.STATUS_FINANCEIRO || "Não informado",
    delivery: row.STATUS_ENTREGA || "Não informado",
    items: row.QT_ITENS,
    products: row.QT_PRODUTOS_VENDIDOS,
    subtotal: row.VL_SUBTOTAL,
    total: row.VL_TOTAL_PEDIDO,
    payment: row.PG_FORMA?.trim() || "Não informado",
    date: row.DATA_PEDIDO,
  }));

const pageSchema = z.object({
  statusCode: z.literal(100200),
  errorId: z.literal(0),
  recordId: totalCount,
  quantity: integer,
  data: z.object({ ordersFindAll: z.array(rowSchema) }),
});

export type ReportOrder = z.output<typeof rowSchema>;
export type ValueGroup = { key: string; label: string; value: number };
export const API_PAGE_SIZE = 1000;

export async function collectOrders(
  period: Period,
  fetchPage: (page: number) => Promise<unknown>,
): Promise<ReportOrder[]> {
  validatePeriod(period);
  const orders: ReportOrder[] = [];
  const ids = new Set<number>();
  let total: number | undefined;
  let previousId = 0;
  // Sequential requests deliberately bound API load to one in-flight page.
  for (let page = 0; total === undefined || orders.length < total; page++) {
    const response = pageSchema.parse(await fetchPage(page));
    total ??= response.recordId;
    const rows = response.data.ordersFindAll;
    if (
      response.recordId !== total ||
      response.quantity !== rows.length ||
      rows.length !== Math.min(API_PAGE_SIZE, total - orders.length)
    ) {
      throw new Error("Inconsistent report pagination");
    }
    for (const row of rows) {
      if (
        ids.has(row.id) ||
        row.id <= previousId ||
        row.date < period.start ||
        row.date > period.end
      )
        throw new Error("Inconsistent report row");
      ids.add(row.id);
      previousId = row.id;
      orders.push(row);
    }
  }
  return orders;
}

function addMoney(left: number, right: number): number {
  const sum = left + right;
  if (!Number.isSafeInteger(sum)) throw new Error("Unsafe monetary sum");
  return sum;
}

export function summarize(orders: ReportOrder[], period: Period) {
  validatePeriod(period);
  const days =
    Math.round(
      (civilDate(period.end).getTime() - civilDate(period.start).getTime()) /
        86400000,
    ) + 1;
  const granularity =
    days <= 60 ? "Diário" : days <= 180 ? "Semanal" : "Mensal";
  function bucket(date: string): string {
    if (days <= 60) return date;
    if (days > 180)
      return `${date.slice(0, 7)}-01` < period.start
        ? period.start
        : `${date.slice(0, 7)}-01`;
    const monday = shiftDay(date, -((civilDate(date).getUTCDay() + 6) % 7));
    return monday < period.start ? period.start : monday;
  }
  const series = new Map<string, ValueGroup>();
  for (let day = period.start; day <= period.end; day = shiftDay(day, 1)) {
    const key = bucket(day);
    const group = series.get(key);
    if (group) group.label = `${key} / ${day}`;
    else series.set(key, { key, label: day, value: 0 });
  }
  const sellers = new Map<string, ValueGroup>();
  const payments = new Map<string, ValueGroup>();
  let total = 0;
  let items = 0;
  let products = 0;
  for (const order of orders) {
    total = addMoney(total, order.total);
    items += order.items;
    products += order.products;
    if (
      !Number.isSafeInteger(items) ||
      !Number.isFinite(products) ||
      products > Number.MAX_SAFE_INTEGER
    )
      throw new Error("Unsafe quantity sum");
    const point = series.get(bucket(order.date));
    if (!point) throw new Error("Order outside report period");
    point.value = addMoney(point.value, order.total);
    for (const [map, key, label] of [
      [sellers, String(order.sellerId), order.seller],
      [payments, order.payment, order.payment],
    ] as const) {
      const group = map.get(key) ?? { key, label, value: 0 };
      group.value = addMoney(group.value, order.total);
      map.set(key, group);
    }
  }
  const ranked = [...sellers.values()].sort(
    (a, b) => b.value - a.value || a.key.localeCompare(b.key),
  );
  const topSellers = ranked.slice(0, 5);
  if (ranked.length > 5)
    topSellers.push({
      key: "others",
      label: "Outros",
      value: ranked
        .slice(5)
        .reduce((sum, group) => addMoney(sum, group.value), 0),
    });
  return {
    total,
    items,
    products,
    orderCount: orders.length,
    average: orders.length ? total / orders.length : 0,
    customers: new Set(orders.map((order) => order.customerId)).size,
    productsAverage: orders.length ? products / orders.length : 0,
    granularity,
    series: [...series.values()],
    sellers: topSellers,
    payments: [...payments.values()].sort(
      (a, b) => b.value - a.value || a.key.localeCompare(b.key),
    ),
  };
}

export type ReportSummary = ReturnType<typeof summarize>;
