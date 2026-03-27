import { OrganizationMetaProvider } from "@/components/common/organization-meta-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getOrganizationConfig } from "@/services/db/organization-meta/organization-meta-helpers";
import { AppSidebar } from "./_components/app-sidebar/app-sidebar";

export default async function DashboardLayout({
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
