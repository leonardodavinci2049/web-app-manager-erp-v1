import { Skeleton } from "@/components/ui/skeleton";

export default function CarrierDetailsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 px-3 py-6 lg:px-6">
      <div className="flex items-center gap-3">
        <Skeleton className="size-24 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Skeleton className="h-[52rem] rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
