import DevelopmentPage from "@/components/common/DevelopmentPage";
import { SiteHeaderWithBreadcrumb } from "../_components/header/site-header-with-breadcrumb";

const PTypePage = () => {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Tipos de Produtos"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Tipos de Produtos", isActive: true },
        ]}
      />
      <DevelopmentPage />
    </>
  );
};

export default PTypePage;
