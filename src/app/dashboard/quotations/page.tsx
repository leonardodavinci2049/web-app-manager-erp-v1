import DevelopmentPage from "@/components/common/DevelopmentPage";
import { SiteHeaderWithBreadcrumb } from "../../_components/header/site-header-with-breadcrumb";

const PremiumCustomersPage = () => {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Relatório de Clientes Premium"
        breadcrumbItems={[
          { label: "Dashboard", href: "#" },
          { label: "Relatório de Clientes Premium", isActive: true },
        ]}
      />
      <DevelopmentPage />
    </>
  );
};

export default PremiumCustomersPage;
