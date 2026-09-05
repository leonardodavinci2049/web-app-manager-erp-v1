import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DevelopmentPage from "@/components/common/DevelopmentPage";
import { auth } from "@/lib/auth/auth";
import { SiteHeaderWithBreadcrumb } from "../../_components/header/site-header-with-breadcrumb";

const Page = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Dashboard"
        breadcrumbItems={[
          { label: "Dashboard", href: "#" },
          { label: "Relatório de Clientes", isActive: true },
        ]}
      />
      <DevelopmentPage />
    </>
  );
};

export default Page;
