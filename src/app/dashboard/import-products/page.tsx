import DevelopmentPage from "@/components/common/DevelopmentPage";
import { SiteHeaderWithBreadcrumb } from "../_components/header/site-header-with-breadcrumb";

const  ImportProductsPage = () => {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Importar Produtos"
        breadcrumbItems={[
          { label: "Dashboard", href: "#" },
          { label: "Importar Produtos", isActive: true },
        ]}
      />
      <DevelopmentPage />
    </>
  );
};

export default ImportProductsPage;
