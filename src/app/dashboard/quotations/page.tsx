import DevelopmentPage from "@/components/common/DevelopmentPage";
import { SiteHeaderWithBreadcrumb } from "../_components/header/site-header-with-breadcrumb";

const QuotationsPage = () => {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Cotações"
        breadcrumbItems={[
          { label: "Dashboard", href: "#" },
          { label: "Cotações", isActive: true },
        ]}
      />
      <DevelopmentPage />
    </>
  );
};

export default QuotationsPage;
