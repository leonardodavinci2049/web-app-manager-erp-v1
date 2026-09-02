"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import { BrandImage } from "../../_components/brand-list/brand-image";
import type { BrandProductDto } from "../../_components/types/brand-dashboard-types";
import { BrandDetailForm } from "./brand-detail-form";
import { BrandDetailTabs } from "./tabs/brand-detail-tabs";

interface BrandDetailsProps {
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

export function BrandDetails({
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
}: BrandDetailsProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <Button
        asChild
        variant="outline"
        size="sm"
        className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
      >
        <Link href={returnTo}>
          <ArrowLeft className="size-4" />
          Voltar às marcas
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[minmax(280px,500px)_minmax(0,1fr)]">
        <aside className="hidden lg:block lg:row-span-2 lg:self-start lg:sticky lg:top-6">
          {imageGallery}
        </aside>

        <div className="flex min-w-0 items-start gap-3">
          <BrandImage
            name={brand.name}
            imagePath={brand.imagePath}
            viewMode="list"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="break-words text-2xl font-bold">{brand.name}</h1>
              <Badge variant={brand.inactive ? "secondary" : "outline"}>
                {brand.inactive ? "Inativa" : "Ativa"}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-sm tabular-nums">
              Marca ID {brand.id}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dados do cadastro</CardTitle>
          </CardHeader>
          <CardContent>
            <BrandDetailForm
              key={brand.id}
              brand={brand}
              onSaved={() => router.refresh()}
            />
          </CardContent>
        </Card>
      </div>

      <BrandDetailTabs
        brand={brand}
        products={products}
        productTotal={productTotal}
        productPage={productPage}
        productPageSize={productPageSize}
        returnTo={returnTo}
        productReturnTo={productReturnTo}
        hasProductsError={hasProductsError}
        imageGallery={imageGallery}
        imageTabContent={imageTabContent}
      />
    </div>
  );
}
