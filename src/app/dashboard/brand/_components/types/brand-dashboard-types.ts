import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";

export type BrandViewMode = "grid" | "list";

export const BRAND_PAGE_SIZE = 50;
export const BRAND_PRODUCT_PAGE_SIZE = 50;

export interface BrandSearchParams {
  search: string;
  page: number;
  brandId: number | undefined;
  productPage: number;
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
