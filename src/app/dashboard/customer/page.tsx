import DevelopmentPage from "@/components/common/DevelopmentPage";
import { SiteHeaderWithBreadcrumb } from "../_components/header/site-header-with-breadcrumb";

const CustomerPage = () => {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Dashboard"
        breadcrumbItems={[
          { label: "Dashboard", href: "#" },
          { label: "Cadastro de Clientes", isActive: true },
        ]}
      />
      <DevelopmentPage />
    </>
  );
};

export default CustomerPage;
