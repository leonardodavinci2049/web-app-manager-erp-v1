import { PackageSearch, SearchX, TriangleAlert } from "lucide-react";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import { buildBrandDetailHref } from "../lib/search-params";
import type {
  BrandSearchParams,
  BrandViewMode,
} from "../types/brand-dashboard-types";
import { BrandCard } from "./brand-card";
import { BrandPagination } from "./brand-pagination";
import { BrandTable } from "./brand-table";

interface BrandCollectionProps {
  brands: UIBrand[];
  total: number;
  pageSize: number;
  searchState: BrandSearchParams;
  pathname: string;
  viewMode: BrandViewMode;
  hasLoadError: boolean;
}

const GRID_CLASS =
  "grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] sm:gap-3 lg:gap-4";
const LIST_CLASS = "space-y-2 sm:space-y-3";
const EAGER_IMAGE_COUNT = 6;

/**
 * Colecao de marcas (Server Component). Renderiza grade ou lista (cards no
 * mobile, tabela no desktop) com estados vazio e de busca sem resultados, alem
 * da paginacao tradicional e do resumo de intervalo/total.
 */
export function BrandCollection({
  brands,
  total,
  pageSize,
  searchState,
  pathname,
  viewMode,
  hasLoadError,
}: BrandCollectionProps) {
  const buildDetailHref = (brandId: number) =>
    buildBrandDetailHref(brandId, searchState, pathname);

  if (hasLoadError) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <TriangleAlert className="text-destructive mb-4 size-14" />
        <h2 className="text-lg font-semibold">
          Não foi possível carregar as marcas
        </h2>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          Atualize a página para tentar novamente. A pesquisa foi preservada.
        </p>
      </div>
    );
  }

  if (total === 0) {
    const hasSearch = searchState.search.trim() !== "";
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        {hasSearch ? (
          <SearchX className="text-muted-foreground mb-4 h-16 w-16" />
        ) : (
          <PackageSearch className="text-muted-foreground mb-4 h-16 w-16" />
        )}
        <h3 className="mb-2 text-lg font-semibold">
          {hasSearch ? "Nenhuma marca encontrada" : "Nenhuma marca cadastrada"}
        </h3>
        <p className="text-muted-foreground max-w-md">
          {hasSearch
            ? "Não encontramos marcas que correspondam à pesquisa. Tente outro termo."
            : "Comece adicionando a primeira marca do seu catálogo."}
        </p>
      </div>
    );
  }

  const pageStart = total > 0 ? searchState.page * pageSize + 1 : 0;
  const pageEnd = Math.min((searchState.page + 1) * pageSize, total);

  return (
    <div className="space-y-4">
      {viewMode === "grid" ? (
        <div className={GRID_CLASS}>
          {brands.map((brand, index) => (
            <BrandCard
              key={brand.id}
              brandId={brand.id}
              brandName={brand.name}
              imagePath={brand.imagePath}
              viewMode="grid"
              detailHref={buildDetailHref(brand.id)}
              eager={index < EAGER_IMAGE_COUNT}
            />
          ))}
        </div>
      ) : (
        <>
          <div className={`${LIST_CLASS} lg:hidden`}>
            {brands.map((brand, index) => (
              <BrandCard
                key={brand.id}
                brandId={brand.id}
                brandName={brand.name}
                imagePath={brand.imagePath}
                viewMode="list"
                detailHref={buildDetailHref(brand.id)}
                eager={index === 0}
              />
            ))}
          </div>
          <div className="hidden lg:block">
            <BrandTable brands={brands} buildDetailHref={buildDetailHref} />
          </div>
        </>
      )}

      <div className="flex flex-col items-center gap-3 pt-2">
        <p className="text-muted-foreground text-xs tabular-nums">
          Exibindo {pageStart}–{pageEnd} de {total}{" "}
          {total === 1 ? "marca" : "marcas"}
        </p>
        <BrandPagination
          currentPage={searchState.page}
          total={total}
          pageSize={pageSize}
        />
      </div>
    </div>
  );
}
