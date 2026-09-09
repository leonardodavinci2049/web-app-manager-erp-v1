import type { NextRequest } from "next/server";
import { connection } from "next/server";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { getPurchasingProducts } from "@/services/api-main/purchasing/purchasing-service-api";
import type { UIPurchasingProduct } from "@/services/api-main/purchasing/transformers/transformers";
import {
  mapPurchasingSort,
  PURCHASING_DEFAULT_SORT,
  parsePurchasingFilters,
} from "../_components";
import { buildPurchasingExportWorkbook } from "../_lib/build-purchasing-export-workbook";

const logger = createLogger("PurchasingExportRoute");

const EXPORT_PAGE_SIZE = 1000;
const MAX_EXPORT_ROWS = 50_000;
const MAX_EXPORT_PAGES = 60;

const XLSX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const GENERIC_ERROR_MESSAGE =
  "Não foi possível gerar a exportação agora. Tente novamente em instantes.";
const NO_RESULTS_MESSAGE =
  "Nenhum produto corresponde aos filtros atuais. Ajuste os filtros antes de exportar.";
const SESSION_EXPIRED_MESSAGE =
  "Sua sessão expirou. Faça login novamente para exportar.";

class ExportInconsistentCountError extends Error {
  constructor(detail: string) {
    super(detail);
    this.name = "ExportInconsistentCountError";
  }
}

function isNextRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

function jsonError(status: number, message: string): Response {
  return Response.json(
    { error: message },
    { status, headers: { "Cache-Control": "private, no-store" } },
  );
}

async function collectAllPurchasingProducts(
  filters: ReturnType<typeof parsePurchasingFilters>,
  apiContext: Awaited<ReturnType<typeof getAuthContext>>["apiContext"],
): Promise<UIPurchasingProduct[]> {
  const sort = mapPurchasingSort(PURCHASING_DEFAULT_SORT);
  const collected: UIPurchasingProduct[] = [];
  const seenIds = new Set<number>();
  let duplicates = 0;
  let total = 0;

  for (let pageId = 0; pageId < MAX_EXPORT_PAGES; pageId++) {
    const result = await getPurchasingProducts({
      search: filters.searchTerm,
      taxonomyId: filters.categoryId,
      brandId: filters.brandId,
      typeId: filters.typeId,
      supplierId: filters.supplierId,
      flagSalesList: 0,
      flagStockList: 0,
      flagAdvanced: 0,
      flagImported: filters.origin,
      flagPremium: filters.premium ? 1 : 0,
      criticalityLevel: filters.criticality,
      flagVariousLists: 0,
      qtRecords: EXPORT_PAGE_SIZE,
      pageId,
      columnId: sort.columnId,
      orderId: sort.orderId,
      ...apiContext,
    });

    total = result.total;

    if (result.products.length === 0) {
      if (pageId === 0 && total === 0) {
        return [];
      }
      if (seenIds.size < total) {
        throw new ExportInconsistentCountError(
          `Página ${pageId} vazia com ${seenIds.size} de ${total} registros coletados.`,
        );
      }
      break;
    }

    for (const product of result.products) {
      if (seenIds.has(product.id)) {
        duplicates++;
        continue;
      }
      seenIds.add(product.id);
      collected.push(product);
    }

    if (seenIds.size >= MAX_EXPORT_ROWS) {
      throw new Error("MAX_ROWS_EXCEEDED");
    }
    if (seenIds.size >= total) {
      break;
    }
  }

  if (collected.length < total) {
    throw new ExportInconsistentCountError(
      `Coleta encerrada com ${collected.length} de ${total} registros (${duplicates} duplicados ignorados).`,
    );
  }

  if (duplicates > 0) {
    logger.warn(
      `Exportação ignorou ${duplicates} registros duplicados entre páginas (total ${total}).`,
    );
  }

  return collected;
}

export async function GET(request: NextRequest) {
  await connection();

  let apiContext: Awaited<ReturnType<typeof getAuthContext>>["apiContext"];
  try {
    ({ apiContext } = await getAuthContext());
  } catch (error) {
    if (isNextRedirectError(error)) {
      return jsonError(401, SESSION_EXPIRED_MESSAGE);
    }
    logger.error(
      "Erro ao autenticar a exportação da necessidade de compra",
      error,
    );
    return jsonError(500, GENERIC_ERROR_MESSAGE);
  }

  const filters = parsePurchasingFilters(request.nextUrl.searchParams);

  let products: UIPurchasingProduct[];
  try {
    products = await collectAllPurchasingProducts(filters, apiContext);
  } catch (error) {
    if (error instanceof ExportInconsistentCountError) {
      logger.error(
        `Contagem inconsistente na exportação da necessidade de compra: ${error.message}`,
      );
      return jsonError(500, GENERIC_ERROR_MESSAGE);
    }
    if (error instanceof Error && error.message === "MAX_ROWS_EXCEEDED") {
      return jsonError(
        422,
        `A consulta retornou mais registros do que o limite de exportação (${MAX_EXPORT_ROWS}). Refine os filtros para reduzir o volume.`,
      );
    }
    logger.error("Erro ao carregar produtos para exportação", error);
    return jsonError(500, GENERIC_ERROR_MESSAGE);
  }

  if (products.length === 0) {
    return jsonError(422, NO_RESULTS_MESSAGE);
  }

  try {
    const now = new Date();
    const { body, filename } = await buildPurchasingExportWorkbook(
      products,
      now,
    );
    logger.info(
      `Exportação da necessidade de compra gerada com ${products.length} registros.`,
    );
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": XLSX_MIME_TYPE,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    logger.error(
      "Erro ao montar o arquivo Excel da necessidade de compra",
      error,
    );
    return jsonError(500, GENERIC_ERROR_MESSAGE);
  }
}
