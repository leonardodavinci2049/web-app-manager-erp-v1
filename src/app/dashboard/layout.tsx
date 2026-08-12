import { Suspense } from "react";
import { OrganizationMetaProvider } from "@/components/common/organization-meta-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { getOrganizationConfig } from "@/services/db/organization-meta/organization-meta-helpers";
import { AppSidebar } from "./_components/app-sidebar/app-sidebar";

async function DashboardLayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgConfig = await getOrganizationConfig();

  return (
    <OrganizationMetaProvider
      organizationId={orgConfig.organizationId}
      meta={orgConfig.meta}
      imageBaseUrl={orgConfig.imageBaseUrl}
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </OrganizationMetaProvider>
  );
}

function DashboardLayoutFallback() {
  return (
    <div
      className="flex min-h-svh w-full items-center justify-center gap-2 text-muted-foreground"
      role="status"
    >
      <Spinner aria-hidden="true" />
      <span className="text-sm">Carregando painel...</span>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<DashboardLayoutFallback />}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
