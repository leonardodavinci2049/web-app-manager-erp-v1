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

const GRID_CLASS = "grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6";
const LIST_CLASS = "space-y-4";

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
    <div className="space-y-6">
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
        <div className="flex justify-center pt-6">
          <LoadMoreButton />
        </div>
      ) : (
        <div className="py-6 text-center">
          <p className="text-muted-foreground text-sm">
            Todos os produtos foram carregados
          </p>
        </div>
      )}
    </div>
  );
}
