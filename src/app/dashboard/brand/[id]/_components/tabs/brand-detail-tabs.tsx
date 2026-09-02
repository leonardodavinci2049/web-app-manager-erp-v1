"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import type { BrandProductDto } from "../../../_components/types/brand-dashboard-types";
import { BrandAnnotationsTab } from "./brand-annotations-tab";
import { BrandDeletionTab } from "./brand-deletion-tab";
import { BrandImagesTab } from "./brand-images-tab";
import { BrandMiscellaneousTab } from "./brand-miscellaneous-tab";
import { BrandProductsTab } from "./brand-products-tab";

const TAB_TRIGGER_CLASS_NAME =
  "h-8 min-w-max flex-none snap-start px-3 text-xs sm:h-9 sm:text-sm lg:min-w-0 lg:px-2";

interface BrandDetailTabsProps {
  brand: UIBrand;
  products: BrandProductDto[];
  productTotal: number;
  productPage: number;
  productPageSize: number;
  returnTo: string;
  productReturnTo: string;
  hasProductsError: boolean;
  imageGallery: ReactNode;
  imageTabContent: ReactNode;
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
  imageGallery,
  imageTabContent,
}: BrandDetailTabsProps) {
  const router = useRouter();

  return (
    <Tabs defaultValue="annotations" className="w-full gap-3 sm:gap-4">
      <TabsList
        className="h-auto w-full snap-x justify-start gap-1 overflow-x-auto p-1 lg:grid lg:grid-cols-5 lg:overflow-visible"
        aria-label="Seções do detalhe da marca"
      >
        <TabsTrigger value="annotations" className={TAB_TRIGGER_CLASS_NAME}>
          Anotações
        </TabsTrigger>
        <TabsTrigger value="products" className={TAB_TRIGGER_CLASS_NAME}>
          Produtos
        </TabsTrigger>
        <TabsTrigger value="image" className={TAB_TRIGGER_CLASS_NAME}>
          Imagem
        </TabsTrigger>
        <TabsTrigger value="miscellaneous" className={TAB_TRIGGER_CLASS_NAME}>
          Diversos
        </TabsTrigger>
        <TabsTrigger value="deletion" className={TAB_TRIGGER_CLASS_NAME}>
          Exclusão
        </TabsTrigger>
      </TabsList>

      <TabsContent value="annotations" className="space-y-4">
        <BrandAnnotationsTab notes={brand.notes} />
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

      <TabsContent value="image" className="space-y-4">
        <BrandImagesTab
          imageGallery={imageGallery}
          imageTabContent={imageTabContent}
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
