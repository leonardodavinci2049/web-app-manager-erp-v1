import DevelopmentPage from "@/components/common/DevelopmentPage";
import { SiteHeaderWithBreadcrumb } from "../_components/header/site-header-with-breadcrumb";

const CarriersPage = () => {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Dashboard"
        breadcrumbItems={[
          { label: "Dashboard", href: "#" },
          { label: "Cadastro de Transportadoras", isActive: true },
        ]}
      />
      <DevelopmentPage />
    </>
  );
};

export default CarriersPage;
