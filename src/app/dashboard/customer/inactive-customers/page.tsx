import DevelopmentPage from "@/components/common/DevelopmentPage";
import { SiteHeaderWithBreadcrumb } from "../../_components/header/site-header-with-breadcrumb";

const InactiveCustomersPage = () => {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Relatório de Clientes Inativos"
        breadcrumbItems={[
          { label: "Dashboard", href: "#" },
          { label: "Relatório de Clientes Inativos", isActive: true },
        ]}
      />
      <DevelopmentPage />
    </>
  );
};

export default InactiveCustomersPage;
