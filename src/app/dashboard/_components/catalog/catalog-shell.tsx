import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import type { UIProductPdv } from "@/services/api-main/product-pdv/transformers/transformers";
import type { UIPtype } from "@/services/api-main/ptype/transformers/transformers";
import { CatalogToolbar } from "./catalog-toolbar/catalog-toolbar";
import { ProductGrid } from "./product-grid/product-grid";
import type { CategoryOption, ViewMode } from "./types/catalog-types";

interface CatalogShellProps {
  products: UIProductPdv[];
  brands: UIBrand[];
  categories: CategoryOption[];
  ptypes: UIPtype[];
  viewMode: ViewMode;
  catalogReturnTo: string;
  limit: number;
}

/**
 * Casca do catalogo (Server Component). Apenas compoe a toolbar (Client) e o
 * grid (Server). O grid e passado como `children` da toolbar para que o
 * overlay de `isPending` envolva uma unica arvore.
 */
export function CatalogShell({
  products,
  brands,
  categories,
  ptypes,
  viewMode,
  catalogReturnTo,
  limit,
}: CatalogShellProps) {
  return (
    <CatalogToolbar
      products={products}
      brands={brands}
      categories={categories}
      ptypes={ptypes}
      viewMode={viewMode}
    >
      <ProductGrid
        products={products}
        viewMode={viewMode}
        catalogReturnTo={catalogReturnTo}
        limit={limit}
      />
    </CatalogToolbar>
  );
}
