import { Package } from "lucide-react";
import type { UIProductPdv } from "@/services/api-main/product-pdv/transformers/transformers";
import { ProductCard } from "../product-card/product-card";
import type { ViewMode } from "../types/catalog-types";
import { LoadMoreButton } from "./load-more-button";

interface ProductGridProps {
  products: UIProductPdv[];
  viewMode: ViewMode;
  catalogReturnTo: string;
  limit: number;
}

const GRID_CLASS =
  "grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] sm:gap-3 lg:gap-4";
const LIST_CLASS = "space-y-2 sm:space-y-3";

/**
 * Grid de produtos (Server Component). Apenas layout + .map() + empty state.
 * A interatividade (carregar mais) vive na ilha client <LoadMoreButton/>.
 */
export function ProductGrid({
  products,
  viewMode,
  catalogReturnTo,
  limit,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="text-muted-foreground mb-4 h-16 w-16" />
        <h3 className="mb-2 text-lg font-semibold">
          Nenhum produto encontrado
        </h3>
        <p className="text-muted-foreground max-w-md">
          Não encontramos produtos que correspondam aos filtros aplicados. Tente
          ajustar os filtros ou limpar a pesquisa.
        </p>
      </div>
    );
  }

  const hasMore = products.length >= limit;

  return (
    <div className="space-y-4">
      <div className={viewMode === "grid" ? GRID_CLASS : LIST_CLASS}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            viewMode={viewMode}
            catalogReturnTo={catalogReturnTo}
          />
        ))}
      </div>

      {hasMore ? (
        <div className="flex justify-center pt-4">
          <LoadMoreButton />
        </div>
      ) : (
        <div className="py-4 text-center">
          <p className="text-muted-foreground text-sm">
            Todos os produtos foram carregados
          </p>
        </div>
      )}
    </div>
  );
}
