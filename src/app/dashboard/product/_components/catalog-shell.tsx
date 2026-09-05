import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import type { UIProductManager } from "@/services/api-main/product-manager/transformers/transformers";
import type { UIPtype } from "@/services/api-main/ptype/transformers/transformers";
import { CatalogToolbar } from "./catalog-toolbar/catalog-toolbar";
import { ProductGrid } from "./product-grid/product-grid";
import type {
  CategoryOption,
  NewProductTaxonomyOption,
} from "./types/catalog-types";

interface CatalogShellProps {
  products: UIProductManager[];
  total: number;
  page: number;
  pageSize: number;
  brands: UIBrand[];
  categories: CategoryOption[];
  ptypes: UIPtype[];
  newProductTaxonomy: NewProductTaxonomyOption[];
  isNewProductTaxonomyAvailable: boolean;
  catalogReturnTo: string;
  hasProductsLoadError: boolean;
}

/**
 * Casca do catalogo (Server Component). Apenas compoe a toolbar (Client) e o
 * grid (Server) nas duas variantes (grade/lista). A toolbar decide qual
 * variante exibir conforme o modo de visualizacao escolhido pelo usuario
 * (preferencia client-side, sem refetch).
 */
export function CatalogShell({
  products,
  total,
  page,
  pageSize,
  brands,
  categories,
  ptypes,
  newProductTaxonomy,
  isNewProductTaxonomyAvailable,
  catalogReturnTo,
  hasProductsLoadError,
}: CatalogShellProps) {
  return (
    <CatalogToolbar
      products={products}
      total={total}
      brands={brands}
      categories={categories}
      ptypes={ptypes}
      newProductTaxonomy={newProductTaxonomy}
      isNewProductTaxonomyAvailable={isNewProductTaxonomyAvailable}
      grid={
        <ProductGrid
          products={products}
          viewMode="grid"
          catalogReturnTo={catalogReturnTo}
          total={total}
          page={page}
          pageSize={pageSize}
          hasLoadError={hasProductsLoadError}
        />
      }
      list={
        <ProductGrid
          products={products}
          viewMode="list"
          catalogReturnTo={catalogReturnTo}
          total={total}
          page={page}
          pageSize={pageSize}
          hasLoadError={hasProductsLoadError}
        />
      }
    />
  );
}
