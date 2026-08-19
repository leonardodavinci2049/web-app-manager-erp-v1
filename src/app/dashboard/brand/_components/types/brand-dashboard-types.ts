import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";

export type BrandViewMode = "grid" | "list";
export type BrandSort = "id" | "name";
export type BrandOrder = "asc" | "desc";
export type BrandPageLimit = 25 | 50 | 100;

export const BRAND_PAGE_SIZE: BrandPageLimit = 50;
export const BRAND_PRODUCT_PAGE_SIZE = 50;

export interface BrandSearchParams {
  search: string;
  sort: BrandSort;
  order: BrandOrder;
  page: number;
  limit: BrandPageLimit;
}

export interface BrandProductDto {
  id: number;
  sku: number;
  name: string;
  ref: string;
  model: string;
  imagePath?: string;
}

export interface BrandDetailData {
  brand: UIBrand;
  products: BrandProductDto[];
  productTotal: number;
}

export interface BrandActionResult {
  success: boolean;
  message: string;
  brandId?: number;
  fieldErrors?: Record<string, string[]>;
}

export interface BrandListingImageResult {
  success: boolean;
  message?: string;
  error?: string;
  warning?: string;
}
