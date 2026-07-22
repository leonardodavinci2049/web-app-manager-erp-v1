import type {
  CategoryDetailDto,
  CategoryNodeDto,
  CategoryProductDto,
} from "../category-types";
import { CategoryProductsTab } from "../products/category-products-tab";
import { CategoryDetailForm } from "./category-detail-form";
import { CategoryDetailHeader } from "./category-detail-header";
import { CategoryDetailTabs } from "./category-detail-tabs";

export interface CategoryDetailPanelProps {
  detail: CategoryDetailDto;
  flatCategories: CategoryNodeDto[];
  tab: "details" | "products";
  productSearch: string;
  products: CategoryProductDto[];
  productTotal: number;
}

export function CategoryDetailPanel({
  detail,
  flatCategories,
  tab,
  productSearch,
  products,
  productTotal,
}: CategoryDetailPanelProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <CategoryDetailHeader detail={detail} tab={tab} />
      <CategoryDetailTabs tab={tab} />
      <div className="flex-1 overflow-y-auto p-4 pb-24 lg:p-6">
        {tab === "details" ? (
          <CategoryDetailForm detail={detail} flatCategories={flatCategories} />
        ) : (
          <CategoryProductsTab
            detail={detail}
            products={products}
            total={productTotal}
            productSearch={productSearch}
          />
        )}
      </div>
    </div>
  );
}
