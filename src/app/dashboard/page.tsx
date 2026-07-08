import { SiteHeaderWithBreadcrumb } from "./_components/header/site-header-with-breadcrumb";

export default function DashboardPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <SiteHeaderWithBreadcrumb
        title="Início"
        breadcrumbItems={[{ label: "Início", isActive: true }]}
      />

      <main className="mx-auto flex w-full max-w-350 flex-1 flex-col items-center justify-center gap-4 p-4 text-center md:p-6 lg:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Bem-vindo ao Manager ERP
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
          Utilize o menu lateral para navegar entre os módulos do sistema.
        </p>
      </main>
    </div>
  );
}
