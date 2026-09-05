import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import type { UIProductManager } from "@/services/api-main/product-manager/transformers/transformers";
import type { UIPtype } from "@/services/api-main/ptype/transformers/transformers";
import { ProductGrid } from "./product-list/product-grid/product-grid";
import { ProductToolbar } from "./product-toolbar/product-toolbar";
import type {
  CategoryOption,
  ProductCreateTaxonomyOption,
} from "./types/product-dashboard-types";

interface ProductDashboardProps {
  products: UIProductManager[];
  total: number;
  page: number;
  pageSize: number;
  brands: UIBrand[];
  categories: CategoryOption[];
  ptypes: UIPtype[];
  newProductTaxonomy: ProductCreateTaxonomyOption[];
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
export function ProductDashboard({
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
}: ProductDashboardProps) {
  return (
    <ProductToolbar
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
