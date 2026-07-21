import { Skeleton } from "@/components/ui/skeleton";

const STAT_SKELETONS = [
  "total",
  "families",
  "groups",
  "subgroups",
  "active",
  "inactive",
  "empty",
  "issues",
];
const TREE_SKELETONS = [
  "family-1",
  "group-1",
  "subgroup-1",
  "subgroup-2",
  "group-2",
  "family-2",
  "group-3",
  "subgroup-3",
  "family-3",
  "group-4",
];

export default function CategoryDashboardLoading() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between p-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-3 w-80" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="flex gap-px overflow-hidden border-y">
        {STAT_SKELETONS.map((item) => (
          <Skeleton key={item} className="h-16 min-w-28 rounded-none" />
        ))}
      </div>
      <div className="grid flex-1 grid-cols-1 md:grid-cols-[300px_1fr]">
        <div className="space-y-3 border-r p-3">
          <Skeleton className="h-9 w-full" />
          {TREE_SKELETONS.map((item) => (
            <Skeleton key={item} className="h-10 w-full" />
          ))}
        </div>
        <div className="hidden space-y-4 p-6 md:block">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
}
