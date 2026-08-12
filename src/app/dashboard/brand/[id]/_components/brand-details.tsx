"use client";

import { ArrowLeft, CalendarDays, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import { BrandImage } from "../../_components/brand-list/brand-image";
import type { BrandProductDto } from "../../_components/types/brand-dashboard-types";
import { BrandDeleteDialog } from "./brand-delete-dialog";
import { BrandDetailForm } from "./brand-detail-form";
import { BrandProductsList } from "./brand-products-list";

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

function formatDate(value?: string): string {
  if (!value) return "Não informada";
  const timestamp = Date.parse(value.replace(" ", "T"));
  if (Number.isNaN(timestamp)) return value;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(
    timestamp,
  );
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
  const isDeleteBlocked = productTotal > 0 || hasProductsError;

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

        <div className="space-y-4">
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="size-4" />
                Cadastro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-muted-foreground text-xs">
                    Cadastrada em
                  </dt>
                  <dd className="mt-1 text-sm font-medium">
                    {formatDate(brand.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">
                    Atualizada em
                  </dt>
                  <dd className="mt-1 text-sm font-medium">
                    {formatDate(brand.updatedAt)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-3">
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="image">Imagem</TabsTrigger>
          <TabsTrigger value="deletion">Exclusão</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Produtos relacionados</CardTitle>
            </CardHeader>
            <CardContent>
              {hasProductsError ? (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <p className="font-medium">
                    Não foi possível carregar os produtos relacionados.
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Os demais dados da marca permanecem disponíveis.
                  </p>
                </div>
              ) : (
                <BrandProductsList
                  brandId={brand.id}
                  products={products}
                  productTotal={productTotal}
                  productPage={productPage}
                  pageSize={productPageSize}
                  brandReturnTo={productReturnTo}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="image" className="space-y-4">
          <div className="mx-auto w-full max-w-[500px] lg:hidden">
            {imageGallery}
          </div>
          {imageTabContent}
        </TabsContent>

        <TabsContent value="deletion">
          <Card className="border-destructive/40 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive text-base">
                Zona de exclusão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isDeleteBlocked && (
                <p className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-400">
                  <Info
                    className="mt-0.5 size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>
                    {hasProductsError
                      ? "A exclusão está indisponível enquanto os vínculos da marca não puderem ser verificados."
                      : `Esta marca possui ${productTotal} ${productTotal === 1 ? "produto relacionado" : "produtos relacionados"}. Remova ou troque a marca desses produtos antes de excluir.`}
                  </span>
                </p>
              )}
              <BrandDeleteDialog
                brandId={brand.id}
                brandName={brand.name}
                blocked={isDeleteBlocked}
                blockedReason={
                  isDeleteBlocked
                    ? "Exclusão bloqueada enquanto houver vínculos ou a verificação estiver indisponível."
                    : undefined
                }
                onSuccess={() => router.replace(returnTo)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
