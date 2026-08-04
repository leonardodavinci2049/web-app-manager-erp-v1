import { Skeleton } from "@/components/ui/skeleton";

export function PtypeImageGallerySkeleton() {
  return (
    <div className="w-full max-w-[500px] space-y-4" aria-hidden="true">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed decorative placeholders
            key={index}
            className="aspect-square w-full rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}
