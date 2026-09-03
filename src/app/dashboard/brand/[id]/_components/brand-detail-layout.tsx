import type { ReactNode } from "react";
import { DetailPageLayout } from "@/app/dashboard/_components/detail-page";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import type { BrandProductDto } from "../../_components/types/brand-dashboard-types";
import { BrandDetailFormSection } from "./overview/brand-detail-form-section";
import { BrandHeadDataSection } from "./overview/brand-head-data-section";
import { BrandDetailTabs } from "./tabs/brand-detail-tabs";

interface BrandDetailLayoutProps {
  brand: UIBrand;
  products: BrandProductDto[];
  productTotal: number;
  productPage: number;
  productPageSize: number;
  returnTo: string;
  productReturnTo: string;
  hasProductsError: boolean;
  imageGallery: ReactNode;
  imageContent: ReactNode;
}

export function BrandDetailLayout({
  brand,
  products,
  productTotal,
  productPage,
  productPageSize,
  returnTo,
  productReturnTo,
  hasProductsError,
  imageGallery,
  imageContent,
}: BrandDetailLayoutProps) {
  return (
    <DetailPageLayout
      returnTo={returnTo}
      backLinkLabel="Voltar às marcas"
      imageGallery={imageGallery}
      heading={<BrandHeadDataSection brand={brand} />}
      overview={<BrandDetailFormSection key={brand.id} brand={brand} />}
      sectionsTitle="Seções da marca"
      sectionsDescription="Consulte e atualize os dados complementares da marca."
    >
      <BrandDetailTabs
        brand={brand}
        products={products}
        productTotal={productTotal}
        productPage={productPage}
        productPageSize={productPageSize}
        returnTo={returnTo}
        productReturnTo={productReturnTo}
        hasProductsError={hasProductsError}
        imageContent={imageContent}
        mobileImageGallery={imageGallery}
      />
    </DetailPageLayout>
  );
}
