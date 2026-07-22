export type CategoryLevel = 1 | 2 | 3;

export type CategoryStatus = "active" | "inactive";

export type CategoryFilterLevel = "all" | "1" | "2" | "3";

export type CategoryFilterStatus = "all" | "active" | "inactive";

export interface CategoryFiltersState {
  search: string;
  level: CategoryFilterLevel;
  status: CategoryFilterStatus;
  withoutProducts: boolean;
  issue: string;
}

export interface CategoryNodeDto {
  id: number;
  parentId: number;
  name: string;
  slug: string;
  imagePath?: string;
  level: CategoryLevel;
  order: number;
  directProductCount: number;
  status: CategoryStatus;
  inconsistent: boolean;
  issues: string[];
  children: CategoryNodeDto[];
}

export interface CategoryDetailDto {
  id: number;
  parentId: number;
  name: string;
  slug: string;
  imagePath?: string;
  level: CategoryLevel;
  order: number;
  directProductCount: number;
  status: CategoryStatus;
  metaTitle: string;
  metaDescription: string;
  notes: string;
  breadcrumb: Array<{ id: number; name: string }>;
  childCount: number;
}

export interface CategoryProductDto {
  id: number;
  sku: number;
  name: string;
  ean?: string;
  brand: string;
  inactive: boolean;
}

export interface CategoryStatsDto {
  total: number;
  families: number;
  groups: number;
  subgroups: number;
  active: number;
  inactive: number;
  withoutProducts: number;
  familiesWithoutGroups: number;
  groupsWithoutSubgroups: number;
  inconsistencies: number;
}

export interface CategoryActionResult {
  success: boolean;
  message: string;
  categoryId?: number;
  fieldErrors?: Record<string, string[]>;
}
