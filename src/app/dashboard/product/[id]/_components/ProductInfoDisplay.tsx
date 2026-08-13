import { RegistryEntityImage } from "@/components/registry";
import type {
  UIProductManager,
  UIProductManagerRelatedCategory,
} from "@/services/api-main/product-manager/transformers/transformers";
import { ProductCategoriesCard } from "./ProductCategoriesCard";
import { ProductNameEditor } from "./ProductNameEditor";
import { ProductPricingCard } from "./ProductPricingCard";
import { ShortDescriptionEditor } from "./ShortDescriptionEditor";
import { ProductStockCard } from "./tab-cards/ProductStockCard";

interface ProductInfoDisplayProps {
  product: UIProductManager;
  relatedCategories: UIProductManagerRelatedCategory[];
  stockStatus: {
    label: string;
    variant: "default" | "destructive" | "secondary";
  };
  retailPrice: string | null;
  wholesalePrice: string | null;
  corporatePrice: string | null;
  retailPriceRaw: number;
  wholesalePriceRaw: number;
  corporatePriceRaw: number;
  stockLevel: number;
  isOutOfStock: boolean;
  isLowStock: boolean;
}

export function ProductInfoDisplay({
  product,
  relatedCategories,
  stockStatus,
  retailPrice,
  wholesalePrice,
  corporatePrice,
  retailPriceRaw,
  wholesalePriceRaw,
  corporatePriceRaw,
  stockLevel,
  isOutOfStock,
  isLowStock,
}: ProductInfoDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Product Header */}
      <div className="space-y-4">
        <div className="flex min-w-0 items-start gap-3">
          <RegistryEntityImage
            name={product.name}
            imagePath={product.imagePath}
            defaultImage="/default-images/no-product-image.png"
            entityLabel="do produto"
            viewMode="list"
          />
          <div className="min-w-0 flex-1">
            <ProductNameEditor
              productId={product.id}
              initialName={product.name}
              metadata={
                <>
                  <span className="tabular-nums">ID: #{product.id}</span>
                  {product.sku ? (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>SKU: {product.sku}</span>
                    </>
                  ) : null}
                  {product.model ? (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>Modelo: {product.model}</span>
                    </>
                  ) : null}
                </>
              }
            />
          </div>
        </div>
      </div>

      {/* Pricing Card */}
      <ProductPricingCard
        productId={product.id}
        retailPrice={retailPrice}
        wholesalePrice={wholesalePrice}
        corporatePrice={corporatePrice}
        retailPriceRaw={retailPriceRaw}
        wholesalePriceRaw={wholesalePriceRaw}
        corporatePriceRaw={corporatePriceRaw}
      />

      {/* Stock Info Card */}
      <ProductStockCard
        productId={product.id}
        stockLevel={stockLevel}
        isOutOfStock={isOutOfStock}
        isLowStock={isLowStock}
        stockStatus={stockStatus}
      />

      {/* Categories Card */}
      <ProductCategoriesCard
        relatedCategories={relatedCategories}
        productId={product.id}
      />

      {/* Short Description Editor - Inline editing for sales description */}
      <ShortDescriptionEditor
        productId={product.id}
        initialDescription={product.salesDescription ?? null}
      />
    </div>
  );
}
