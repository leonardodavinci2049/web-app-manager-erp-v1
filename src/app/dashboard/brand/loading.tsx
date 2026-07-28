import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_KEYS = [
  "brand-skeleton-1",
  "brand-skeleton-2",
  "brand-skeleton-3",
  "brand-skeleton-4",
  "brand-skeleton-5",
  "brand-skeleton-6",
  "brand-skeleton-7",
  "brand-skeleton-8",
  "brand-skeleton-9",
  "brand-skeleton-10",
];

export default function BrandLoading() {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Marcas"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Marcas", isActive: true },
        ]}
      />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-6">
          <div className="flex flex-col gap-6 py-6">
            <div className="px-4 lg:px-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-40" />
                  <Skeleton className="h-4 w-72" />
                </div>

                <div className="flex w-full items-center gap-2">
                  <Skeleton className="h-11 flex-1 rounded-r-none" />
                  <Skeleton className="h-11 w-[110px] rounded-l-none" />
                  <Skeleton className="h-11 w-11 rounded-md" />
                  <Skeleton className="h-11 w-40 rounded-md" />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:gap-3 lg:gap-4">
                  {SKELETON_KEYS.map((key) => (
                    <div
                      key={key}
                      className="flex flex-col items-center gap-2 rounded-lg border p-3"
                    >
                      <Skeleton className="h-20 w-20 rounded-lg" />
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-2.5 w-10" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
