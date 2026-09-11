import "server-only";

import { Workbook } from "exceljs";
import type { UIPurchasingProduct } from "@/services/api-main/purchasing/transformers/transformers";
import { getMonthName } from "@/utils/common-utils";
import { parsePurchasingCategoryNames } from "../_components/lib/category-helpers";

const SHEET_NAME = "Necessidade de compra";
const INTEGER_FORMAT = "#,##0";
const CURRENCY_FORMAT = '"R$" #,##0.00';
const DATE_FORMAT = "dd/mm/yyyy";
const COLUMN_COUNT = 17;

function toNumberOrNull(value: string | number | undefined): number | null {
  if (value === undefined || value === null) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toDateOrNull(value: string | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatSaoPauloTimestamp(date: Date): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}-${get("hour")}${get("minute")}`;
}

export function buildPurchasingExportFilename(now: Date): string {
  return `necessidade-de-compra-${formatSaoPauloTimestamp(now)}.xlsx`;
}

export async function buildPurchasingExportWorkbook(
  products: UIPurchasingProduct[],
  now: Date,
): Promise<{ body: Uint8Array<ArrayBuffer>; filename: string }> {
  const workbook = new Workbook();
  workbook.creator = "Manager ERP";
  workbook.created = now;
  workbook.modified = now;

  const sheet = workbook.addWorksheet(SHEET_NAME, {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    { header: "ID", width: 10 },
    { header: "Nome", width: 45 },
    { header: "Referência", width: 18 },
    { header: "Criticidade", width: 14 },
    { header: "Fornecedor", width: 28 },
    { header: "Marca", width: 18 },
    { header: "Tipo", width: 16 },
    { header: `Vendas - ${getMonthName(-2, now)}`, width: 18 },
    { header: `Vendas - ${getMonthName(-1, now)}`, width: 18 },
    { header: `Vendas - ${getMonthName(0, now)}`, width: 18 },
    { header: "Vendas - últimos 30 dias", width: 20 },
    { header: "Última venda", width: 14 },
    { header: "Estoque", width: 10 },
    { header: "Preço atacado", width: 16 },
    { header: "Preço varejo", width: 16 },
    { header: "Preço corporativo", width: 16 },
    { header: "Categorias", width: 50 },
  ];

  for (const column of [8, 9, 10, 11, 13]) {
    sheet.getColumn(column).numFmt = INTEGER_FORMAT;
  }
  for (const column of [14, 15, 16]) {
    sheet.getColumn(column).numFmt = CURRENCY_FORMAT;
  }
  sheet.getColumn(12).numFmt = DATE_FORMAT;

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE5E7EB" },
  };
  headerRow.height = 20;
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: COLUMN_COUNT },
  };

  for (const product of products) {
    sheet.addRow([
      product.id,
      product.name ?? "",
      product.ref ?? "",
      product.criticalityLevel ?? "",
      product.supplier ?? "",
      product.brand ?? "",
      product.type ?? "",
      product.salesTwoMonthsAgo ?? 0,
      product.salesPreviousMonth ?? 0,
      product.salesCurrentMonth ?? 0,
      product.salesLast30Days ?? 0,
      toDateOrNull(product.lastSaleAt),
      product.storeStock ?? 0,
      toNumberOrNull(product.wholesalePrice),
      toNumberOrNull(product.retailPrice),
      toNumberOrNull(product.corporatePrice),
      parsePurchasingCategoryNames(product.categories).join("; "),
    ]);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const body = new Uint8Array(buffer.byteLength);
  body.set(new Uint8Array(buffer));
  return {
    body,
    filename: buildPurchasingExportFilename(now),
  };
}
