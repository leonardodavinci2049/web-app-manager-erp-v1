import "server-only";
import { createLogger } from "@/core/logger";
import type { AuthContext } from "@/server/auth-context";
import { orderManagerServiceApi } from "@/services/api-main/order_manager";
import { type Period, validatePeriod } from "./period";
import { API_PAGE_SIZE, collectOrders, summarize } from "./report";

const logger = createLogger("SalesSummaryReport");

export async function loadReport(period: Period, context: AuthContext) {
  validatePeriod(period);
  if (
    context.authWarning ||
    context.apiContext.pe_system_client_id <= 0 ||
    context.apiContext.pe_organization_id === "0"
  )
    throw new Error("Invalid report authorization context");
  const startedAt = performance.now();
  const orders = await collectOrders(period, (page) =>
    orderManagerServiceApi.findAllOrdersManager({
      ...context.apiContext,
      pe_order_status_id: 14,
      pe_flag_operation_date: 1,
      pe_start_date: period.start,
      pe_end_date: period.end,
      pe_records_per_page: API_PAGE_SIZE,
      pe_page_id: page,
      pe_sort_column_id: 2,
      pe_sort_order_id: 1,
    }),
  );
  const summary = summarize(orders, period);
  orders.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  logger.info("Sales report completed", {
    count: orders.length,
    pages: Math.max(1, Math.ceil(orders.length / API_PAGE_SIZE)),
    durationMs: Math.round(performance.now() - startedAt),
    start: period.start,
    end: period.end,
  });
  return { orders, summary };
}
