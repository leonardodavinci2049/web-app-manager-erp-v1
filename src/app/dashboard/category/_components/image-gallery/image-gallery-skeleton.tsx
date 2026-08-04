import { Skeleton } from "@/components/ui/skeleton";

export function CategoryImageGallerySkeleton() {
  return (
    <div className="w-full space-y-4" aria-hidden="true">
      <Skeleton className="aspect-[3/1] w-full rounded-xl" />
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed decorative placeholders
            key={index}
            className="aspect-[3/1] w-full rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}
