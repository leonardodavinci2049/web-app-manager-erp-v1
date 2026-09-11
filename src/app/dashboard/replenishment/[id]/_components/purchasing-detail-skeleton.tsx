import { Skeleton } from "@/components/ui/skeleton";

export function PurchasingDetailSkeleton() {
  return (
    <div
      className="w-full space-y-6 px-3 py-4 sm:px-4 sm:py-6 lg:px-6"
      aria-hidden="true"
    >
      <Skeleton className="h-9 w-64 max-w-full" />
      <div className="grid gap-6 lg:grid-cols-[minmax(280px,500px)_minmax(0,1fr)]">
        <Skeleton className="hidden aspect-square rounded-xl lg:block" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed decorative placeholders
                key={index}
                className="h-48 rounded-xl"
              />
            ))}
          </div>
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-56 w-full rounded-xl" />
    </div>
  );
}
