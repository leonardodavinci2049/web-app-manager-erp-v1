"use client";

import type { ReactNode } from "react";
import {
  DetailImageTab,
  DetailTabsList,
  DetailTabTrigger,
} from "@/app/dashboard/_components/detail-page";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type {
  UIPurchasingProduct,
  UIPurchasingRelatedCategory,
  UIPurchasingRelatedSupplier,
} from "@/services/api-main/purchasing/transformers/transformers";
import { formatCurrency } from "@/utils/common-utils";
import { DetailField } from "./detail-field";

interface PurchasingDetailTabsProps {
  product: UIPurchasingProduct;
  relatedCategories: UIPurchasingRelatedCategory[];
  relatedSuppliers: UIPurchasingRelatedSupplier[];
  mobileImageGallery: ReactNode;
  imageReferences: ReactNode;
}

function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(date);
}

function SupplierTab({
  suppliers,
}: {
  suppliers: UIPurchasingRelatedSupplier[];
}) {
  if (suppliers.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Nenhum fornecedor relacionado foi informado para este produto.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {suppliers.map((supplier) => {
        return (
          <Card key={supplier.supplierId}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{supplier.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <dl className="grid gap-3 sm:grid-cols-2">
                <DetailField label="ID">{supplier.supplierId}</DetailField>
                <DetailField label="Referência do produto">
                  {supplier.productRef}
                </DetailField>
                <DetailField label="Referência do fornecedor">
                  {supplier.supplierRef}
                </DetailField>
                <DetailField label="Vínculos cadastrados">
                  {supplier.registerCount.toLocaleString("pt-BR")}
                </DetailField>
                <DetailField label="Atualização">
                  {formatDate(supplier.updatedAt)}
                </DetailField>
                <DetailField label="Telefone">{supplier.phone}</DetailField>
                <DetailField label="WhatsApp">{supplier.whatsapp}</DetailField>
                <DetailField label="E-mail">{supplier.email}</DetailField>
                <DetailField label="Website">{supplier.website}</DetailField>
              </dl>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function NotesTab({ product }: { product: UIPurchasingProduct }) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Anotações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm">
            {product.notes?.trim() || "Nenhuma anotação informada."}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Descrição de venda</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm">
            {product.salesDescription?.trim() ||
              "Nenhuma descrição de venda informada."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function SpecificationsTab({
  product,
  categories,
}: {
  product: UIPurchasingProduct;
  categories: UIPurchasingRelatedCategory[];
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identificação</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-2">
            <DetailField label="ID">{product.id}</DetailField>
            <DetailField label="SKU">{product.sku}</DetailField>
            <DetailField label="Referência">{product.ref}</DetailField>
            <DetailField label="Modelo">{product.model}</DetailField>
            <DetailField label="Etiqueta">{product.label}</DetailField>
            <DetailField label="Descrição curta">
              {product.shortDescription}
            </DetailField>
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Características físicas</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-2">
            <DetailField label="Peso">
              {product.weightGr !== undefined
                ? `${product.weightGr.toLocaleString("pt-BR")} g`
                : "—"}
            </DetailField>
            <DetailField label="Comprimento">
              {product.lengthMm !== undefined
                ? `${product.lengthMm.toLocaleString("pt-BR")} mm`
                : "—"}
            </DetailField>
            <DetailField label="Largura">
              {product.widthMm !== undefined
                ? `${product.widthMm.toLocaleString("pt-BR")} mm`
                : "—"}
            </DetailField>
            <DetailField label="Altura">
              {product.heightMm !== undefined
                ? `${product.heightMm.toLocaleString("pt-BR")} mm`
                : "—"}
            </DetailField>
            <DetailField label="Diâmetro">
              {product.diameterMm !== undefined
                ? `${product.diameterMm.toLocaleString("pt-BR")} mm`
                : "—"}
            </DetailField>
            <DetailField label="Garantia">
              {product.warrantyDays > 0 ? `${product.warrantyDays} dias` : "—"}
            </DetailField>
          </dl>
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Categorias relacionadas</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge key={category.taxonomyId} variant="secondary">
                  {category.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma categoria vinculada.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TechnicalTab({ product }: { product: UIPurchasingProduct }) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados técnicos e fiscais</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-2">
            <DetailField label="EAN">{product.ean}</DetailField>
            <DetailField label="NCM">{product.ncm}</DetailField>
            <DetailField label="NBM">{product.nbm}</DetailField>
            <DetailField label="CFOP">{product.cfop}</DetailField>
            <DetailField label="CST">{product.cst}</DetailField>
            <DetailField label="PPB">{product.ppb}</DetailField>
            <DetailField label="TEMP">{product.temp}</DetailField>
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preços por faixa</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-2">
            <DetailField label="Atacado">
              {formatCurrency(Number(product.wholesalePrice))}
            </DetailField>
            <DetailField label="Varejo">
              {formatCurrency(Number(product.retailPrice))}
            </DetailField>
            <DetailField label="Corporativo">
              {formatCurrency(Number(product.corporatePrice))}
            </DetailField>
            <DetailField label="Ouro">
              {formatCurrency(Number(product.goldPrice))}
            </DetailField>
            <DetailField label="Prata">
              {formatCurrency(Number(product.silverPrice))}
            </DetailField>
            <DetailField label="Bronze">
              {formatCurrency(Number(product.bronzePrice))}
            </DetailField>
          </dl>
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Sinalizadores</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant={product.imported ? "default" : "secondary"}>
            {product.imported ? "Importado" : "Nacional"}
          </Badge>
          <Badge variant={product.promotion ? "default" : "outline"}>
            {product.promotion ? "Em promoção" : "Sem promoção"}
          </Badge>
          <Badge variant={product.featured ? "default" : "outline"}>
            {product.featured ? "Em destaque" : "Sem destaque"}
          </Badge>
          <Badge variant={product.isService ? "default" : "outline"}>
            {product.isService ? "Serviço" : "Produto"}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}

function MetadataTab({ product }: { product: UIPurchasingProduct }) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Metadados</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3">
            <DetailField label="Slug">{product.slug}</DetailField>
            <DetailField label="Caminho da página">
              {product.pagePath}
            </DetailField>
            <DetailField label="Título SEO">{product.metaTitle}</DetailField>
            <DetailField label="Descrição SEO">
              {product.metaDescription}
            </DetailField>
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Auditoria</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3">
            <DetailField label="Criado em">
              {formatDate(product.createdAt)}
            </DetailField>
            <DetailField label="Atualizado em">
              {formatDate(product.updatedAt)}
            </DetailField>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

export function PurchasingDetailTabs({
  product,
  relatedCategories,
  relatedSuppliers,
  mobileImageGallery,
  imageReferences,
}: PurchasingDetailTabsProps) {
  return (
    <Tabs defaultValue="notes" className="space-y-4">
      <DetailTabsList
        columns={6}
        ariaLabel="Seções do produto com necessidade de compra"
      >
        <DetailTabTrigger value="notes">Anotações</DetailTabTrigger>
        <DetailTabTrigger value="image">Imagem</DetailTabTrigger>
        <DetailTabTrigger value="supplier">Fornecedor</DetailTabTrigger>
        <DetailTabTrigger value="specifications">
          Especificações
        </DetailTabTrigger>
        <DetailTabTrigger value="technical">Dados técnicos</DetailTabTrigger>
        <DetailTabTrigger value="metadata">Metadados</DetailTabTrigger>
      </DetailTabsList>
      <TabsContent value="notes">
        <NotesTab product={product} />
      </TabsContent>
      <TabsContent value="image">
        <DetailImageTab mobileGallery={mobileImageGallery}>
          {imageReferences}
        </DetailImageTab>
      </TabsContent>
      <TabsContent value="supplier">
        <SupplierTab suppliers={relatedSuppliers} />
      </TabsContent>
      <TabsContent value="specifications">
        <SpecificationsTab product={product} categories={relatedCategories} />
      </TabsContent>
      <TabsContent value="technical">
        <TechnicalTab product={product} />
      </TabsContent>
      <TabsContent value="metadata">
        <MetadataTab product={product} />
      </TabsContent>
    </Tabs>
  );
}
