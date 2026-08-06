import { ProductDetailsLayoutSkeleton } from "@/app/dashboard/product/[id]/components/ProductDetailsLayout";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";

export default function ProductDetailsLoading() {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Detalhes do Produto"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Produtos" },
          { label: "Catálogo", href: "/dashboard/catalog" },
          { label: "Detalhes", isActive: true },
        ]}
      />
      <main className="mx-auto flex w-full max-w-[1400px] min-w-0 flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-6">
          <div className="flex flex-col gap-6 py-6">
            <div className="px-4 lg:px-6">
              <ProductDetailsLayoutSkeleton />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
