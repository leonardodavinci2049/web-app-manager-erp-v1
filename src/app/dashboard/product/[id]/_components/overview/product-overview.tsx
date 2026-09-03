import type {
  UIProductManager,
  UIProductManagerRelatedCategory,
} from "@/services/api-main/product-manager/transformers/transformers";
import { formatCurrency } from "@/utils/common-utils";
import { ProductCategoriesCard } from "./product-categories-card";
import { ProductPricingCard } from "./product-pricing-card";
import { ProductSalesDescriptionEditor } from "./product-sales-description-editor";
import { ProductStockCard } from "./product-stock-card";

interface ProductOverviewProps {
  product: UIProductManager;
  relatedCategories: UIProductManagerRelatedCategory[];
}

export function ProductOverview({
  product,
  relatedCategories,
}: ProductOverviewProps) {
  const retailPriceRaw = product.retailPrice
    ? Number.parseFloat(product.retailPrice)
    : 0;
  const wholesalePriceRaw = product.wholesalePrice
    ? Number.parseFloat(product.wholesalePrice)
    : 0;
  const corporatePriceRaw = product.corporatePrice
    ? Number.parseFloat(product.corporatePrice)
    : 0;

  const retailPrice =
    retailPriceRaw > 0 ? formatCurrency(retailPriceRaw) : null;
  const wholesalePrice =
    wholesalePriceRaw > 0 ? formatCurrency(wholesalePriceRaw) : null;
  const corporatePrice =
    corporatePriceRaw > 0 ? formatCurrency(corporatePriceRaw) : null;

  const stockLevel = product.storeStock ?? 0;
  const isOutOfStock = stockLevel === 0;
  const isLowStock = stockLevel > 0 && stockLevel <= 5;
  const stockStatus = isOutOfStock
    ? ({ label: "Sem Estoque", variant: "destructive" } as const)
    : isLowStock
      ? ({ label: "Estoque Baixo", variant: "secondary" } as const)
      : ({ label: "Em Estoque", variant: "default" } as const);

  return (
    <div className="space-y-3 sm:space-y-4">
      <ProductPricingCard
        productId={product.id}
        retailPrice={retailPrice}
        wholesalePrice={wholesalePrice}
        corporatePrice={corporatePrice}
        retailPriceRaw={retailPriceRaw}
        wholesalePriceRaw={wholesalePriceRaw}
        corporatePriceRaw={corporatePriceRaw}
      />

      <ProductStockCard
        productId={product.id}
        stockLevel={stockLevel}
        isOutOfStock={isOutOfStock}
        isLowStock={isLowStock}
        stockStatus={stockStatus}
      />

      <ProductCategoriesCard
        relatedCategories={relatedCategories}
        productId={product.id}
      />

      <ProductSalesDescriptionEditor
        productId={product.id}
        initialDescription={product.salesDescription ?? null}
      />
    </div>
  );
}
