import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import { BrandDetailSheet } from "./brand-details/brand-detail-sheet";
import { BrandCollection } from "./brand-list/brand-collection";
import { BrandToolbar } from "./brand-toolbar/brand-toolbar";
import type {
  BrandDetailData,
  BrandSearchParams,
} from "./types/brand-dashboard-types";

const BRAND_PATHNAME = "/dashboard/brand";

interface BrandDashboardProps {
  brands: UIBrand[];
  total: number;
  pageSize: number;
  productPageSize: number;
  searchState: BrandSearchParams;
  detail: BrandDetailData | undefined;
}

/**
 * Casca da central de marcas (Server Component). Compoe a toolbar (Client) e a
 * colecao (Server) nas duas variantes (grade/lista). A toolbar decide qual
 * variante exibir conforme o modo de visualizacao efemero escolhido pelo
 * usuario. O painel de detalhes e controlado por `brandId` na URL.
 */
export function BrandDashboard({
  brands,
  total,
  pageSize,
  productPageSize,
  searchState,
  detail,
}: BrandDashboardProps) {
  const grid = (
    <BrandCollection
      brands={brands}
      total={total}
      pageSize={pageSize}
      searchState={searchState}
      pathname={BRAND_PATHNAME}
      viewMode="grid"
    />
  );

  const list = (
    <BrandCollection
      brands={brands}
      total={total}
      pageSize={pageSize}
      searchState={searchState}
      pathname={BRAND_PATHNAME}
      viewMode="list"
    />
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Marcas</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Crie, edite e gerencie as marcas dos seus produtos.
        </p>
      </div>

      <BrandToolbar searchState={searchState} grid={grid} list={list} />

      <BrandDetailSheet
        brandId={searchState.brandId}
        detail={detail}
        productPage={searchState.productPage}
        productPageSize={productPageSize}
        searchState={searchState}
        pathname={BRAND_PATHNAME}
        currentPageBrandCount={brands.length}
      />
    </div>
  );
}
