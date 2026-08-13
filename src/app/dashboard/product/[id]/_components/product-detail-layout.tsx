import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type {
  UIProductManager,
  UIProductManagerRelatedCategory,
} from "@/services/api-main/product-manager/transformers/transformers";
import {
  ProductImageGalleryServer,
  ProductImagePathSelectorServer,
} from "./image-gallery";
import { ProductOverview } from "./overview/product-overview";
import { ProductDetailTabs } from "./tabs/product-detail-tabs";

interface ProductDetailLayoutProps {
  product: UIProductManager;
  productId: number;
  relatedCategories: UIProductManagerRelatedCategory[];
  returnTo: string;
}

export function ProductDetailLayout({
  product,
  productId,
  relatedCategories,
  returnTo,
}: ProductDetailLayoutProps) {
  const imageGallery = (
    <ProductImageGalleryServer
      productId={productId}
      productName={product.name}
    />
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="outline" size="sm">
          <Link href={returnTo}>
            <ArrowLeft className="mr-2 size-4" />
            Voltar ao catálogo
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,500px)_minmax(0,1fr)]">
        <aside className="hidden lg:block lg:self-start lg:sticky lg:top-6">
          {imageGallery}
        </aside>

        <ProductOverview
          product={product}
          relatedCategories={relatedCategories}
        />
      </div>

      <ProductDetailTabs
        product={product}
        mobileImageGallery={imageGallery}
        imagePathContent={
          <ProductImagePathSelectorServer
            productId={productId}
            initialProductImagePath={product.imagePath ?? ""}
          />
        }
      />
    </div>
  );
}
