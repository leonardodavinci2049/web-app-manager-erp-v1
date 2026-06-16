"use client";

import {
  ChevronDown,
  FolderOpen,
  Package,
  Plus,
  Tag,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { CategoryTreeItemProps } from "./category-tree.types";

/**
 * Componente recursivo para renderizar um item da árvore de categorias
 */
export function CategoryTreeItem({
  node,
  onToggle,
  expandedIds = new Set(),
  onSelect,
  onAddChild,
  onDelete,
  isMutating = false,
  selectedId,
}: CategoryTreeItemProps) {
  const router = useRouter();
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const hasProducts = (node.quantity ?? 0) > 0;
  const canAddChild = node.level < 3 && !isMutating;
  const canDelete = !hasChildren && !hasProducts && !isMutating;

  // Calcula indentação baseada no nível (para o container principal)
  const indentationMap: Record<number, string> = {
    1: "pl-0",
    2: "pl-6",
    3: "pl-12",
  };

  const indentation = indentationMap[node.level];

  // Função para obter ícone baseado no nível hierárquico
  const getLevelIcon = () => {
    switch (node.level) {
      case 1: // Família
        return (
          <FolderOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        );
      case 2: // Grupo
        return (
          <Package className="w-4 h-4 text-green-600 dark:text-green-400" />
        );
      case 3: // Subgrupo
        return <Tag className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
      default:
        return <FolderOpen className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle?.(node.id, !isExpanded, node.parentId);
  };

  const handleSelect = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect?.(node.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter") {
      const target = e.currentTarget;
      target.click();
    }
    if (e.key === "ArrowRight" && hasChildren && !isExpanded) {
      onToggle?.(node.id, true);
    }
    if (e.key === "ArrowLeft" && hasChildren && isExpanded) {
      onToggle?.(node.id, false);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Navegar para página de detalhes da categoria
    router.push(`/dashboard/category/category-details?id=${node.id}`);
  };

  const handleAddChild = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canAddChild) {
      return;
    }
    onAddChild?.(node);
  };

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canDelete) {
      return;
    }
    onDelete?.(node);
  };

  const addTooltip =
    node.level >= 3 ? "Limite de níveis atingido" : "Adicionar subcategoria";
  const deleteTooltip = hasChildren
    ? "Não é possível excluir categoria com subcategorias"
    : hasProducts
      ? "Não é possível excluir categoria com produtos"
      : "Excluir categoria";

  const children = node.children ?? [];

  return (
    <div className="select-none">
      {/* Item da categoria */}
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-3 rounded-md transition-colors duration-150",
          "hover:bg-muted group w-full",
          isSelected && "bg-primary/10 border-l-2 border-primary",
          indentation, // Aplica indentação ao container principal
        )}
      >
        {/* Ícone expansor */}
        {hasChildren ? (
          <button
            onClick={handleToggle}
            className={cn(
              "flex items-center justify-center w-5 h-5 shrink-0",
              "transition-transform duration-300 ease-out",
              isExpanded && "rotate-180",
            )}
            aria-label={isExpanded ? "Colapsar" : "Expandir"}
            aria-expanded={isExpanded}
            type="button"
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
        ) : (
          <div className="w-5 h-5 shrink-0" />
        )}

        {/* Conteúdo do item com ícone hierárquico */}
        <div className="flex-1 flex items-center gap-2">
          {/* Ícone do nível hierárquico */}
          <div className="flex items-center justify-center shrink-0">
            {getLevelIcon()}
          </div>

          <button
            type="button"
            onClick={handleSelect}
            onDoubleClick={handleDoubleClick}
            onKeyDown={handleKeyDown}
            className={cn(
              "font-medium text-sm hover:underline cursor-pointer text-left bg-transparent border-none p-0 m-0 flex-1",
              isSelected && "font-semibold text-primary",
            )}
          >
            <span className="text-muted-foreground">{node.id}</span>
            <span className="mx-1.5">-</span>
            {node.name}
            {node.quantity !== undefined && (
              <span className="ml-1 text-muted-foreground">
                ({node.quantity})
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleAddChild}
                  disabled={!canAddChild}
                  aria-label={addTooltip}
                  title={addTooltip}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">{addTooltip}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleDelete}
                  disabled={!canDelete}
                  aria-label={deleteTooltip}
                  title={deleteTooltip}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">{deleteTooltip}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Filhos (recursivo) */}
      {hasChildren && isExpanded && (
        <div className="space-y-0">
          {children.map((child) => (
            <CategoryTreeItem
              key={child.id}
              node={child}
              onToggle={onToggle}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onAddChild={onAddChild}
              onDelete={onDelete}
              isMutating={isMutating}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
