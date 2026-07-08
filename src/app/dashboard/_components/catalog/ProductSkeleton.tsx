"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductSkeletonProps {
  viewMode: "grid" | "list";
}

export function ProductSkeleton({ viewMode }: ProductSkeletonProps) {
  if (viewMode === "list") {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Skeleton className="h-24 w-24 rounded-md" />
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-[360px] sm:max-w-none">
      <CardContent className="space-y-4 p-4">
        <Skeleton className="aspect-square w-full rounded-md" />
        <Skeleton className="h-6 w-20" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  );
}

interface ProductGridSkeletonProps {
  viewMode: "grid" | "list";
  count?: number;
}

export function ProductGridSkeleton({
  viewMode,
  count = 8,
}: ProductGridSkeletonProps) {
  const items = Array.from(
    { length: count },
    (_, i) => `skeleton-${Date.now()}-${i}-${Math.random()}`,
  );

  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6"
          : "space-y-4"
      }
    >
      {items.map((key) => (
        <ProductSkeleton key={key} viewMode={viewMode} />
      ))}
    </div>
  );
}
