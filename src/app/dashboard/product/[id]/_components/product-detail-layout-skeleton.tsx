import { Skeleton } from "@/components/ui/skeleton";
import { ProductImageGallerySkeleton } from "./image-gallery";

export function ProductDetailLayoutSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-40" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,500px)_minmax(0,1fr)]">
        <aside className="hidden lg:block lg:self-start lg:sticky lg:top-6">
          <ProductImageGallerySkeleton />
        </aside>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-16 w-16 rounded-md sm:h-20 sm:w-20" />
              <div className="min-w-0 flex-1 space-y-2 pt-1">
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </div>

          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-6">
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
