"use client";

import { ArrowLeft, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCategoryQueryNavigation } from "../_hooks/use-category-query-navigation";
import { LevelBadge } from "../category-level-badge";
import type { CategoryDetailDto } from "../category-types";
import { CategoryCreateTrigger } from "../dialogs/category-create-dialog";

export function CategoryDetailHeader({
  detail,
  tab,
}: {
  detail: CategoryDetailDto;
  tab: "details" | "products";
}) {
  const navigate = useCategoryQueryNavigation();

  return (
    <div className="border-b px-4 py-3 lg:px-6">
      <button
        type="button"
        className="mb-3 flex min-h-11 items-center gap-2 text-sm text-muted-foreground md:hidden"
        onClick={() => navigate({ categoryId: undefined })}
      >
        <ArrowLeft className="size-4" /> Voltar para categorias
      </button>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="mb-2 flex flex-wrap gap-1 text-xs text-muted-foreground">
            {detail.breadcrumb.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate({ categoryId: String(item.id) })}
                className="hover:text-foreground"
              >
                {index > 0 && <span className="mr-1">›</span>}
                {item.name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">{detail.name}</h2>
            <LevelBadge level={detail.level} />
            <Badge variant="outline">
              {detail.status === "active" ? "Ativa" : "Inativa"}
            </Badge>
            <span className="font-mono text-xs text-muted-foreground">
              #{detail.id}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {detail.level < 3 && (
            <CategoryCreateTrigger parent={detail} variant="outline">
              <Plus /> Novo {detail.level === 1 ? "grupo" : "subgrupo"}
            </CategoryCreateTrigger>
          )}
          <Button
            type="submit"
            form="category-detail-form"
            className={cn(tab !== "details" && "hidden")}
          >
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}
