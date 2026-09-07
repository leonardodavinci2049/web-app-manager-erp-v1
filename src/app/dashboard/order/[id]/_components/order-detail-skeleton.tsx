import { SiteHeaderWithBreadcrumb } from "@/app/dashboard/_components/header/site-header-with-breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";

export function OrderDetailSkeleton() {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Detalhes do pedido"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pedidos", isActive: true },
        ]}
      />
      <main className="mx-auto flex w-full max-w-[1400px] min-w-0 flex-1 flex-col">
        <div
          className="w-full space-y-6 px-3 py-4 sm:px-4 sm:py-6 lg:px-6"
          aria-hidden="true"
        >
          <Skeleton className="h-9 w-48 max-w-full" />
          <div className="grid gap-6 lg:grid-cols-[minmax(280px,500px)_minmax(0,1fr)]">
            <div className="hidden space-y-3 lg:block">
              <Skeleton className="aspect-square rounded-xl" />
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton
                    // biome-ignore lint/suspicious/noArrayIndexKey: fixed decorative placeholders
                    key={index}
                    className="aspect-square rounded-lg"
                  />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 2 }).map((_, index) => (
                  <Skeleton
                    // biome-ignore lint/suspicious/noArrayIndexKey: fixed decorative placeholders
                    key={index}
                    className="h-56 rounded-xl"
                  />
                ))}
              </div>
            </div>
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </main>
    </>
  );
}
