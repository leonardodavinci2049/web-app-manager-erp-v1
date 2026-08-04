"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UIProductManager } from "@/services/api-main/product-manager/transformers/transformers";
import { ProductCharacteristicsCard } from "./ProductCharacteristicsCard";
import { ProductGeneralDataCard } from "./ProductGeneralDataCard";
import { ProductDescriptionEditor } from "./tab-card-components/ProductDescriptionEditor";
import { ProductMetadataCard } from "./tab-card-components/ProductMetadataCard";
import { ProductTaxValuesCard } from "./tab-card-components/ProductTaxValuesCard";
import { ProductTechnicalDataCard } from "./tab-card-components/ProductTechnicalDataCard";

interface ProductDetailsTabsProps {
  product: UIProductManager;
  productId: number;
  imagesContent: ReactNode;
}

export function ProductDetailsTabs({
  product,
  productId,
  imagesContent,
}: ProductDetailsTabsProps) {
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
        <ProductDescriptionEditor
          productId={productId}
          initialDescription={product.notes || ""}
        />
      </TabsContent>

      <TabsContent value="images" className="space-y-4">
        {imagesContent}
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

      <TabsContent value="deletion">
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive text-base">
              Zona de exclusão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground text-sm">
              A exclusão de produtos ainda não está disponível nesta tela.
            </p>
            <Button type="button" variant="destructive" disabled>
              Excluir produto — Pendente de API
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
