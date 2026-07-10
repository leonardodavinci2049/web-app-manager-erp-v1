import { Eye } from "lucide-react";
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
  eagerImage?: boolean;
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
  eagerImage = false,
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
      <Card className="gap-0 py-0 transition-all duration-200 hover:shadow-md">
        <CardContent className="p-1 sm:p-1.5">
          <div className="flex gap-2">
            <div className="flex-shrink-0">
              <ProductImageSection
                product={product}
                viewMode={viewMode}
                productDetailsHref={productDetailsHref}
                hasPromotion={hasPromotion}
                eager={eagerImage}
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="space-y-0.5">
                <InlineNameEditor
                  productId={product.id}
                  productName={product.name}
                  productDetailsHref={productDetailsHref}
                  className="[&_h3]:text-xs [&_h3]:sm:text-sm"
                />
                <ProductCardFields
                  product={product}
                  textSize="xs"
                  listStock={
                    <InlineStockEditor
                      productId={product.id}
                      productName={product.name}
                      currentStock={product.storeStock}
                      className="min-w-0 text-xs font-medium"
                    />
                  }
                />
              </div>

              <div className="border-y py-1">
                <InlinePriceEditor
                  productId={product.id}
                  productName={product.name}
                  retailPrice={retailPrice}
                  wholesalePrice={wholesalePrice}
                  corporatePrice={corporatePrice}
                  className="w-full"
                />
                {hasPromotion && (
                  <span className="text-muted-foreground text-xs line-through">
                    {formatCurrency(retailPrice)}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <InlineCategoryEditor
                  productId={product.id}
                  productSku={String(product.sku)}
                  productName={product.name}
                />
                <CategoryTags categories={categories} />
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="ml-auto gap-1 px-2"
                >
                  <Link href={productDetailsHref}>
                    <Eye className="h-4 w-4" />
                    <span className="hidden md:inline">Ver detalhes</span>
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
    <Card className="group h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex h-full flex-col p-1.5 sm:p-2">
        <ProductImageSection
          product={product}
          viewMode={viewMode}
          productDetailsHref={productDetailsHref}
          hasPromotion={hasPromotion}
          eager={eagerImage}
        />

        <div className="mt-1 flex flex-1 flex-col gap-1">
          <InlineNameEditor
            productId={product.id}
            productName={product.name}
            productDetailsHref={productDetailsHref}
            className="[&_h3]:text-xs [&_h3]:sm:text-sm"
          />
          <ProductCardFields product={product} textSize="xs" />

          <InlineStockEditor
            productId={product.id}
            productName={product.name}
            currentStock={product.storeStock}
            className="text-xs font-medium"
          />

          <div className="border-y py-1">
            {hasPromotion && (
              <span className="text-muted-foreground block text-xs leading-tight line-through">
                {formatCurrency(retailPrice)}
              </span>
            )}
            <InlinePriceEditor
              productId={product.id}
              productName={product.name}
              retailPrice={retailPrice}
              wholesalePrice={wholesalePrice}
              corporatePrice={corporatePrice}
              className="w-full"
            />
          </div>

          <InlineCategoryEditor
            productId={product.id}
            productSku={String(product.sku)}
            productName={product.name}
          />
          <CategoryTags categories={categories} />

          <div className="min-h-0 flex-1" />

          <Button asChild size="sm" className="mt-0.5 w-full gap-1">
            <Link href={productDetailsHref}>
              <Eye className="h-3.5 w-3.5" />
              <span className="sm:hidden">Detalhes</span>
              <span className="hidden sm:inline">Ver detalhes</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
