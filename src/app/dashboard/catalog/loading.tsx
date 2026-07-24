import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { CatalogLoadingProducts } from "./_components/catalog-loading-products";

export default function CatalogLoading() {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Catálogo"
        breadcrumbItems={[{ label: "Início", isActive: true }]}
      />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-4 py-3">
            <div className="px-3 lg:px-6">
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="flex w-full justify-center">
                    <div className="flex w-full max-w-xl flex-col gap-2 lg:max-w-2xl">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <div className="flex min-w-0 flex-1 items-center">
                          <div className="relative flex-1">
                            <Skeleton className="h-11 w-full rounded-l-md rounded-r-none" />
                          </div>
                          <Skeleton className="h-11 w-11 shrink-0 rounded-l-none rounded-r-md sm:w-[110px]" />
                        </div>
                        <Skeleton className="h-11 w-11 shrink-0 rounded-md sm:w-[100px]" />
                        <Skeleton className="h-11 w-11 shrink-0 rounded-md" />
                      </div>
                    </div>
                  </div>

                  <CatalogLoadingProducts />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
