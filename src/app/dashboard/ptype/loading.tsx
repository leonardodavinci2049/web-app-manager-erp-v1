import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_IDS = [
  "ptype-1",
  "ptype-2",
  "ptype-3",
  "ptype-4",
  "ptype-5",
  "ptype-6",
  "ptype-7",
  "ptype-8",
  "ptype-9",
  "ptype-10",
];

export default function PtypeLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 px-3 py-6 lg:px-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {SKELETON_IDS.map((id) => (
          <Skeleton key={id} className="h-36 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
