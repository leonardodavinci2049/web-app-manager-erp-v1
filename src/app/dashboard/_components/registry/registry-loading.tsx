import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";

interface RegistryLoadingProps {
  title: string;
  breadcrumbLabel?: string;
}

const CARD_SKELETON_IDS = Array.from(
  { length: 8 },
  (_, index) => `registry-card-skeleton-${index}`,
);
const PAGE_SKELETON_IDS = Array.from(
  { length: 3 },
  (_, index) => `registry-page-skeleton-${index}`,
);

export function RegistryLoading({
  title,
  breadcrumbLabel,
}: RegistryLoadingProps) {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title={title}
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: breadcrumbLabel ?? title, isActive: true },
        ]}
      />
      <main className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col">
          <div className="flex flex-col gap-4 px-3 py-4 md:py-6 lg:px-6">
            <div className="space-y-1">
              <Skeleton className="h-7 w-48 sm:h-8" />
              <Skeleton className="h-4 w-full max-w-3xl" />
            </div>
            <div className="space-y-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
              <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-20 -mx-3 border-b px-3 py-3 shadow-sm backdrop-blur lg:-mx-6 lg:px-6">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-11 w-full min-w-0 md:max-w-[400px]" />
                  <Skeleton className="size-11 shrink-0 rounded-md" />
                  <Skeleton className="hidden size-11 rounded-md md:inline-flex" />
                  <Skeleton className="hidden h-11 w-32 rounded-md md:ml-auto md:block" />
                </div>
              </div>
              <section className="relative" aria-label="Resultados">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] sm:gap-3 lg:gap-4">
                    {CARD_SKELETON_IDS.map((id) => (
                      <Skeleton key={id} className="h-44 rounded-xl sm:h-52" />
                    ))}
                  </div>
                  <div className="flex flex-col items-center gap-3 pt-2">
                    <Skeleton className="h-3 w-44" />
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="size-8 rounded-md" />
                      {PAGE_SKELETON_IDS.map((id) => (
                        <Skeleton key={id} className="h-8 w-9 rounded-md" />
                      ))}
                      <Skeleton className="size-8 rounded-md" />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
