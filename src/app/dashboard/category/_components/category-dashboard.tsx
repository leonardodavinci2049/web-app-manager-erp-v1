import { FolderTree } from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoryDashboardHeader } from "./category-dashboard-header";
import { CategoryEmptyState } from "./category-empty-state";
import type {
  CategoryDetailDto,
  CategoryFiltersState,
  CategoryNodeDto,
  CategoryProductDto,
  CategoryStatsDto,
} from "./category-types";
import { CategoryDetailPanel } from "./details/category-detail-panel";
import { CategoryStatStrip } from "./summary/category-stat-strip";
import { CategoryTree } from "./tree/category-tree";

export interface CategoryDashboardProps {
  tree: CategoryNodeDto[];
  flatCategories: CategoryNodeDto[];
  stats: CategoryStatsDto;
  detail?: CategoryDetailDto;
  products: CategoryProductDto[];
  productTotal: number;
  filters: CategoryFiltersState;
  tab: "details" | "products";
  productSearch: string;
  productPage: number;
  productsPerPage: number;
  dataError?: string;
}

export function CategoryDashboard(props: CategoryDashboardProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <CategoryDashboardHeader />
      {props.dataError && (
        <div className="mx-3 mb-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive lg:mx-6">
          {props.dataError}
        </div>
      )}
      <CategoryStatStrip stats={props.stats} />
      {props.tree.length === 0 ? (
        <CategoryEmptyState detail={props.detail} />
      ) : (
        <div className="grid min-h-[600px] flex-1 md:grid-cols-[300px_minmax(0,1fr)] md:overflow-hidden">
          <div className={cn("min-h-0", props.detail && "hidden md:block")}>
            <CategoryTree
              tree={props.tree}
              selectedId={props.detail?.id}
              filters={props.filters}
            />
          </div>
          <main
            className={cn("min-w-0 bg-card", !props.detail && "hidden md:flex")}
          >
            {!props.detail ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <FolderTree className="mb-3 size-10" />
                <p>Selecione uma categoria na árvore para ver os detalhes.</p>
              </div>
            ) : (
              <CategoryDetailPanel
                detail={props.detail}
                flatCategories={props.flatCategories}
                tab={props.tab}
                productSearch={props.productSearch}
                productPage={props.productPage}
                productsPerPage={props.productsPerPage}
                products={props.products}
                productTotal={props.productTotal}
              />
            )}
          </main>
        </div>
      )}
    </div>
  );
}
