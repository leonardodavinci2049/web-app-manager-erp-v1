"use client";

import { useState } from "react";
import { CategoryTreeItem } from "./CategoryTreeItem";
import type { CategoryTreeProps } from "./category-tree.types";

/**
 * Componente cliente que gerencia o estado de expansão/colapso da árvore
 */
export function CategoryTree({
  categories,
  onSelect,
  selectedId,
}: CategoryTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(
    new Set(),
  );

  const handleToggle = (id: string | number, isExpanded: boolean) => {
    const newExpanded = new Set(expandedIds);

    if (isExpanded) {
      newExpanded.add(id);
    } else {
      newExpanded.delete(id);
    }

    setExpandedIds(newExpanded);
  };

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
