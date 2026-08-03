"use client";

import { ChevronLeft, ChevronRight, Folder } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CategoryOption } from "../../types/catalog-types";

/**
 * Profundidade maxima de navegacao no menu de categorias. Alem deste nivel os
 * itens sao apenas selecionaveis (sem drill-down), evitando arvores muito
 * profundas dentro do painel lateral.
 */
const MAX_LEVELS = 3;

interface NavigationNode {
  id: number;
  name: string;
}

interface CategoryMenuProps {
  categories: CategoryOption[];
  /** Id da categoria selecionada ("all" ou id numerico em string). */
  selectedCategoryId: string;
  isLoading: boolean;
  onCategoryChange: (categoryId: string) => void;
}

/**
 * Menu hierarquico de categorias (drill-down) para o painel de filtros.
 * Componente controlado: nao toca na URL diretamente — apenas notifica o
 * parent via `onCategoryChange`. A navegacao (breadcrumb/voltar/abrir
 * subcategorias) e estado local.
 *
 * Referencia: wholesale-e-commerce-web-app-v1/budget-category-filter-panel.
 */
export function CategoryMenu({
  categories,
  selectedCategoryId,
  isLoading,
  onCategoryChange,
}: CategoryMenuProps) {
  const selectedId =
    selectedCategoryId !== "all" ? Number(selectedCategoryId) : undefined;

  const byId = useMemo(() => {
    const map = new Map<number, CategoryOption>();
    for (const item of categories) {
      map.set(item.id, item);
    }
    return map;
  }, [categories]);

  const childrenByParent = useMemo(() => {
    const map = new Map<number, CategoryOption[]>();
    for (const item of categories) {
      const list = map.get(item.parentId) ?? [];
      list.push(item);
      map.set(item.parentId, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.name.localeCompare(b.name, "pt-BR");
      });
    }
    return map;
  }, [categories]);

  // Constroi o caminho da raiz ate o pai da categoria selecionada, para que a
  // lista de irmaos (contendo o item selecionado) apareca ao reabrir o painel.
  const initialPath = useMemo<NavigationNode[]>(() => {
    if (selectedId === undefined) return [];
    const selected = byId.get(selectedId);
    if (!selected) return [];
    const ancestors: NavigationNode[] = [];
    let cursorId = selected.parentId;
    while (cursorId && cursorId !== 0) {
      const node = byId.get(cursorId);
      if (!node) break;
      ancestors.unshift({ id: node.id, name: node.name });
      cursorId = node.parentId;
    }
    return ancestors.slice(0, MAX_LEVELS - 1);
  }, [byId, selectedId]);

  const [path, setPath] = useState<NavigationNode[]>(initialPath);

  const currentParentId = path.length === 0 ? 0 : path[path.length - 1].id;
  const currentLevel = path.length + 1;
  const currentItems = childrenByParent.get(currentParentId) ?? [];
  const canDrillDown = currentLevel < MAX_LEVELS;
  const currentNodeName =
    path.length > 0 ? path[path.length - 1].name : undefined;

  const handleDrillDown = (node: CategoryOption) => {
    setPath((prev) => [...prev, { id: node.id, name: node.name }]);
  };

  const handleBack = () => {
    setPath((prev) => prev.slice(0, -1));
  };

  const handleJumpTo = (index: number) => {
    setPath((prev) => prev.slice(0, index + 1));
  };

  const handleResetToRoot = () => {
    setPath([]);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <button
          type="button"
          onClick={handleResetToRoot}
          className={cn(
            "rounded px-1.5 py-0.5 hover:bg-muted",
            path.length === 0 && "font-medium text-foreground",
          )}
        >
          TODAS AS CATEGORIAS
        </button>
        {path.map((node, index) => (
          <span key={node.id} className="flex items-center gap-1">
            <ChevronRight className="size-3" aria-hidden="true" />
            <button
              type="button"
              onClick={() => handleJumpTo(index)}
              className={cn(
                "rounded px-1.5 py-0.5 hover:bg-muted",
                index === path.length - 1 && "font-medium text-foreground",
              )}
            >
              {node.name}
            </button>
          </span>
        ))}
      </div>

      {path.length > 0 && currentNodeName !== undefined && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="h-8 gap-1 px-2"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            Voltar
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onCategoryChange(String(currentParentId))}
            className="h-8 flex-1 justify-start"
            disabled={isLoading}
          >
            Navegando por “{currentNodeName}”
          </Button>
        </div>
      )}

      {currentItems.length === 0 ? (
        <p className="px-1 py-4 text-sm text-muted-foreground">
          Nenhuma categoria disponível neste nível.
        </p>
      ) : (
        <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto">
          {currentItems.map((item) => {
            const children = childrenByParent.get(item.id) ?? [];
            const hasChildren = children.length > 0 && canDrillDown;
            const isSelected = item.id === selectedId;

            return (
              <li key={item.id}>
                <div
                  className={cn(
                    "group flex items-stretch overflow-hidden rounded-lg border border-border/60 bg-background transition-colors",
                    isSelected && "border-primary bg-primary/5",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onCategoryChange(String(item.id))}
                    disabled={isLoading}
                    className={cn(
                      "flex flex-1 items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/60 disabled:opacity-60",
                      isSelected && "text-primary",
                    )}
                  >
                    <Folder
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span className="flex min-w-0 flex-1 items-baseline gap-1.5">
                      <span className="truncate">{item.name}</span>
                      {typeof item.productCount === "number" &&
                        item.productCount > 0 && (
                          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                            ({item.productCount})
                          </span>
                        )}
                    </span>
                  </button>
                  {hasChildren && (
                    <button
                      type="button"
                      onClick={() => handleDrillDown(item)}
                      aria-label={`Abrir subcategorias de ${item.name}`}
                      className="flex items-center justify-center border-l border-border/60 px-2.5 text-muted-foreground hover:bg-muted/60"
                    >
                      <ChevronRight className="size-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
