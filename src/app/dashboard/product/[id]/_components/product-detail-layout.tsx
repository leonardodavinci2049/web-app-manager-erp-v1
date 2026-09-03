import { DetailPageLayout } from "@/app/dashboard/_components/detail-page";
import type {
  UIProductManager,
  UIProductManagerRelatedCategory,
} from "@/services/api-main/product-manager/transformers/transformers";
import {
  ProductImageGalleryServer,
  ProductImagePathSelectorServer,
} from "./image-gallery";
import { ProductIdentitySection } from "./overview/product-identity-section";
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
    <DetailPageLayout
      returnTo={returnTo}
      backLinkLabel="Voltar ao catálogo"
      imageGallery={imageGallery}
      heading={<ProductIdentitySection product={product} />}
      overview={
        <ProductOverview
          product={product}
          relatedCategories={relatedCategories}
        />
      }
      sectionsTitle="Seções do produto"
      sectionsDescription="Consulte e atualize os dados complementares do produto."
    >
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
    </DetailPageLayout>
  );
}
