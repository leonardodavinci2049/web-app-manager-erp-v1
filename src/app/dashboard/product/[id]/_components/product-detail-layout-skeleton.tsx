import { Skeleton } from "@/components/ui/skeleton";
import { ProductImageGallerySkeleton } from "./image-gallery";

export function ProductDetailLayoutSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(280px,500px)_minmax(0,1fr)]">
        <Skeleton className="h-9 w-44 lg:col-span-2 lg:justify-self-start" />

        <aside className="hidden lg:sticky lg:top-6 lg:row-span-2 lg:row-start-2 lg:block lg:self-start">
          <ProductImageGallerySkeleton />
        </aside>

        <div className="flex min-w-0 items-start gap-3">
          <Skeleton className="size-12 shrink-0 rounded-xl lg:hidden" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-7 w-3/4 max-w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>

      <div className="space-y-1" aria-hidden="true">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="hidden h-4 w-full max-w-xl sm:block" />
      </div>

      <div className="space-y-4">
        <div className="grid h-auto w-full grid-cols-3 gap-1 sm:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
              key={`tab-skeleton-${index}`}
              className="h-9 w-full"
            />
          ))}
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}
