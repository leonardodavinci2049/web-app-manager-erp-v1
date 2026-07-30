import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";

interface RegistryLoadingProps {
  title: string;
  descriptionWidth?: string;
  compactGrid?: boolean;
}

const SKELETON_IDS = Array.from(
  { length: 8 },
  (_, index) => `registry-skeleton-${index}`,
);

export function RegistryLoading({
  title,
  descriptionWidth = "max-w-lg",
  compactGrid = false,
}: RegistryLoadingProps) {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title={title}
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: title, isActive: true },
        ]}
      />
      <main className="flex flex-1 flex-col px-3 py-4 md:py-6 lg:px-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48 sm:h-8" />
            <Skeleton className={`h-4 w-full ${descriptionWidth}`} />
          </div>
          <div className="flex justify-end gap-2 border-b py-3">
            <Skeleton className="h-11 w-full md:max-w-[400px]" />
            <Skeleton className="hidden h-11 w-28 md:block" />
            <Skeleton className="hidden size-11 md:block" />
            <Skeleton className="hidden h-11 w-32 md:block" />
          </div>
          <div
            className={
              compactGrid
                ? "grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] sm:gap-3 lg:gap-4"
                : "grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-3 lg:gap-4"
            }
          >
            {SKELETON_IDS.map((id) => (
              <Skeleton key={id} className="h-44 rounded-xl sm:h-52" />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
