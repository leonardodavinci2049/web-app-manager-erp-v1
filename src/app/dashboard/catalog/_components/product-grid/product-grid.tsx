import { Package, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { UIProductManager } from "@/services/api-main/product-manager/transformers/transformers";
import { ProductCard } from "../product-card/product-card";
import { ProductTable } from "../product-table";
import type { ViewMode } from "../types/catalog-types";
import { LoadMoreButton } from "./load-more-button";

interface ProductGridProps {
  products: UIProductManager[];
  viewMode: ViewMode;
  catalogReturnTo: string;
  total: number;
  hasLoadError: boolean;
}

const GRID_CLASS =
  "grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] sm:gap-3 lg:gap-4";
const LIST_CLASS = "space-y-2 sm:space-y-3";
const EAGER_GRID_IMAGE_COUNT = 6;

/**
 * Grid de produtos (Server Component). Apenas layout + .map() + empty state.
 * A interatividade (carregar mais) vive na ilha client <LoadMoreButton/>.
 */
export function ProductGrid({
  products,
  viewMode,
  catalogReturnTo,
  total,
  hasLoadError,
}: ProductGridProps) {
  if (hasLoadError) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <TriangleAlert className="text-destructive mb-4 size-14" />
        <h2 className="text-lg font-semibold">
          Não foi possível carregar os produtos
        </h2>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          O catálogo não recebeu uma resposta válida. Os filtros atuais foram
          preservados.
        </p>
        <Button asChild variant="outline" className="mt-5">
          <Link href={catalogReturnTo}>Tentar novamente</Link>
        </Button>
      </div>
    );
  }

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

  const hasMore = products.length < total;

  return (
    <div className="space-y-4">
      {viewMode === "grid" ? (
        <div className={GRID_CLASS}>
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              viewMode="grid"
              catalogReturnTo={catalogReturnTo}
              eagerImage={index < EAGER_GRID_IMAGE_COUNT}
            />
          ))}
        </div>
      ) : (
        <>
          <div className={`${LIST_CLASS} lg:hidden`}>
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                viewMode="list"
                catalogReturnTo={catalogReturnTo}
                eagerImage={index === 0}
              />
            ))}
          </div>
          <div className="hidden lg:block">
            <ProductTable
              products={products}
              catalogReturnTo={catalogReturnTo}
            />
          </div>
        </>
      )}

      {hasMore ? (
        <div className="flex flex-col items-center gap-2 pt-4">
          <p className="text-muted-foreground text-xs tabular-nums">
            Exibindo {products.length} de {total} produtos
          </p>
          <LoadMoreButton />
        </div>
      ) : (
        <div className="py-4 text-center">
          <p className="text-muted-foreground text-sm">
            Exibindo todos os {total} produtos
          </p>
        </div>
      )}
    </div>
  );
}
