"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UIProductManager } from "@/services/api-main/product-manager/transformers/transformers";
import { ProductDeletionTab } from "./product-deletion-tab";
import { ProductDescriptionTab } from "./product-description-tab";
import { ProductImagesTab } from "./product-images-tab";
import { ProductMetadataTab } from "./product-metadata-tab";
import { ProductSpecificationsTab } from "./product-specifications-tab";
import { ProductTechnicalTab } from "./product-technical-tab";

const TAB_TRIGGER_CLASS_NAME =
  "h-8 min-w-max flex-none snap-start px-3 text-xs sm:h-9 sm:text-sm lg:min-w-0 lg:px-2";

interface ProductDetailTabsProps {
  product: UIProductManager;
  imagePathContent: ReactNode;
  mobileImageGallery: ReactNode;
}

export function ProductDetailTabs({
  product,
  imagePathContent,
  mobileImageGallery,
}: ProductDetailTabsProps) {
  const router = useRouter();

  // Refresh data after successful updates
  const handleDataChange = () => {
    router.refresh();
  };

  return (
    <Tabs defaultValue="description" className="w-full gap-3 sm:gap-4">
      <TabsList
        className="h-auto w-full snap-x justify-start gap-1 overflow-x-auto p-1 lg:grid lg:grid-cols-6 lg:overflow-visible"
        aria-label="Seções do detalhe do produto"
      >
        <TabsTrigger value="description" className={TAB_TRIGGER_CLASS_NAME}>
          Descrição
        </TabsTrigger>
        <TabsTrigger value="images" className={TAB_TRIGGER_CLASS_NAME}>
          Imagens
        </TabsTrigger>
        <TabsTrigger value="specifications" className={TAB_TRIGGER_CLASS_NAME}>
          Especificações
        </TabsTrigger>
        <TabsTrigger value="technical" className={TAB_TRIGGER_CLASS_NAME}>
          Dados Técnicos
        </TabsTrigger>
        <TabsTrigger value="metadata" className={TAB_TRIGGER_CLASS_NAME}>
          Metadados
        </TabsTrigger>
        <TabsTrigger value="deletion" className={TAB_TRIGGER_CLASS_NAME}>
          Exclusão
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="space-y-4">
        <ProductDescriptionTab
          productId={product.id}
          initialDescription={product.notes || ""}
        />
      </TabsContent>

      <TabsContent value="images" className="space-y-4">
        <ProductImagesTab
          imagePathContent={imagePathContent}
          mobileImageGallery={mobileImageGallery}
        />
      </TabsContent>

      <TabsContent value="specifications" className="space-y-4">
        <ProductSpecificationsTab product={product} />
      </TabsContent>

      <TabsContent value="technical" className="space-y-4">
        <ProductTechnicalTab
          product={product}
          productId={product.id}
          onDataChange={handleDataChange}
        />
      </TabsContent>

      <TabsContent value="metadata" className="space-y-4">
        <ProductMetadataTab
          metaTitle={product.metaTitle ?? null}
          metaDescription={product.metaDescription ?? null}
          createdAt={product.createdAt ?? ""}
          updatedAt={product.updatedAt ?? null}
          slug={product.slug ?? null}
        />
      </TabsContent>

      <TabsContent value="deletion">
        <ProductDeletionTab />
      </TabsContent>
    </Tabs>
  );
}
