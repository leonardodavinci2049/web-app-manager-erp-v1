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
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="grid h-auto w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <TabsTrigger value="description" className="min-h-9 whitespace-normal">
          Descrição
        </TabsTrigger>
        <TabsTrigger value="images" className="min-h-9 whitespace-normal">
          Imagens
        </TabsTrigger>

        <TabsTrigger
          value="specifications"
          className="min-h-9 whitespace-normal"
        >
          Especificações
        </TabsTrigger>
        <TabsTrigger value="technical" className="min-h-9 whitespace-normal">
          Dados Técnicos
        </TabsTrigger>
        <TabsTrigger value="metadata" className="min-h-9 whitespace-normal">
          Metadados
        </TabsTrigger>
        <TabsTrigger value="deletion" className="min-h-9 whitespace-normal">
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
