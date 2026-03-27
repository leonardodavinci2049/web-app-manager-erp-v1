import DevelopmentPage from "@/components/common/DevelopmentPage";
import { SiteHeaderWithBreadcrumb } from "../../_components/header/site-header-with-breadcrumb";

const AddCustomerPage = () => {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Adicionar Novo Cliente"
        breadcrumbItems={[
          { label: "Dashboard", href: "#" },
          { label: "Adicionar Novo Cliente", isActive: true },
        ]}
      />
      <DevelopmentPage />
    </>
  );
};

export default AddCustomerPage;
