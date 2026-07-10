import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProductSkeletonProps {
  viewMode: "grid" | "list";
}

/**
 * Skeleton de um unico card (Server Component apresentacional).
 */
export function ProductSkeleton({ viewMode }: ProductSkeletonProps) {
  if (viewMode === "list") {
    return (
      <Card className="gap-0 py-0">
        <CardContent className="p-1 sm:p-1.5">
          <div className="flex gap-2">
            <Skeleton className="h-16 w-16 shrink-0 rounded-md sm:h-20 sm:w-20" />

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="space-y-0.5">
                <Skeleton className="h-5 w-3/4" />
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>

              <div className="border-y py-1">
                <Skeleton className="h-5 w-24" />
              </div>

              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="ml-auto h-8 w-8 md:w-24" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col p-1.5 sm:p-2">
        <Skeleton className="aspect-[4/3] w-full rounded-md" />

        <div className="mt-1 flex flex-1 flex-col gap-1">
          <Skeleton className="h-5 w-full" />
          <div className="space-y-0.5">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-4 w-20" />
          <div className="border-y py-1">
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="min-h-0 flex-1" />
          <Skeleton className="mt-0.5 h-8 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

interface ProductGridSkeletonProps {
  viewMode: "grid" | "list";
  count?: number;
}

/**
 * Skeleton do grid completo (Server Component).
 */
export function ProductGridSkeleton({
  viewMode,
  count = 8,
}: ProductGridSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => `skeleton-${i}`);

  if (viewMode === "list") {
    return (
      <>
        <div className="space-y-2 sm:space-y-3 lg:hidden">
          {items.map((key) => (
            <ProductSkeleton key={key} viewMode="list" />
          ))}
        </div>

        <div className="hidden overflow-hidden rounded-lg border lg:block">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[40%] min-w-72">Produto</TableHead>
                <TableHead className="min-w-36">Marca e tipo</TableHead>
                <TableHead className="min-w-36">Estoque</TableHead>
                <TableHead className="min-w-48">Preços</TableHead>
                <TableHead className="min-w-52">Categorias</TableHead>
                <TableHead className="w-16">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((key) => (
                <TableRow key={key}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-20 shrink-0 rounded-md" />
                      <div className="w-full space-y-2">
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-3 w-2/5" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-28" />
                      <Skeleton className="h-5 w-24 rounded-full" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="size-8" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] sm:gap-3 lg:gap-4">
      {items.map((key) => (
        <ProductSkeleton key={key} viewMode="grid" />
      ))}
    </div>
  );
}
