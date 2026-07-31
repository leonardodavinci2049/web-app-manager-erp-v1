"use client";

import { ArrowLeft, CalendarDays, Info, Tag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
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
}: BrandDetailsProps) {
  const router = useRouter();
  const isDeleteBlocked = productTotal > 0 || hasProductsError;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Tag className="text-primary size-6" aria-hidden="true" />
            <h1 className="break-words text-2xl font-bold">{brand.name}</h1>
            <Badge variant={brand.inactive ? "secondary" : "outline"}>
              {brand.inactive ? "Inativa" : "Ativa"}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm tabular-nums">
            Marca ID {brand.id}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={returnTo}>
            <ArrowLeft className="size-4" />
            Voltar às marcas
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
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
        </div>

        <div className="space-y-4">
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

          <Card>
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
        </div>
      </div>
    </div>
  );
}
