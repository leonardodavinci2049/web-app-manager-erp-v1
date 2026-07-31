import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import { BrandCollection } from "./brand-list/brand-collection";
import { BrandToolbar } from "./brand-toolbar/brand-toolbar";
import type { BrandSearchParams } from "./types/brand-dashboard-types";

const BRAND_PATHNAME = "/dashboard/brand";

interface BrandDashboardProps {
  brands: UIBrand[];
  total: number;
  pageSize: number;
  searchState: BrandSearchParams;
  hasLoadError: boolean;
}

/**
 * Casca da central de marcas (Server Component). Compoe a toolbar (Client) e a
 * colecao (Server) nas duas variantes (grade/lista). A toolbar decide qual
 * variante exibir conforme o modo de visualizacao efemero escolhido pelo
 * usuario. Cada item navega para sua rota dedicada de detalhes.
 */
export function BrandDashboard({
  brands,
  total,
  pageSize,
  searchState,
  hasLoadError,
}: BrandDashboardProps) {
  const grid = (
    <BrandCollection
      brands={brands}
      total={total}
      pageSize={pageSize}
      searchState={searchState}
      pathname={BRAND_PATHNAME}
      viewMode="grid"
      hasLoadError={hasLoadError}
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
      hasLoadError={hasLoadError}
    />
  );

  return (
    <div className="space-y-4">
      <BrandToolbar searchState={searchState} grid={grid} list={list} />
    </div>
  );
}
