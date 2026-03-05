"use client";

import { useCallback, useState } from "react";
import { CategoryTreeItem } from "./CategoryTreeItem";
import type {
  CategoryNode,
  CategoryTreeProps,
} from "./category-tree.types";

/** Busca um nó pelo ID na árvore */
function findNodeById(
  nodes: CategoryNode[],
  id: string | number,
): CategoryNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/** Retorna siblings de um nó (excluindo ele mesmo) */
function findSiblings(
  rootNodes: CategoryNode[],
  targetId: string | number,
  parentId: string | number | null | undefined,
): CategoryNode[] {
  if (parentId == null) {
    return rootNodes.filter((n) => n.id !== targetId);
  }
  const parent = findNodeById(rootNodes, parentId);
  if (!parent?.children) return [];
  return parent.children.filter((n) => n.id !== targetId);
}

/** Coleta todos os IDs de um nó e seus descendentes */
function collectAllIds(node: CategoryNode): (string | number)[] {
  const ids: (string | number)[] = [node.id];
  if (node.children) {
    for (const child of node.children) {
      ids.push(...collectAllIds(child));
    }
  }
  return ids;
}

/**
 * Componente cliente que gerencia o estado de expansão/colapso da árvore
 * Comportamento accordion: apenas um item aberto por nível de siblings
 */
export function CategoryTree({
  categories,
  onSelect,
  selectedId,
}: CategoryTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(
    new Set(),
  );

  const handleToggle = useCallback(
    (
      id: string | number,
      isExpanded: boolean,
      parentId?: string | number | null,
    ) => {
      setExpandedIds((prev) => {
        const newExpanded = new Set(prev);

        if (isExpanded) {
          // Accordion: fecha siblings e seus descendentes
          const siblings = findSiblings(categories, id, parentId);
          for (const sibling of siblings) {
            for (const sibId of collectAllIds(sibling)) {
              newExpanded.delete(sibId);
            }
          }
          newExpanded.add(id);
        } else {
          // Fecha o nó e todos os seus descendentes
          const node = findNodeById(categories, id);
          if (node) {
            for (const descId of collectAllIds(node)) {
              newExpanded.delete(descId);
            }
          } else {
            newExpanded.delete(id);
          }
        }

        return newExpanded;
      });
    },
    [categories],
  );

  return (
    <div className="space-y-1 py-2">
      {categories.map((category) => (
        <CategoryTreeItem
          key={category.id}
          node={category}
          onToggle={handleToggle}
          expandedIds={expandedIds}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      ))}
    </div>
  );
}
