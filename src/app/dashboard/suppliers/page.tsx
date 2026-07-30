import DevelopmentPage from "@/components/common/DevelopmentPage";
import { SiteHeaderWithBreadcrumb } from "../_components/header/site-header-with-breadcrumb";

const SupplierPage = () => {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Fornecedores"
        breadcrumbItems={[
          { label: "Dashboard", href: "#" },
          { label: "Cadastro de Fornecedores", isActive: true },
        ]}
      />
      <DevelopmentPage />
    </>
  );
};

export default SupplierPage;
