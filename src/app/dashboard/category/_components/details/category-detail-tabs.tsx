"use client";

import { cn } from "@/lib/utils";
import { useCategoryQueryNavigation } from "../../_hooks/use-category-query-navigation";
import type { CategoryDetailTab } from "../category-types";

export function CategoryDetailTabs({ tab }: { tab: CategoryDetailTab }) {
  const navigate = useCategoryQueryNavigation();

  return (
    <div className="flex border-b px-4 lg:px-6">
      <button
        type="button"
        onClick={() => navigate({ tab: undefined })}
        className={cn(
          "border-b-2 px-4 py-3 text-sm",
          tab === "details"
            ? "border-foreground font-medium"
            : "border-transparent text-muted-foreground",
        )}
      >
        Detalhes
      </button>
      <button
        type="button"
        onClick={() => navigate({ tab: "image", productPage: undefined })}
        className={cn(
          "border-b-2 px-4 py-3 text-sm",
          tab === "image"
            ? "border-foreground font-medium"
            : "border-transparent text-muted-foreground",
        )}
      >
        Imagem
      </button>
      <button
        type="button"
        onClick={() => navigate({ tab: "products" })}
        className={cn(
          "border-b-2 px-4 py-3 text-sm",
          tab === "products"
            ? "border-foreground font-medium"
            : "border-transparent text-muted-foreground",
        )}
      >
        Produtos
      </button>
      <button
        type="button"
        disabled
        title="Em breve"
        className="px-4 py-3 text-sm text-muted-foreground opacity-40"
      >
        Histórico
      </button>
    </div>
  );
}
