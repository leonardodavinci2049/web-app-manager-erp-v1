"use client";

import { Eye, Shield } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { UIProductPdv } from "@/services/api-main/product-pdv/transformers/transformers";
import type { ProductCategory } from "@/types/types";
import { formatCurrency } from "@/utils/common-utils";
import { CategoryTags } from "./CategoryTags";
import { InlineCategoryEditor } from "./InlineCategoryEditor";
import { InlineNameEditor } from "./InlineNameEditor";
import { InlinePriceEditor } from "./InlinePriceEditor";
import { InlineStockEditor } from "./InlineStockEditor";
import { ProductCardClient } from "./ProductCardClient";

interface ProductCardProps {
  product: UIProductPdv;
  viewMode: "grid" | "list";
  onViewDetails?: (productId: number) => void;
  productDetailsHref?: string;
  onImageUploadSuccess?: () => void;
}

export function ProductCard({
  product,
  viewMode,
  onViewDetails,
  productDetailsHref,
  onImageUploadSuccess,
}: ProductCardProps) {
  const retailPrice = Number(product.retailPrice) || 0;
  const wholesalePrice = Number(product.wholesalePrice) || 0;
  const corporatePrice = Number(product.corporatePrice) || 0;
  const discountPrice = Number(product.discount) || 0;

  const [currentStock, setCurrentStock] = useState(product.storeStock);
  const [currentRetailPrice, setCurrentRetailPrice] = useState(retailPrice);
  const [currentWholesalePrice, setCurrentWholesalePrice] =
    useState(wholesalePrice);
  const [currentCorporatePrice, setCurrentCorporatePrice] =
    useState(corporatePrice);
  const [currentName, setCurrentName] = useState(product.name);
  const [currentCategories, setCurrentCategories] = useState<ProductCategory[]>(
    () => {
      if (!product.categories) return [];
      try {
        const parsed: unknown = JSON.parse(product.categories);
        return Array.isArray(parsed) ? (parsed as ProductCategory[]) : [];
      } catch {
        return [];
      }
    },
  );

  const hasPromotion =
    product.promotion && discountPrice > 0 && discountPrice < retailPrice;

  const handleStockUpdated = (newStock: number) => {
    setCurrentStock(newStock);
  };

  const handlePricesUpdated = (
    newRetailPrice: number,
    newWholesalePrice: number,
    newCorporatePrice: number,
  ) => {
    setCurrentRetailPrice(newRetailPrice);
    setCurrentWholesalePrice(newWholesalePrice);
    setCurrentCorporatePrice(newCorporatePrice);
  };

  const handleNameUpdated = (newName: string) => {
    setCurrentName(newName);
  };

  const handleCategoriesUpdated = (categories: ProductCategory[]) => {
    setCurrentCategories(categories);
  };

  if (viewMode === "list") {
    return (
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            <div className="flex-shrink-0">
              <ProductCardClient
                product={product}
                viewMode={viewMode}
                productDetailsHref={productDetailsHref}
                onImageUploadSuccess={onImageUploadSuccess}
              />
            </div>

            <div className="flex-1 flex flex-col gap-4">
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex-1 min-w-0 space-y-2">
                    <InlineNameEditor
                      productId={product.id}
                      productName={currentName}
                      productDetailsHref={productDetailsHref}
                      onNameUpdated={handleNameUpdated}
                    />
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <p className="text-muted-foreground">
                        SKU: {product.sku}
                      </p>
                      {product.brand && (
                        <p className="text-muted-foreground">
                          Marca: {product.brand}
                        </p>
                      )}
                      {product.type && (
                        <p className="text-muted-foreground">
                          Tipo: {product.type}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:max-w-xs">
                {hasPromotion && (
                  <div className="mb-2">
                    <p className="text-muted-foreground text-xs md:text-sm line-through">
                      Preço original: {formatCurrency(retailPrice)}
                    </p>
                  </div>
                )}
                <InlinePriceEditor
                  productId={product.id}
                  productName={product.name}
                  retailPrice={currentRetailPrice}
                  wholesalePrice={currentWholesalePrice}
                  corporatePrice={currentCorporatePrice}
                  onPricesUpdated={handlePricesUpdated}
                />
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <InlineStockEditor
                  productId={product.id}
                  productName={product.name}
                  currentStock={currentStock}
                  onStockUpdated={handleStockUpdated}
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
                productName={currentName}
                onCategoriesUpdated={handleCategoriesUpdated}
              />
              <CategoryTags categories={currentCategories} />

              <div className="flex">
                <Button
                  size="sm"
                  onClick={() => onViewDetails?.(product.id)}
                  className="gap-2 w-full md:w-auto"
                >
                  <Eye className="h-4 w-4" />
                  Ver detalhes
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group mx-auto sm:mx-0 w-full max-w-[360px] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg sm:max-w-[500px]">
      <CardContent className="flex h-full flex-col p-4">
        <ProductCardClient
          product={product}
          viewMode={viewMode}
          productDetailsHref={productDetailsHref}
          onImageUploadSuccess={onImageUploadSuccess}
          hasPromotion={hasPromotion}
        />

        <div className="mt-4 flex flex-1 flex-col gap-3">
          <div className="space-y-2">
            <InlineNameEditor
              productId={product.id}
              productName={currentName}
              productDetailsHref={productDetailsHref}
              onNameUpdated={handleNameUpdated}
              className="text-sm"
            />
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <p className="text-muted-foreground">SKU: {product.sku}</p>
              {product.brand && (
                <p className="text-muted-foreground">Marca: {product.brand}</p>
              )}
              {product.type && (
                <p className="text-muted-foreground">Tipo: {product.type}</p>
              )}
            </div>
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
              retailPrice={currentRetailPrice}
              wholesalePrice={currentWholesalePrice}
              corporatePrice={currentCorporatePrice}
              onPricesUpdated={handlePricesUpdated}
            />
          </div>

          <div className="space-y-1">
            <InlineStockEditor
              productId={product.id}
              productName={product.name}
              currentStock={currentStock}
              onStockUpdated={handleStockUpdated}
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
            productName={currentName}
            onCategoriesUpdated={handleCategoriesUpdated}
          />
          <CategoryTags categories={currentCategories} />

          <div className="flex-1"></div>

          <Button
            size="sm"
            className="mt-auto w-full gap-2"
            onClick={() => onViewDetails?.(product.id)}
          >
            <Eye className="h-4 w-4" />
            Ver detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
