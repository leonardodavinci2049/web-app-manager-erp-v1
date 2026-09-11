import DevelopmentPage from "@/components/common/DevelopmentPage";
import { SiteHeaderWithBreadcrumb } from "../_components/header/site-header-with-breadcrumb";

const  PurchaseOrdersPage = () => {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Pedidos de Compra"
        breadcrumbItems={[
          { label: "Dashboard", href: "#" },
          { label: "Pedidos de Compra", isActive: true },
        ]}
      />
      <DevelopmentPage />
    </>
  );
};

export default PurchaseOrdersPage;
