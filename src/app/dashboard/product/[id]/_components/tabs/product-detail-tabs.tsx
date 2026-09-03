"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  DetailImageTab,
  DetailTabsList,
  DetailTabTrigger,
} from "@/app/dashboard/_components/detail-page";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { UIProductManager } from "@/services/api-main/product-manager/transformers/transformers";
import { ProductDeletionTab } from "./product-deletion-tab";
import { ProductDescriptionTab } from "./product-description-tab";
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
    <Tabs defaultValue="notes" className="w-full gap-3 sm:gap-4">
      <DetailTabsList columns={6} ariaLabel="Seções do detalhe do produto">
        <DetailTabTrigger value="notes">Anotações</DetailTabTrigger>
        <DetailTabTrigger value="image">Imagem</DetailTabTrigger>
        <DetailTabTrigger value="specifications">
          Especificações
        </DetailTabTrigger>
        <DetailTabTrigger value="technical">Dados Técnicos</DetailTabTrigger>
        <DetailTabTrigger value="metadata">Metadados</DetailTabTrigger>
        <DetailTabTrigger value="deletion">Exclusão</DetailTabTrigger>
      </DetailTabsList>

      <TabsContent value="notes" className="space-y-4">
        <ProductDescriptionTab
          productId={product.id}
          initialDescription={product.notes || ""}
        />
      </TabsContent>

      <TabsContent value="image" className="space-y-4">
        <DetailImageTab mobileGallery={mobileImageGallery}>
          {imagePathContent}
        </DetailImageTab>
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
