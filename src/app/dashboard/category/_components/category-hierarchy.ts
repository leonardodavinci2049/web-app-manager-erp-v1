import type { UITaxonomy } from "@/services/api-main/taxonomy-base/transformers/transformers";
import type {
  CategoryDetailDto,
  CategoryLevel,
  CategoryNodeDto,
  CategoryStatsDto,
} from "./category-types";

const MAX_LEVEL = 3;

function isCategoryLevel(value: number): value is CategoryLevel {
  return value >= 1 && value <= MAX_LEVEL;
}

export function buildCategoryTree(categories: UITaxonomy[]): {
  tree: CategoryNodeDto[];
  flat: CategoryNodeDto[];
  stats: CategoryStatsDto;
} {
  const source = categories.filter((category) =>
    isCategoryLevel(category.level),
  );
  const sourceById = new Map(source.map((category) => [category.id, category]));
  const nodesById = new Map<number, CategoryNodeDto>();

  for (const category of source) {
    const issues: string[] = [];
    const parent = sourceById.get(category.parentId);

    if (category.parentId === category.id) issues.push("Autorreferência");
    if (category.level === 1 && category.parentId !== 0)
      issues.push("Família com categoria pai");
    if (category.level > 1 && !parent)
      issues.push("Categoria pai não encontrada");
    if (parent && parent.level !== category.level - 1)
      issues.push("Níveis incompatíveis");

    nodesById.set(category.id, {
      id: category.id,
      parentId: category.parentId,
      name: category.name,
      slug: category.slug ?? "",
      imagePath: category.imagePath,
      level: category.level as CategoryLevel,
      order: category.order,
      directProductCount: category.productCount ?? 0,
      status: category.inactive ? "inactive" : "active",
      inconsistent: issues.length > 0,
      issues,
      children: [],
    });
  }

  const roots: CategoryNodeDto[] = [];
  for (const node of nodesById.values()) {
    const parent = nodesById.get(node.parentId);
    if (node.level > 1 && parent && parent.id !== node.id) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (nodes: CategoryNodeDto[]) => {
    nodes.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
    for (const node of nodes) sortNodes(node.children);
  };
  sortNodes(roots);

  const flat = [...nodesById.values()];
  for (const node of flat) {
    if (node.level === 1 && node.children.length === 0) {
      node.issues.push("Família sem grupos");
    }
    if (node.level === 2 && node.children.length === 0) {
      node.issues.push("Grupo sem subgrupos");
    }
    node.inconsistent = node.issues.length > 0;
  }

  return {
    tree: roots,
    flat,
    stats: {
      total: flat.length,
      families: flat.filter((item) => item.level === 1).length,
      groups: flat.filter((item) => item.level === 2).length,
      subgroups: flat.filter((item) => item.level === 3).length,
      active: flat.filter((item) => item.status === "active").length,
      inactive: flat.filter((item) => item.status === "inactive").length,
      withoutProducts: flat.filter((item) => item.directProductCount === 0)
        .length,
      familiesWithoutGroups: flat.filter(
        (item) => item.level === 1 && item.children.length === 0,
      ).length,
      groupsWithoutSubgroups: flat.filter(
        (item) => item.level === 2 && item.children.length === 0,
      ).length,
      inconsistencies: flat.filter((item) => item.inconsistent).length,
    },
  };
}

export function buildCategoryDetail(
  category: UITaxonomy,
  nodes: CategoryNodeDto[],
): CategoryDetailDto {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const breadcrumb: Array<{ id: number; name: string }> = [];
  const visited = new Set<number>();
  let current = byId.get(category.id);

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    breadcrumb.unshift({ id: current.id, name: current.name });
    current = byId.get(current.parentId);
  }

  return {
    id: category.id,
    parentId: category.parentId,
    name: category.name,
    slug: category.slug ?? "",
    imagePath: category.imagePath,
    level: isCategoryLevel(category.level) ? category.level : 1,
    order: category.order,
    directProductCount: category.productCount ?? 0,
    status: category.inactive ? "inactive" : "active",
    metaTitle: category.metaTitle ?? "",
    metaDescription: category.metaDescription ?? "",
    notes: category.notes ?? "",
    breadcrumb,
    childCount: byId.get(category.id)?.children.length ?? 0,
  };
}
