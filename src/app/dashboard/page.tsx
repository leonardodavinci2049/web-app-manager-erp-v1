import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { ChartAreaInteractive } from "./_components/panel/chart-area-interactive";
import { SectionCards } from "./_components/panel/section-cards";

export default function DashboardPage() {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Dashboard"
        breadcrumbItems={[
          { label: "Dashboard", href: "#" },
          { label: "Analytics", isActive: true },
        ]}
      />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            {/* DataTable temporariamente desabilitado - será substituído por dados reais da API */}
            <div className="px-4 lg:px-6">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-2">Dados da Tabela</h3>
                <p className="text-muted-foreground">
                  Os dados da tabela serão carregados da API em futuras
                  iterações.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
