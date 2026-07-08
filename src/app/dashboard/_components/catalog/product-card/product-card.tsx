import { Eye, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { UIProductPdv } from "@/services/api-main/product-pdv/transformers/transformers";
import type { ProductCategory } from "@/types/types";
import { formatCurrency } from "@/utils/common-utils";
import { CategoryTags } from "../category-tags";
import { buildProductDetailsHref } from "../lib/search-params";
import type { ViewMode } from "../types/catalog-types";
import { InlineCategoryEditor } from "./inline-update/inline-category-editor";
import { InlineNameEditor } from "./inline-update/inline-name-editor";
import { InlinePriceEditor } from "./inline-update/inline-price-editor";
import { InlineStockEditor } from "./inline-update/inline-stock-editor";
import { ProductCardFields } from "./product-card-fields";
import { ProductImageSection } from "./product-image-section";

interface ProductCardProps {
  product: UIProductPdv;
  viewMode: ViewMode;
  catalogReturnTo: string;
}

function parseCategories(raw?: string): ProductCategory[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ProductCategory[]) : [];
  } catch {
    return [];
  }
}

/**
 * Card de produto apresentacional (Server Component).
 * Sem estado local: os editores inline (Client) gerenciam o proprio estado
 * pos-mutacao e disparam router.refresh() para sincronizar o servidor.
 */
export function ProductCard({
  product,
  viewMode,
  catalogReturnTo,
}: ProductCardProps) {
  const retailPrice = Number(product.retailPrice) || 0;
  const wholesalePrice = Number(product.wholesalePrice) || 0;
  const corporatePrice = Number(product.corporatePrice) || 0;
  const discountPrice = Number(product.discount) || 0;

  const hasPromotion =
    product.promotion && discountPrice > 0 && discountPrice < retailPrice;

  const categories = parseCategories(product.categories);
  const productDetailsHref = buildProductDetailsHref(
    product.id,
    catalogReturnTo,
  );

  if (viewMode === "list") {
    return (
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:gap-6">
            <div className="flex-shrink-0">
              <ProductImageSection
                product={product}
                viewMode={viewMode}
                productDetailsHref={productDetailsHref}
                hasPromotion={hasPromotion}
              />
            </div>

            <div className="flex flex-1 flex-col gap-4">
              <div className="space-y-2">
                <InlineNameEditor
                  productId={product.id}
                  productName={product.name}
                  productDetailsHref={productDetailsHref}
                />
                <ProductCardFields
                  product={product}
                  textSize="sm"
                  gap="gap-4"
                />
              </div>

              <div className="md:max-w-xs">
                {hasPromotion && (
                  <div className="mb-2">
                    <p className="text-muted-foreground text-xs line-through md:text-sm">
                      Preço original: {formatCurrency(retailPrice)}
                    </p>
                  </div>
                )}
                <InlinePriceEditor
                  productId={product.id}
                  productName={product.name}
                  retailPrice={retailPrice}
                  wholesalePrice={wholesalePrice}
                  corporatePrice={corporatePrice}
                />
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <InlineStockEditor
                  productId={product.id}
                  productName={product.name}
                  currentStock={product.storeStock}
                  className="font-medium"
                />
                {product.warrantyDays > 0 && (
                  <div className="text-muted-foreground flex items-center gap-1 text-xs md:text-sm">
                    <Shield className="h-4 w-4 flex-shrink-0" />
                    <span>{product.warrantyDays} dias</span>
                  </div>
                )}
              </div>

              <InlineCategoryEditor
                productId={product.id}
                productSku={String(product.sku)}
                productName={product.name}
              />
              <CategoryTags categories={categories} />

              <div className="flex">
                <Button asChild size="sm" className="w-full gap-2 md:w-auto">
                  <Link href={productDetailsHref}>
                    <Eye className="h-4 w-4" />
                    Ver detalhes
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group mx-auto w-full max-w-[360px] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg sm:mx-0 sm:max-w-[500px]">
      <CardContent className="flex h-full flex-col p-4">
        <ProductImageSection
          product={product}
          viewMode={viewMode}
          productDetailsHref={productDetailsHref}
          hasPromotion={hasPromotion}
        />

        <div className="mt-4 flex flex-1 flex-col gap-3">
          <div className="space-y-2">
            <InlineNameEditor
              productId={product.id}
              productName={product.name}
              productDetailsHref={productDetailsHref}
              className="text-sm"
            />
            <ProductCardFields product={product} textSize="xs" />
          </div>

          <div className="space-y-1">
            {hasPromotion && (
              <span className="text-muted-foreground block text-xs line-through">
                Preço original: {formatCurrency(retailPrice)}
              </span>
            )}
            <InlinePriceEditor
              productId={product.id}
              productName={product.name}
              retailPrice={retailPrice}
              wholesalePrice={wholesalePrice}
              corporatePrice={corporatePrice}
            />
          </div>

          <div className="space-y-1">
            <InlineStockEditor
              productId={product.id}
              productName={product.name}
              currentStock={product.storeStock}
              className="text-sm font-medium"
            />
            {product.warrantyDays > 0 && (
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <Shield className="h-3 w-3" />
                <span>{product.warrantyDays} dias de garantia</span>
              </div>
            )}
          </div>

          <InlineCategoryEditor
            productId={product.id}
            productSku={String(product.sku)}
            productName={product.name}
          />
          <CategoryTags categories={categories} />

          <div className="flex-1" />

          <Button asChild size="sm" className="mt-auto w-full gap-2">
            <Link href={productDetailsHref}>
              <Eye className="h-4 w-4" />
              Ver detalhes
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
