"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  DetailImageTab,
  DetailTabsList,
  DetailTabTrigger,
} from "@/app/dashboard/_components/detail-page";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import type { BrandProductDto } from "../../../_components/types/brand-dashboard-types";
import { BrandAnnotationsTab } from "./brand-annotations-tab";
import { BrandDeletionTab } from "./brand-deletion-tab";
import { BrandMiscellaneousTab } from "./brand-miscellaneous-tab";
import { BrandProductsTab } from "./brand-products-tab";

interface BrandDetailTabsProps {
  brand: UIBrand;
  products: BrandProductDto[];
  productTotal: number;
  productPage: number;
  productPageSize: number;
  returnTo: string;
  productReturnTo: string;
  hasProductsError: boolean;
  imageContent: ReactNode;
  mobileImageGallery: ReactNode;
}

export function BrandDetailTabs({
  brand,
  products,
  productTotal,
  productPage,
  productPageSize,
  returnTo,
  productReturnTo,
  hasProductsError,
  imageContent,
  mobileImageGallery,
}: BrandDetailTabsProps) {
  const router = useRouter();

  return (
    <Tabs defaultValue="annotations" className="w-full gap-3 sm:gap-4">
      <DetailTabsList columns={5} ariaLabel="Seções do detalhe da marca">
        <DetailTabTrigger value="annotations">Anotações</DetailTabTrigger>
        <DetailTabTrigger value="image">Imagem</DetailTabTrigger>
        <DetailTabTrigger value="products">Produtos</DetailTabTrigger>
        <DetailTabTrigger value="miscellaneous">Diversos</DetailTabTrigger>
        <DetailTabTrigger value="deletion">Exclusão</DetailTabTrigger>
      </DetailTabsList>

      <TabsContent value="annotations" className="space-y-4">
        <BrandAnnotationsTab notes={brand.notes} />
      </TabsContent>

      <TabsContent value="image" className="space-y-4">
        <DetailImageTab mobileGallery={mobileImageGallery}>
          {imageContent}
        </DetailImageTab>
      </TabsContent>

      <TabsContent value="products">
        <BrandProductsTab
          brandId={brand.id}
          products={products}
          productTotal={productTotal}
          productPage={productPage}
          productPageSize={productPageSize}
          productReturnTo={productReturnTo}
          hasProductsError={hasProductsError}
        />
      </TabsContent>

      <TabsContent value="miscellaneous" className="space-y-4">
        <BrandMiscellaneousTab
          inactive={brand.inactive}
          createdAt={brand.createdAt}
          updatedAt={brand.updatedAt}
        />
      </TabsContent>

      <TabsContent value="deletion">
        <BrandDeletionTab
          brandId={brand.id}
          brandName={brand.name}
          productTotal={productTotal}
          hasProductsError={hasProductsError}
          onSuccess={() => router.replace(returnTo)}
        />
      </TabsContent>
    </Tabs>
  );
}
