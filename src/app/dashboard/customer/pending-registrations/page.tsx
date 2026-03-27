import DevelopmentPage from "@/components/common/DevelopmentPage";
import { SiteHeaderWithBreadcrumb } from "../../_components/header/site-header-with-breadcrumb";

const PendingRegistrationsPage = () => {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Relatório de Registros Pendentes"
        breadcrumbItems={[
          { label: "Dashboard", href: "#" },
          { label: "Relatório de Registros Pendentes", isActive: true },
        ]}
      />
      <DevelopmentPage />
    </>
  );
};

export default PendingRegistrationsPage;
