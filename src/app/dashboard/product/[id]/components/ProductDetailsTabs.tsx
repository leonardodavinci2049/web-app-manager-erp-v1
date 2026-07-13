"use client";

import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UIProductManager } from "@/services/api-main/product-manager/transformers/transformers";
import { ProductCharacteristicsCard } from "./ProductCharacteristicsCard";
import { ProductGeneralDataCard } from "./ProductGeneralDataCard";
import { ProductDescriptionEditor } from "./tab-card-components/ProductDescriptionEditor";
import ProductImagesList from "./tab-card-components/ProductImagesList";
import { ProductMetadataCard } from "./tab-card-components/ProductMetadataCard";
import { ProductTaxValuesCard } from "./tab-card-components/ProductTaxValuesCard";
import { ProductTechnicalDataCard } from "./tab-card-components/ProductTechnicalDataCard";

interface ProductDetailsTabsProps {
  product: UIProductManager;
  productId: number;
}

export function ProductDetailsTabs({
  product,
  productId,
}: ProductDetailsTabsProps) {
  const router = useRouter();

  // Refresh data after successful updates
  const handleDataChange = () => {
    router.refresh();
  };

  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto">
        <TabsTrigger
          value="description"
          className="flex items-center gap-2 whitespace-nowrap"
        >
          Descrição
        </TabsTrigger>
        <TabsTrigger
          value="images"
          className="flex items-center gap-2 whitespace-nowrap"
        >
          Imagens
        </TabsTrigger>

        <TabsTrigger
          value="specifications"
          className="flex items-center gap-2 whitespace-nowrap"
        >
          Especificações
        </TabsTrigger>
        <TabsTrigger
          value="technical"
          className="flex items-center gap-2 whitespace-nowrap"
        >
          Dados Técnicos
        </TabsTrigger>
        <TabsTrigger
          value="metadata"
          className="flex items-center gap-2 whitespace-nowrap"
        >
          Metadados
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="space-y-4">
        <ProductDescriptionEditor
          productId={productId}
          initialDescription={product.notes || ""}
        />
      </TabsContent>

      <TabsContent value="images" className="space-y-4">
        <ProductImagesList product={product} productId={productId} />
      </TabsContent>

      <TabsContent value="specifications" className="space-y-4">
        {/* Card 1 - Dados Gerais */}
        <ProductGeneralDataCard
          productId={productId}
          productName={product.name}
          descriptionTab={product.shortDescription || ""}
          label={product.label || ""}
          reference={product.ref || ""}
          model={product.model || ""}
        />

        {/* Card 2 - Características */}
        <ProductCharacteristicsCard
          productId={productId}
          warrantyDays={product.warrantyDays}
          weightGr={product.weightGr ?? 0}
          lengthMm={product.lengthMm ?? 0}
          widthMm={product.widthMm ?? 0}
          heightMm={product.heightMm ?? 0}
          diameterMm={product.diameterMm ?? 0}
        />

        {/* Card 3 - Taxas */}
        <ProductTaxValuesCard
          productId={productId}
          cfop={product.cfop}
          cst={product.cst}
          ean={product.ean}
          ncm={product.ncm}
          nbm={product.nbm}
          ppb={product.ppb}
          temp={product.temp}
        />
      </TabsContent>

      <TabsContent value="technical" className="space-y-4">
        <ProductTechnicalDataCard
          product={product}
          productId={productId}
          onDataChange={handleDataChange}
        />
      </TabsContent>

      <TabsContent value="metadata" className="space-y-4">
        <ProductMetadataCard
          metaTitle={product.metaTitle ?? null}
          metaDescription={product.metaDescription ?? null}
          createdAt={product.createdAt ?? ""}
          updatedAt={product.updatedAt ?? null}
          slug={product.slug ?? null}
        />
      </TabsContent>
    </Tabs>
  );
}
