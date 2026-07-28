"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BrandPaginationProps {
  currentPage: number;
  total: number;
  pageSize: number;
  paramName?: string;
}

type PageEntry =
  | { type: "page"; value: number }
  | { type: "ellipsis"; position: "start" | "end" };

function buildPageEntries(current: number, totalPages: number): PageEntry[] {
  const result: PageEntry[] = [];
  const windowSize = 1;
  const start = Math.max(0, current - windowSize);
  const end = Math.min(totalPages - 1, current + windowSize);

  if (start > 0) {
    result.push({ type: "page", value: 0 });
    if (start > 1) result.push({ type: "ellipsis", position: "start" });
  }

  for (let i = start; i <= end; i++) {
    result.push({ type: "page", value: i });
  }

  if (end < totalPages - 1) {
    if (end < totalPages - 2)
      result.push({ type: "ellipsis", position: "end" });
    result.push({ type: "page", value: totalPages - 1 });
  }

  return result;
}

/**
 * Paginacao tradicional via URL (Client). Altera somente o parametro de pagina
 * informado (`page` para a lista, `productPage` para os produtos) preservando
 * os demais parametros. Desabilita destinos invalidos e mostra numeros de
 * pagina proximos da atual.
 */
export function BrandPagination({
  currentPage,
  total,
  pageSize,
  paramName = "page",
}: BrandPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 0), totalPages - 1);
  const displayPage = safeCurrentPage + 1;

  const navigate = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 0) {
      params.delete(paramName);
    } else {
      params.set(paramName, String(page));
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  if (totalPages <= 1) {
    return null;
  }

  const entries = buildPageEntries(safeCurrentPage, totalPages);

  return (
    <nav
      aria-label="Paginação"
      className="flex flex-wrap items-center justify-center gap-1.5"
    >
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={() => navigate(safeCurrentPage - 1)}
        disabled={isPending || safeCurrentPage === 0}
        aria-label="Página anterior"
      >
        <ChevronLeft className="size-4" />
      </Button>

      {entries.map((entry) => {
        if (entry.type === "ellipsis") {
          return (
            <span
              key={entry.position}
              className="text-muted-foreground px-1.5 text-sm"
              aria-hidden="true"
            >
              …
            </span>
          );
        }
        return (
          <Button
            key={entry.value}
            type="button"
            variant={entry.value === safeCurrentPage ? "default" : "outline"}
            size="sm"
            onClick={() => navigate(entry.value)}
            disabled={isPending}
            aria-current={entry.value === safeCurrentPage ? "page" : undefined}
            className={cn("min-w-9 tabular-nums")}
          >
            {entry.value + 1}
          </Button>
        );
      })}

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={() => navigate(safeCurrentPage + 1)}
        disabled={isPending || safeCurrentPage >= totalPages - 1}
        aria-label="Próxima página"
      >
        <ChevronRight className="size-4" />
      </Button>

      <span className="text-muted-foreground ml-2 text-xs tabular-nums">
        Página {displayPage} de {totalPages}
      </span>
    </nav>
  );
}
