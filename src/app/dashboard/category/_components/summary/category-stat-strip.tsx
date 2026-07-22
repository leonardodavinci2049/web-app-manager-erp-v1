"use client";

import { cn } from "@/lib/utils";
import { useCategoryQueryNavigation } from "../../_hooks/use-category-query-navigation";
import { statFilterToQuery } from "../../_utils/category-filters";
import type { CategoryStatsDto } from "../category-types";

export function CategoryStatStrip({ stats }: { stats: CategoryStatsDto }) {
  const navigate = useCategoryQueryNavigation();
  const items = [
    ["Total categorias", stats.total, "all"],
    ["Famílias", stats.families, "level-1"],
    ["Grupos", stats.groups, "level-2"],
    ["Subgrupos", stats.subgroups, "level-3"],
    ["Ativas", stats.active, "active"],
    ["Inativas", stats.inactive, "inactive"],
    ["Sem produtos", stats.withoutProducts, "without-products"],
    ["Fam. sem grupos", stats.familiesWithoutGroups, "family-empty"],
    ["Grupos sem sub.", stats.groupsWithoutSubgroups, "group-empty"],
    ["Inconsistências", stats.inconsistencies, "inconsistent"],
  ] as const;

  return (
    <section
      className="flex overflow-x-auto border-y bg-card"
      aria-label="Indicadores de categorias"
    >
      {items.map(([label, value, filter]) => (
        <button
          type="button"
          key={label}
          onClick={() => navigate(statFilterToQuery(filter))}
          className={cn(
            "min-w-28 shrink-0 border-r px-3 py-2.5 text-center transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
            filter === "inconsistent" && value > 0 && "bg-destructive/5",
          )}
        >
          <span
            className={cn(
              "block text-lg font-bold leading-none",
              filter === "inconsistent" && value > 0 && "text-destructive",
            )}
          >
            {value}
          </span>
          <span className="mt-1 block whitespace-nowrap text-[10px] text-muted-foreground">
            {label}
          </span>
        </button>
      ))}
    </section>
  );
}
