import { SiteHeaderWithBreadcrumb } from "../_components/header/site-header-with-breadcrumb";

const SettingsPage = () => {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Dashboard"
        breadcrumbItems={[
          { label: "Dashboard", href: "#" },
          { label: "Configurações", isActive: true },
        ]}
      />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-6">
          <div className="flex flex-col gap-6 py-6">
            <div className="px-4 lg:px-6">
              <div className="space-y-6">
                {/* Cabeçalho */}
                <div>
                  <h1 className="text-3xl font-bold">Configurações</h1>
                  <p className="text-muted-foreground mt-2">
                    Personalize sua experiência e configure suas preferências de
                    conta
                  </p>
                </div>
                {/* Conteúdo das Configurações */}
                {/* <SettingsPageContent /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
