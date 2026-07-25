import { SiteHeaderWithBreadcrumb } from "../_components/header/site-header-with-breadcrumb";

const BrandPage = () => {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Dashboard"
        breadcrumbItems={[
          { label: "Dashboard", href: "#" },
          { label: "Marcas", isActive: true },
        ]}
      />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-6">
          <div className="flex flex-col gap-6 py-6">
            <div className="px-4 lg:px-6">
              <div className="space-y-6">
                {/* Cabeçalho */}
                <div>
                  <h1 className="text-3xl font-bold">Marcas</h1>
                  <p className="text-muted-foreground mt-2">
                    Crie, edite e gerencie as marcas dos seus produtos.
                  </p>
                </div>
                {/* Conteúdo das marcas */}
                {/* <BrandPageContent /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BrandPage;
