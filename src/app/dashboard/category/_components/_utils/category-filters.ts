import type { CategoryFiltersState, CategoryNodeDto } from "../category-types";

export function buildTreePredicate(
  filters: CategoryFiltersState,
): (node: CategoryNodeDto) => boolean {
  const normalizedSearch = filters.search.trim().toLocaleLowerCase("pt-BR");
  return (node) =>
    (!normalizedSearch ||
      node.name.toLocaleLowerCase("pt-BR").includes(normalizedSearch) ||
      String(node.id).includes(normalizedSearch)) &&
    (filters.level === "all" || String(node.level) === filters.level) &&
    (filters.status === "all" || node.status === filters.status) &&
    (!filters.withoutProducts || node.directProductCount === 0) &&
    (filters.issue !== "family-empty" ||
      (node.level === 1 && node.children.length === 0)) &&
    (filters.issue !== "group-empty" ||
      (node.level === 2 && node.children.length === 0)) &&
    (filters.issue !== "inconsistent" || node.inconsistent);
}

export function hasActiveFilters(filters: CategoryFiltersState): boolean {
  return Boolean(
    filters.search.trim() ||
      filters.level !== "all" ||
      filters.status !== "all" ||
      filters.withoutProducts ||
      filters.issue,
  );
}

export function statFilterToQuery(
  filter: string,
): Record<string, string | undefined> {
  if (filter === "all") {
    return {
      search: undefined,
      level: undefined,
      status: undefined,
      withoutProducts: undefined,
      issue: undefined,
    };
  }
  if (filter.startsWith("level-")) {
    return {
      level: filter.slice(-1),
      status: undefined,
      withoutProducts: undefined,
      issue: undefined,
    };
  }
  if (filter === "active" || filter === "inactive") {
    return {
      status: filter,
      level: undefined,
      withoutProducts: undefined,
      issue: undefined,
    };
  }
  if (filter === "without-products") {
    return {
      withoutProducts: "1",
      level: undefined,
      status: undefined,
      issue: undefined,
    };
  }
  if (filter === "family-empty") {
    return {
      level: undefined,
      withoutProducts: undefined,
      status: undefined,
      issue: "family-empty",
    };
  }
  if (filter === "group-empty") {
    return {
      level: undefined,
      withoutProducts: undefined,
      status: undefined,
      issue: "group-empty",
    };
  }
  return {
    search: undefined,
    level: undefined,
    status: undefined,
    withoutProducts: undefined,
    issue: "inconsistent",
  };
}
