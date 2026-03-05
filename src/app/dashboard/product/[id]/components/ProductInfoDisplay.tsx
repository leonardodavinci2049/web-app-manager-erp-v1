import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type {
  UIProductPdv,
  UIProductPdvRelatedCategory,
} from "@/services/api-main/product-pdv/transformers/transformers";
import { ProductCategoriesCard } from "./ProductCategoriesCard";
import { ProductNameEditor } from "./ProductNameEditor";
import { ProductPricingCard } from "./ProductPricingCard";
import { ShortDescriptionEditor } from "./ShortDescriptionEditor";
import { ProductStockCard } from "./tab-card-components/ProductStockCard";

interface ProductInfoDisplayProps {
  product: UIProductPdv;
  relatedCategories: UIProductPdvRelatedCategory[];
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
        <div className="flex items-center gap-2">
          {/* Stock badge based on storeStock */}
          {product.storeStock > 3 && (
            <Badge
              variant="default"
              className="bg-green-600 hover:bg-green-700"
            >
              Estoque
            </Badge>
          )}
          {product.storeStock > 0 && product.storeStock < 2 && (
            <Badge variant="secondary">Estoque Baixo</Badge>
          )}
          {product.storeStock <= 0 && (
            <Badge variant="destructive">Sem Estoque</Badge>
          )}
        </div>

        <div>
          <ProductNameEditor
            productId={product.id}
            initialName={product.name}
          />
          {product.sku && (
            <p className="text-muted-foreground mt-1">SKU: {product.sku}</p>
          )}
          {product.model && (
            <p className="text-muted-foreground">Modelo: {product.model}</p>
          )}
        </div>

        {/* Rating Stars (Mock - in real app would come from reviews) */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              // biome-ignore lint/suspicious/noArrayIndexKey: static star rating list
              key={`star-${i}`}
              className={`h-4 w-4 ${
                i < 4
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          ))}
          <span className="text-sm text-muted-foreground ml-2">
            (4.0 de 5 - 23 avaliações)
          </span>
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
