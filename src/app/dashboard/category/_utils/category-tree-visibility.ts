import type { CategoryNodeDto } from "../_components/category-types";

export function includesNode(
  node: CategoryNodeDto,
  predicate: (node: CategoryNodeDto) => boolean,
): boolean {
  return (
    predicate(node) ||
    node.children.some((child) => includesNode(child, predicate))
  );
}

export interface CategoryTreeRow {
  node: CategoryNodeDto;
  depth: number;
}

export function getVisibleRows(
  tree: CategoryNodeDto[],
  expanded: Set<number>,
  predicate: (node: CategoryNodeDto) => boolean,
): CategoryTreeRow[] {
  const rows: CategoryTreeRow[] = [];
  const visit = (nodes: CategoryNodeDto[], depth: number) => {
    for (const node of nodes) {
      if (!includesNode(node, predicate)) continue;
      rows.push({ node, depth });
      if (expanded.has(node.id) && node.children.length > 0) {
        visit(node.children, depth + 1);
      }
    }
  };
  visit(tree, 0);
  return rows;
}

export function collectExpandableIds(tree: CategoryNodeDto[]): Set<number> {
  const ids = new Set<number>();
  const collect = (nodes: CategoryNodeDto[]) =>
    nodes.forEach((node) => {
      if (node.children.length) ids.add(node.id);
      collect(node.children);
    });
  collect(tree);
  return ids;
}
