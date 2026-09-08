import { connection } from "next/server";
import { Suspense } from "react";
import { SiteHeaderWithBreadcrumb } from "@/app/dashboard/_components/header/site-header-with-breadcrumb";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { getMonthName } from "@/utils/common-utils";
import { ChartAreaInteractive } from "./_components/chart-area-interactive";
import { DataTable } from "./_components/data-table";
import { PeriodFilter } from "./_components/period-filter";
import { SectionCards } from "./_components/section-cards";
import { ValueBreakdown } from "./_components/value-breakdown";
import { loadReport } from "./_lib/load-report";
import { fortalezaDate, periodPresets, validatePeriod } from "./_lib/period";

const logger = createLogger("SalesSummaryPanel");
type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function ReportContent({ searchParams }: Props) {
  await connection();
  const context = await getAuthContext();
  const query = await searchParams;
  const today = fortalezaDate(new Date());
  const presets = periodPresets(today);
  const reference = new Date(`${today}T12:00:00`);
  const labels = [
    "30 dias",
    getMonthName(0, reference),
    getMonthName(-1, reference),
  ];
  const period = {
    start: typeof query.start === "string" ? query.start : presets[0].start,
    end: typeof query.end === "string" ? query.end : presets[0].end,
  };
  let invalidPeriod = Array.isArray(query.start) || Array.isArray(query.end);
  try {
    validatePeriod(period);
  } catch {
    invalidPeriod = true;
  }
  let report: Awaited<ReturnType<typeof loadReport>> | undefined;
  if (!invalidPeriod) {
    try {
      report = await loadReport(period, context);
    } catch (error) {
      logger.error("Unable to load complete sales report", error);
    }
  }
  return (
    <PeriodFilter
      key={`${period.start}:${period.end}`}
      period={period}
      presets={presets.map((preset, index) => ({
        ...preset,
        label: labels[index],
      }))}
    >
      {invalidPeriod ? (
        <p role="alert" className="rounded-lg border p-4">
          Período inválido. Informe datas reais em ordem, com no máximo 12 meses
          inclusivos.
        </p>
      ) : !report ? (
        <p role="alert" className="rounded-lg border p-4">
          Não foi possível carregar o resumo completo de vendas. Confira sua
          organização ativa e tente aplicar o período novamente.
        </p>
      ) : (
        <>
          <SectionCards summary={report.summary} />
          <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-lg bg-muted p-4 text-sm">
            <p>
              <strong>
                {report.summary.customers.toLocaleString("pt-BR")}
              </strong>{" "}
              clientes únicos
            </p>
            <p>
              <strong>
                {report.summary.productsAverage.toLocaleString("pt-BR", {
                  maximumFractionDigits: 2,
                })}
              </strong>{" "}
              produtos vendidos por pedido
            </p>
          </div>
          <ChartAreaInteractive
            series={report.summary.series}
            granularity={report.summary.granularity}
          />
          <div className="grid min-w-0 gap-4 lg:grid-cols-2">
            <ValueBreakdown
              title="Vendas por vendedor · Top 5"
              groups={report.summary.sellers}
              total={report.summary.total}
            />
            <ValueBreakdown
              title="Vendas por forma de pagamento"
              groups={report.summary.payments}
              total={report.summary.total}
            />
          </div>
          <DataTable
            orders={report.orders.map(
              ({ customerId: _customerId, sellerId: _sellerId, ...order }) =>
                order,
            )}
          />
        </>
      )}
    </PeriodFilter>
  );
}

export default function Page(props: Props) {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Dashboard"
        breadcrumbItems={[
          { label: "Dashboard", href: "#" },
          { label: "Relatório Geral", isActive: true },
        ]}
      />
      <main className="w-full min-w-0 flex-1 space-y-6 p-4 lg:p-6">
        <div>
          <h1 className="text-2xl font-semibold">Resumo de vendas</h1>
          <p className="text-sm text-muted-foreground">
            Consulte os pedidos e os indicadores do período.
          </p>
        </div>
        <Suspense
          fallback={
            <p role="status" className="py-12 text-center">
              Carregando resumo de vendas…
            </p>
          }
        >
          <ReportContent {...props} />
        </Suspense>
      </main>
    </>
  );
}
