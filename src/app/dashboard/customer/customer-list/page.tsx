import DevelopmentPage from "@/components/common/DevelopmentPage";
import { SiteHeaderWithBreadcrumb } from "../../_components/header/site-header-with-breadcrumb";

const CustomerListPage = () => {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Relatório de Clientes"
        breadcrumbItems={[
          { label: "Dashboard", href: "#" },
          { label: "Relatório de Clientes", isActive: true },
        ]}
      />
      <DevelopmentPage />
    </>
  );
};

export default CustomerListPage;
