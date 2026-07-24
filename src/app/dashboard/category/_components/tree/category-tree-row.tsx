"use client";

import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Circle,
  MoreHorizontal,
} from "lucide-react";
import type { KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { LevelBadge } from "../category-level-badge";
import type { CategoryNodeDto } from "../category-types";

export interface CategoryTreeRowProps {
  node: CategoryNodeDto;
  depth: number;
  index: number;
  isSelected: boolean;
  isExpanded: boolean;
  hasChildren: boolean;
  tabbable: boolean;
  onSelect: (id: number) => void;
  onToggleExpand: (id: number) => void;
  onExpand: (id: number) => void;
  onCollapse: (id: number) => void;
  onFocusRow: (index: number) => void;
}

export function CategoryTreeRow({
  node,
  depth,
  index,
  isSelected,
  isExpanded,
  hasChildren,
  tabbable,
  onSelect,
  onToggleExpand,
  onExpand,
  onCollapse,
  onFocusRow,
}: CategoryTreeRowProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown") onFocusRow(index + 1);
    else if (event.key === "ArrowUp") onFocusRow(index - 1);
    else if (event.key === "ArrowRight" && hasChildren) onExpand(node.id);
    else if (event.key === "ArrowLeft" && isExpanded) onCollapse(node.id);
    else if (event.key === "Enter" || event.key === " ") onSelect(node.id);
    else return;
    event.preventDefault();
  };

  return (
    <div
      role="treeitem"
      data-category-id={node.id}
      tabIndex={tabbable ? 0 : -1}
      aria-level={node.level}
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isSelected}
      onKeyDown={handleKeyDown}
      onClick={() => onSelect(node.id)}
      className={cn(
        "group flex min-h-11 cursor-pointer items-center gap-1.5 border-b px-2 text-sm outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        isSelected && "border-l-2 border-l-foreground bg-muted",
        node.inconsistent && "bg-destructive/5",
      )}
      style={{ paddingLeft: 8 + depth * 16 }}
    >
      <button
        type="button"
        aria-label={isExpanded ? "Recolher categoria" : "Expandir categoria"}
        className="flex size-7 shrink-0 items-center justify-center rounded hover:bg-muted"
        onClick={(event) => {
          event.stopPropagation();
          if (!hasChildren) return;
          onToggleExpand(node.id);
        }}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )
        ) : null}
      </button>
      <LevelBadge level={node.level} />
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          node.status === "inactive" && "text-muted-foreground line-through",
        )}
      >
        {node.name}
      </span>
      <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
        {node.directProductCount}p
      </span>
      {node.inconsistent && (
        <AlertTriangle
          className="size-3.5 shrink-0 text-destructive"
          aria-label={node.issues.join("; ")}
        />
      )}
      <Circle
        className={cn(
          "size-2 shrink-0",
          node.status === "active"
            ? "fill-emerald-500 text-emerald-500"
            : "fill-muted text-muted-foreground",
        )}
        aria-label={node.status === "active" ? "Ativa" : "Inativa"}
      />
      <MoreHorizontal
        className="size-4 opacity-0 group-hover:opacity-100"
        aria-hidden="true"
      />
    </div>
  );
}
