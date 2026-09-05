import { SiteHeaderWithBreadcrumb } from "@/app/dashboard/_components/header/site-header-with-breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";

const STAT_SKELETONS = Array.from(
  { length: 10 },
  (_, index) => `category-stat-skeleton-${index}`,
);
const TREE_ROW_SKELETONS = [
  { id: "family-1", width: "w-3/4", indent: "" },
  { id: "group-1", width: "w-2/3", indent: "pl-7" },
  { id: "subgroup-1", width: "w-3/5", indent: "pl-7" },
  { id: "subgroup-2", width: "w-1/2", indent: "pl-14" },
  { id: "group-2", width: "w-3/5", indent: "pl-7" },
  { id: "family-2", width: "w-2/3", indent: "" },
  { id: "group-3", width: "w-3/5", indent: "pl-7" },
  { id: "subgroup-3", width: "w-1/2", indent: "pl-14" },
  { id: "family-3", width: "w-3/4", indent: "" },
  { id: "group-4", width: "w-3/5", indent: "pl-7" },
];

export default function CategoryDashboardLoading() {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Categorias"
        breadcrumbItems={[
          { label: "Início", href: "/dashboard" },
          { label: "Categorias", isActive: true },
        ]}
      />
      <div className="mx-auto flex min-h-0 w-full max-w-[1400px] flex-1 flex-col bg-background pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
        <div className="flex flex-col justify-between gap-3 px-3 py-3 sm:flex-row sm:items-center lg:px-6">
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-56 sm:w-72" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="hidden h-9 w-32 md:inline-flex" />
        </div>
        <div className="flex overflow-x-auto border-y bg-card">
          {STAT_SKELETONS.map((id) => (
            <Skeleton
              key={id}
              className="h-16 min-w-28 shrink-0 rounded-none border-r"
            />
          ))}
        </div>
        <div className="grid min-h-[600px] flex-1 md:grid-cols-[300px_minmax(0,1fr)] md:overflow-hidden">
          <aside className="flex min-h-0 flex-col border-r bg-card md:w-[300px] md:min-w-[260px]">
            <div className="space-y-3 border-b p-3">
              <Skeleton className="h-9 w-full" />
              <div className="flex gap-1">
                <Skeleton className="h-7 flex-1" />
                <Skeleton className="h-7 flex-1" />
                <Skeleton className="h-7 flex-1" />
                <Skeleton className="h-7 flex-1" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="min-h-64 flex-1 space-y-1 overflow-y-auto p-2">
              {TREE_ROW_SKELETONS.map((row) => (
                <Skeleton
                  key={row.id}
                  className={`h-9 ${row.width} ${row.indent}`}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-3 border-t p-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </aside>
          <main className="hidden min-w-0 flex-col bg-card md:flex">
            <div className="border-b px-4 py-3 lg:px-6">
              <div className="mb-2 flex gap-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-28" />
              </div>
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-28" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            </div>
            <div className="flex border-b px-4 lg:px-6">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-4 pb-24 lg:p-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
