"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

interface SellerPaginationProps {
  currentPage: number;
  total: number;
  pageSize: number;
}

type PageEntry =
  | { type: "page"; value: number }
  | { type: "ellipsis"; position: "start" | "end" };

function buildEntries(current: number, totalPages: number): PageEntry[] {
  const entries: PageEntry[] = [];
  const start = Math.max(0, current - 1);
  const end = Math.min(totalPages - 1, current + 1);
  if (start > 0) {
    entries.push({ type: "page", value: 0 });
    if (start > 1) entries.push({ type: "ellipsis", position: "start" });
  }
  for (let page = start; page <= end; page += 1)
    entries.push({ type: "page", value: page });
  if (end < totalPages - 1) {
    if (end < totalPages - 2)
      entries.push({ type: "ellipsis", position: "end" });
    entries.push({ type: "page", value: totalPages - 1 });
  }
  return entries;
}

export function SellerPagination({
  currentPage,
  total,
  pageSize,
}: SellerPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(currentPage, 0), totalPages - 1);

  const navigate = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 0) params.delete("page");
    else params.set("page", String(page));
    const query = params.toString();
    startTransition(() =>
      router.replace(query ? `${pathname}?${query}` : pathname),
    );
  };

  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Paginação dos vendedores"
      className="flex flex-wrap items-center justify-center gap-1.5"
    >
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={isPending || safePage === 0}
        onClick={() => navigate(safePage - 1)}
        aria-label="Página anterior"
      >
        <ChevronLeft className="size-4" />
      </Button>
      {buildEntries(safePage, totalPages).map((entry) =>
        entry.type === "ellipsis" ? (
          <span
            key={entry.position}
            className="text-muted-foreground px-1.5 text-sm"
          >
            …
          </span>
        ) : (
          <Button
            key={entry.value}
            type="button"
            variant={entry.value === safePage ? "default" : "outline"}
            size="sm"
            className="min-w-9 tabular-nums"
            disabled={isPending}
            onClick={() => navigate(entry.value)}
            aria-current={entry.value === safePage ? "page" : undefined}
          >
            {entry.value + 1}
          </Button>
        ),
      )}
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={isPending || safePage >= totalPages - 1}
        onClick={() => navigate(safePage + 1)}
        aria-label="Próxima página"
      >
        <ChevronRight className="size-4" />
      </Button>
      <span className="text-muted-foreground ml-2 text-xs tabular-nums">
        Página {safePage + 1} de {totalPages}
      </span>
    </nav>
  );
}
