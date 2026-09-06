import { DetailPageLayout } from "@/app/dashboard/_components/detail-page";
import type {
  UIPurchasingProduct,
  UIPurchasingRelatedCategory,
  UIPurchasingRelatedSupplier,
} from "@/services/api-main/purchasing/transformers/transformers";
import {
  PurchasingImageGalleryServer,
  PurchasingImageReferencesServer,
} from "./image-gallery";
import { PurchasingIdentity } from "./overview/purchasing-identity";
import { PurchasingOverview } from "./overview/purchasing-overview";
import { PurchasingDetailTabs } from "./tabs/purchasing-detail-tabs";

interface PurchasingDetailLayoutProps {
  product: UIPurchasingProduct;
  relatedCategories: UIPurchasingRelatedCategory[];
  relatedSuppliers: UIPurchasingRelatedSupplier[];
  returnTo: string;
}

export function PurchasingDetailLayout({
  product,
  relatedCategories,
  relatedSuppliers,
  returnTo,
}: PurchasingDetailLayoutProps) {
  const imageGallery = (
    <PurchasingImageGalleryServer
      productId={product.id}
      productName={product.name}
    />
  );

  return (
    <DetailPageLayout
      returnTo={returnTo}
      backLinkLabel="Voltar à necessidade de compra"
      imageGallery={imageGallery}
      heading={<PurchasingIdentity product={product} />}
      overview={
        <PurchasingOverview
          product={product}
          relatedCategories={relatedCategories}
        />
      }
      sectionsTitle="Informações do produto"
      sectionsDescription="Consulte os dados complementares usados na análise de reposição."
    >
      <PurchasingDetailTabs
        product={product}
        relatedCategories={relatedCategories}
        relatedSuppliers={relatedSuppliers}
        mobileImageGallery={imageGallery}
        imageReferences={
          <PurchasingImageReferencesServer
            productId={product.id}
            currentImagePath={product.imagePath}
          />
        }
      />
    </DetailPageLayout>
  );
}
