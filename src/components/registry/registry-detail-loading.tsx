import type { ReactNode } from "react";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type RegistryDetailLoadingVariant =
  | "brand"
  | "customer"
  | "ptype"
  | "seller"
  | "extended";

interface RegistryDetailLoadingProps {
  title: string;
  breadcrumbItems: Array<{
    label: string;
    href?: string;
    isActive?: boolean;
  }>;
  variant: RegistryDetailLoadingVariant;
}

function DetailCardSkeleton({
  className,
  rows = 3,
}: {
  className?: string;
  rows?: number;
}) {
  return (
    <div
      className={cn("space-y-4 rounded-xl border bg-card p-6", className)}
      aria-hidden="true"
    >
      <Skeleton className="h-5 w-40" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed decorative placeholders
            key={`detail-card-row-${index}`}
            className="space-y-2"
          >
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ImageGallerySkeleton() {
  return (
    <div className="w-full max-w-[500px] space-y-4" aria-hidden="true">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed decorative placeholders
            key={`gallery-item-${index}`}
            className="aspect-square w-full rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}

function DetailIdentitySkeleton({ withImage = true }: { withImage?: boolean }) {
  return (
    <div className="flex min-w-0 items-start gap-3" aria-hidden="true">
      {withImage && <Skeleton className="size-12 shrink-0 rounded-xl" />}
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-8 w-56 max-w-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-48 max-w-full" />
      </div>
    </div>
  );
}

function DetailTabsSkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div
        className={cn(
          "grid h-auto w-full grid-cols-2 gap-1",
          count > 2 && "sm:grid-cols-4",
          count > 4 && "lg:grid-cols-7",
        )}
      >
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed decorative placeholders
            key={`detail-tab-${index}`}
            className="h-9 w-full"
          />
        ))}
      </div>
      <DetailCardSkeleton className="min-h-40" rows={2} />
    </div>
  );
}

function BackButtonSkeleton() {
  return <Skeleton className="h-9 w-44" aria-hidden="true" />;
}

function BrandDetailLoading() {
  return (
    <div className="space-y-6">
      <BackButtonSkeleton />
      <DetailIdentitySkeleton withImage={false} />
      <div className="grid gap-8 lg:grid-cols-[minmax(280px,500px)_minmax(0,1fr)]">
        <ImageGallerySkeleton />
        <div className="space-y-4">
          <DetailCardSkeleton className="min-h-[28rem]" rows={5} />
          <DetailCardSkeleton className="min-h-40" rows={2} />
        </div>
      </div>
      <DetailTabsSkeleton count={3} />
    </div>
  );
}

function PersonDetailLoading({ variant }: { variant: "customer" | "seller" }) {
  const isCustomer = variant === "customer";

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(280px,500px)_minmax(0,1fr)]">
        <div className="lg:col-span-2">
          <BackButtonSkeleton />
        </div>
        <aside className="lg:row-span-2 lg:row-start-2 lg:self-start lg:sticky lg:top-6">
          <ImageGallerySkeleton />
        </aside>
        <DetailIdentitySkeleton />
        <div className="space-y-4">
          <DetailCardSkeleton className="min-h-[24rem]" rows={5} />
          <DetailCardSkeleton className="min-h-48" rows={3} />
          <DetailCardSkeleton className="min-h-40" rows={2} />
          {!isCustomer && <DetailCardSkeleton className="min-h-36" rows={2} />}
        </div>
      </div>
      {isCustomer && (
        <div className="space-y-1" aria-hidden="true">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
      )}
      <DetailTabsSkeleton count={isCustomer ? 7 : 2} />
    </div>
  );
}

function PtypeDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(280px,500px)_minmax(0,1fr)]">
        <div className="lg:col-span-2">
          <BackButtonSkeleton />
        </div>
        <aside className="lg:row-span-3 lg:row-start-2 lg:self-start lg:sticky lg:top-6">
          <ImageGallerySkeleton />
        </aside>
        <DetailIdentitySkeleton />
        <DetailCardSkeleton className="min-h-56" rows={3} />
        <div className="space-y-4">
          <DetailCardSkeleton className="min-h-[28rem]" rows={5} />
          <DetailCardSkeleton className="min-h-40" rows={2} />
          <DetailCardSkeleton className="min-h-48" rows={3} />
        </div>
      </div>
      <DetailTabsSkeleton count={2} />
    </div>
  );
}

function ExtendedDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(280px,500px)_minmax(0,1fr)]">
        <div className="lg:col-span-2">
          <BackButtonSkeleton />
        </div>
        <aside className="lg:row-span-3 lg:row-start-2 lg:self-start lg:sticky lg:top-6">
          <ImageGallerySkeleton />
        </aside>
        <DetailIdentitySkeleton />
        <DetailCardSkeleton className="min-h-56" rows={4} />
        <div className="space-y-4">
          <DetailCardSkeleton className="min-h-[42rem]" rows={7} />
          <DetailCardSkeleton className="min-h-40" rows={2} />
          <DetailCardSkeleton className="min-h-48" rows={3} />
        </div>
      </div>
      <DetailTabsSkeleton count={2} />
    </div>
  );
}

export function RegistryDetailLoading({
  title,
  breadcrumbItems,
  variant,
}: RegistryDetailLoadingProps) {
  let content: ReactNode;

  if (variant === "brand") content = <BrandDetailLoading />;
  else if (variant === "customer" || variant === "seller") {
    content = <PersonDetailLoading variant={variant} />;
  } else if (variant === "ptype") content = <PtypeDetailLoading />;
  else content = <ExtendedDetailLoading />;

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title={title}
        breadcrumbItems={breadcrumbItems}
      />
      <main className="mx-auto flex w-full max-w-[1400px] min-w-0 flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-6">
          <div className="flex flex-col gap-6 py-6">
            <div className="w-full px-3 lg:px-6">{content}</div>
          </div>
        </div>
      </main>
    </>
  );
}
