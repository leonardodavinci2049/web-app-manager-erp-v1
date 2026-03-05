import { Skeleton } from "@/components/ui/skeleton";
// Server Component - não usar hooks de cliente
import type {
  UIProductPdv,
  UIProductPdvRelatedCategory,
} from "@/services/api-main/product-pdv/transformers/transformers";
import { formatCurrency } from "@/utils/common-utils";
import { BackToCatalogButton } from "./BackToCatalogButton";
import { ProductDetailsTabs } from "./ProductDetailsTabs";
import { ProductImageGalleryServer } from "./ProductImageGallery/ProductImageGalleryServer";
import { ProductInfoDisplay } from "./ProductInfoDisplay";

interface ProductDetailsLayoutProps {
  product: UIProductPdv;
  productId: number;
  relatedCategories: UIProductPdvRelatedCategory[];
}

export function ProductDetailsLayout({
  product,
  productId,
  relatedCategories,
}: ProductDetailsLayoutProps) {
  // Helper function to validate and get product image URL
  const getProductImageUrl = (): string => {
    const defaultImage = "/images/product/no-image.jpeg";

    // Check if product has imagePath field
    if (product.imagePath && typeof product.imagePath === "string") {
      const pathImagem = product.imagePath;
      // If imagePath looks like a URL (starts with http/https or /)
      if (pathImagem.startsWith("http") || pathImagem.startsWith("/")) {
        try {
          // Validate URL format for external URLs
          if (pathImagem.startsWith("http")) {
            new URL(pathImagem);
          }
          return pathImagem;
        } catch {
          // Invalid URL format, continue to next check
        }
      } else if (pathImagem.length > 0) {
        // If it's a relative path, make it absolute
        return pathImagem.startsWith("/")
          ? pathImagem
          : `/images/product/${pathImagem}`;
      }
    }

    // Check if slug could be an image path
    if (product.slug && typeof product.slug === "string") {
      // If slug looks like a URL (starts with http/https or /)
      if (product.slug.startsWith("http") || product.slug.startsWith("/")) {
        try {
          // Validate URL format for external URLs
          if (product.slug.startsWith("http")) {
            new URL(product.slug);
          }
          // Only use slug if it looks like an image file
          if (product.slug.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
            return product.slug;
          }
        } catch {
          // Invalid URL format, continue to next check
        }
      }

      // If slug looks like an image filename, construct path
      if (product.slug.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        return `/images/product/${product.slug}`;
      }
    }

    // Default fallback
    return defaultImage;
  };

  const productImage = getProductImageUrl();

  // Format prices - API returns strings like "320.000000"
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

  // Stock status - use storeStock from UIProductPdv
  const stockLevel = product.storeStock ?? 0;
  const isOutOfStock = stockLevel === 0;
  const isLowStock = stockLevel > 0 && stockLevel <= 5;

  const getStockStatus = () => {
    if (isOutOfStock) {
      return {
        label: "Sem Estoque",
        variant: "destructive" as const,
      };
    }
    if (isLowStock) {
      return {
        label: "Estoque Baixo",
        variant: "secondary" as const,
      };
    }
    return {
      label: "Em Estoque",
      variant: "default" as const,
    };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <BackToCatalogButton />
      </div>

      {/* Main Product Layout */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column - Images Gallery (Server Component with Client Component) */}
        <ProductImageGalleryServer
          productId={productId}
          productName={product.name}
          fallbackImage={productImage}
        />

        {/* Right Column - Product Info (Server Component) */}
        <ProductInfoDisplay
          product={product}
          relatedCategories={relatedCategories}
          stockStatus={stockStatus}
          retailPrice={retailPrice}
          wholesalePrice={wholesalePrice}
          corporatePrice={corporatePrice}
          retailPriceRaw={retailPriceRaw}
          wholesalePriceRaw={wholesalePriceRaw}
          corporatePriceRaw={corporatePriceRaw}
          stockLevel={stockLevel}
          isOutOfStock={isOutOfStock}
          isLowStock={isLowStock}
        />
      </div>

      {/* Tabs Section */}
      <ProductDetailsTabs product={product} productId={productId} />
    </div>
  );
}

export function ProductDetailsLayoutSkeleton() {
  return (
    <div className="space-y-6">
      {/* Action Buttons Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-40" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-10" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Main Layout Skeleton */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column - Images */}
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full" />
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
                key={`gallery-skeleton-${i}`}
                className="aspect-square w-full"
              />
            ))}
          </div>
        </div>

        {/* Right Column - Product Info */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
                  key={`rating-skeleton-${i}`}
                  className="h-4 w-4"
                />
              ))}
            </div>
          </div>

          {/* Cards Skeleton */}
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
