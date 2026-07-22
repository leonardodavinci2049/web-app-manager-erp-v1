"use client";

import { AlertTriangle, Circle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCategoryQueryNavigation } from "../../_hooks/use-category-query-navigation";
import {
  buildTreePredicate,
  hasActiveFilters,
} from "../../_utils/category-filters";
import {
  collectExpandableIds,
  getVisibleRows,
} from "../../_utils/category-tree-visibility";
import type {
  CategoryFilterLevel,
  CategoryFilterStatus,
  CategoryFiltersState,
  CategoryNodeDto,
} from "../category-types";
import { CategoryTreeFilters } from "./category-tree-filters";
import { CategoryTreeRow } from "./category-tree-row";

export interface CategoryTreeProps {
  tree: CategoryNodeDto[];
  selectedId?: number;
  filters: CategoryFiltersState;
}

export function CategoryTree({ tree, selectedId, filters }: CategoryTreeProps) {
  const navigate = useCategoryQueryNavigation();
  const allParentIds = useMemo(() => collectExpandableIds(tree), [tree]);
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());
  const [search, setSearch] = useState(filters.search);
  const [level, setLevel] = useState<CategoryFilterLevel>(filters.level);
  const [status, setStatus] = useState<CategoryFilterStatus>(filters.status);
  const [withoutProducts, setWithoutProducts] = useState(
    filters.withoutProducts,
  );
  const [issue, setIssue] = useState(filters.issue);
  const treeRef = useRef<HTMLDivElement>(null);

  useEffect(() => setSearch(filters.search), [filters.search]);
  useEffect(() => setLevel(filters.level), [filters.level]);
  useEffect(() => setStatus(filters.status), [filters.status]);
  useEffect(
    () => setWithoutProducts(filters.withoutProducts),
    [filters.withoutProducts],
  );
  useEffect(() => setIssue(filters.issue), [filters.issue]);

  const localFilters: CategoryFiltersState = {
    search,
    level,
    status,
    withoutProducts,
    issue,
  };
  const predicate = buildTreePredicate(localFilters);
  const rows = getVisibleRows(
    tree,
    expanded,
    predicate,
    hasActiveFilters(localFilters),
  );

  const commit = (next: Partial<CategoryFiltersState>) => {
    const merged = { ...localFilters, ...next };
    navigate({
      search: merged.search.trim() || undefined,
      level: merged.level === "all" ? undefined : merged.level,
      status: merged.status === "all" ? undefined : merged.status,
      withoutProducts: merged.withoutProducts ? "1" : undefined,
      issue: merged.issue || undefined,
    });
  };

  const focusRow = (targetIndex: number) => {
    const elements =
      treeRef.current?.querySelectorAll<HTMLElement>("[role=treeitem]");
    elements?.[
      Math.max(0, Math.min(targetIndex, (elements?.length ?? 1) - 1))
    ]?.focus();
  };

  const toggleExpand = (id: number) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const expand = (id: number) =>
    setExpanded((current) => new Set(current).add(id));
  const collapse = (id: number) =>
    setExpanded((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });

  return (
    <aside className="flex min-h-0 flex-col border-r bg-card md:w-[300px] md:min-w-[260px]">
      <CategoryTreeFilters
        search={search}
        level={level}
        status={status}
        withoutProducts={withoutProducts}
        onSearchChange={setSearch}
        onSearchSubmit={() => commit({ search })}
        onLevelChange={(value) => {
          setLevel(value);
          setIssue("");
          commit({ level: value, issue: "" });
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setIssue("");
          commit({ status: value, issue: "" });
        }}
        onToggleWithoutProducts={() => {
          const next = !withoutProducts;
          setWithoutProducts(next);
          setIssue("");
          commit({ withoutProducts: next, issue: "" });
        }}
        onExpandAll={() => setExpanded(new Set(allParentIds))}
        onCollapseAll={() => setExpanded(new Set())}
      />
      <div
        ref={treeRef}
        role="tree"
        aria-label="Hierarquia de categorias"
        className="min-h-64 flex-1 overflow-y-auto"
      >
        {rows.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Nenhuma categoria corresponde aos filtros.
          </div>
        ) : (
          rows.map(({ node, depth }, index) => (
            <CategoryTreeRow
              key={node.id}
              node={node}
              depth={depth}
              index={index}
              isSelected={selectedId === node.id}
              isExpanded={expanded.has(node.id)}
              hasChildren={node.children.length > 0}
              tabbable={selectedId === node.id || (!selectedId && index === 0)}
              onSelect={(id) => navigate({ categoryId: String(id) })}
              onToggleExpand={toggleExpand}
              onExpand={expand}
              onCollapse={collapse}
              onFocusRow={focusRow}
            />
          ))
        )}
      </div>
      <div className="flex flex-wrap gap-3 border-t p-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Circle className="size-2 fill-emerald-500 text-emerald-500" /> Ativa
        </span>
        <span className="flex items-center gap-1">
          <Circle className="size-2 fill-muted text-muted-foreground" /> Inativa
        </span>
        <span className="flex items-center gap-1">
          <AlertTriangle className="size-3 text-destructive" /> Inconsistente
        </span>
      </div>
    </aside>
  );
}
