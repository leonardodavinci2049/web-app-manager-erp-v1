"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ACCUM_PARAM_NAME } from "./registry-page-limits";

interface RegistryPaginationProps {
  currentPage: number;
  total: number;
  pageSize: number;
  ariaLabel: string;
  paramName?: string;
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
  for (let page = start; page <= end; page += 1) {
    entries.push({ type: "page", value: page });
  }
  if (end < totalPages - 1) {
    if (end < totalPages - 2)
      entries.push({ type: "ellipsis", position: "end" });
    entries.push({ type: "page", value: totalPages - 1 });
  }
  return entries;
}

export function RegistryPagination({
  currentPage,
  total,
  pageSize,
  ariaLabel,
  paramName = "page",
}: RegistryPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(currentPage, 0), totalPages - 1);

  const navigate = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    // Selecting another page resets any "load more" accumulation.
    params.delete(ACCUM_PARAM_NAME);
    if (page <= 0) params.delete(paramName);
    else params.set(paramName, String(page));
    const query = params.toString();
    startTransition(() =>
      router.replace(query ? `${pathname}?${query}` : pathname),
    );
  };

  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label={ariaLabel}
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
        <ChevronLeft className="size-4" aria-hidden="true" />
      </Button>
      {buildEntries(safePage, totalPages).map((entry) =>
        entry.type === "ellipsis" ? (
          <span
            key={entry.position}
            className="text-muted-foreground px-1.5 text-sm"
            aria-hidden="true"
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
            aria-label={`Página ${entry.value + 1}`}
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
        <ChevronRight className="size-4" aria-hidden="true" />
      </Button>
      <span className="text-muted-foreground ml-1 text-xs tabular-nums sm:ml-2">
        Página {safePage + 1} de {totalPages}
      </span>
    </nav>
  );
}
