"use client";

import { AlertTriangle, Info, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import { buildBrandUrl } from "../lib/search-params";
import type {
  BrandDetailData,
  BrandSearchParams,
} from "../types/brand-dashboard-types";
import { BrandDeleteDialog } from "./brand-delete-dialog";
import { BrandDetailForm } from "./brand-detail-form";
import { BrandProductsList } from "./brand-products-list";

interface BrandDetailSheetProps {
  brandId: number | undefined;
  detail: BrandDetailData | undefined;
  productPage: number;
  productPageSize: number;
  searchState: BrandSearchParams;
  pathname: string;
  currentPageBrandCount: number;
}

function formatDate(value?: string): string {
  if (!value) return "—";
  const timestamp = Date.parse(value.replace(" ", "T"));
  if (Number.isNaN(timestamp)) return value;
  return new Date(timestamp).toLocaleDateString("pt-BR");
}

/**
 * Painel de detalhes da marca (Client), controlado por `brandId` na URL.
 * Somente um detalhe pode estar aberto. Organiza dados do cadastro, produtos
 * relacionados e zona de exclusao. Fecha removendo `brandId` e `productPage`
 * preservando busca/pagina; apos exclusao, retorna a pagina anterior quando a
 * atual ficar vazia.
 */
export function BrandDetailSheet({
  brandId,
  detail,
  productPage,
  productPageSize,
  searchState,
  pathname,
  currentPageBrandCount,
}: BrandDetailSheetProps) {
  const router = useRouter();
  const open = Boolean(brandId);
  const [isDirty, setIsDirty] = useState(false);
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);

  const closeUrl = buildBrandUrl(
    { search: searchState.search, page: searchState.page },
    pathname,
  );

  const handleClose = useCallback(() => {
    setIsDirty(false);
    router.replace(closeUrl);
    router.refresh();
  }, [router, closeUrl]);

  const handleOpenChange = (next: boolean) => {
    if (next) return;
    if (isDirty) {
      setIsDiscardOpen(true);
      return;
    }
    handleClose();
  };

  const handleSaved = () => {
    setIsDirty(false);
    router.refresh();
  };

  const handleDeleted = () => {
    setIsDirty(false);
    const targetPage =
      currentPageBrandCount <= 1 && searchState.page > 0
        ? searchState.page - 1
        : searchState.page;
    router.replace(
      buildBrandUrl({ search: searchState.search, page: targetPage }, pathname),
    );
    router.refresh();
  };

  const brandReturnTo = buildBrandUrl(searchState, pathname);

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="right"
          className="flex w-[90vw] max-w-md flex-col gap-0 p-0 sm:max-w-md"
        >
          <SheetHeader className="shrink-0 border-b p-4 pr-12 sm:p-6 sm:pr-14">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <Tag className="text-primary size-5" aria-hidden="true" />
              Detalhes da marca
            </SheetTitle>
            <SheetDescription className="sr-only">
              Painel de detalhes e edição da marca selecionada.
            </SheetDescription>
          </SheetHeader>

          {!detail || !brandId ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
              <AlertTriangle className="text-muted-foreground size-10" />
              <h3 className="text-base font-semibold">
                Não foi possível carregar a marca
              </h3>
              <p className="text-muted-foreground text-sm">
                Tente fechar e abrir novamente o detalhe.
              </p>
            </div>
          ) : (
            <DetailBody
              brand={detail.brand}
              products={detail.products}
              productTotal={detail.productTotal}
              productPage={productPage}
              productPageSize={productPageSize}
              brandReturnTo={brandReturnTo}
              onSaved={handleSaved}
              onDeleted={handleDeleted}
              onDirtyChange={setIsDirty}
            />
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDiscardOpen} onOpenChange={setIsDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
            <AlertDialogDescription>
              Existem alterações não salvas no formulário da marca. Fechar o
              painel descartará esses dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar editando</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setIsDiscardOpen(false);
                handleClose();
              }}
            >
              Descartar alterações
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface DetailBodyProps {
  brand: UIBrand;
  products: BrandDetailData["products"];
  productTotal: number;
  productPage: number;
  productPageSize: number;
  brandReturnTo: string;
  onSaved: () => void;
  onDeleted: () => void;
  onDirtyChange: (dirty: boolean) => void;
}

function DetailBody({
  brand,
  products,
  productTotal,
  productPage,
  productPageSize,
  brandReturnTo,
  onSaved,
  onDeleted,
  onDirtyChange,
}: DetailBodyProps) {
  const isBlocked = productTotal > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
      <section className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h3 className="break-words text-xl font-semibold">{brand.name}</h3>
            <p className="text-muted-foreground text-xs tabular-nums">
              ID: {brand.id}
            </p>
          </div>
          {brand.inactive ? (
            <Badge variant="secondary">Inativa</Badge>
          ) : (
            <Badge variant="outline">Ativa</Badge>
          )}
        </div>

        <dl className="text-muted-foreground grid grid-cols-2 gap-2 text-xs">
          <div>
            <dt className="font-medium text-foreground">Cadastrada em</dt>
            <dd>{formatDate(brand.createdAt)}</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Atualizada em</dt>
            <dd>{formatDate(brand.updatedAt)}</dd>
          </div>
        </dl>
      </section>

      <Separator />

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Dados do cadastro</h4>
        <BrandDetailForm
          key={brand.id}
          brand={brand}
          onSaved={onSaved}
          onDirtyChange={onDirtyChange}
        />
      </section>

      <Separator />

      <section>
        <BrandProductsList
          brandId={brand.id}
          products={products}
          productTotal={productTotal}
          productPage={productPage}
          pageSize={productPageSize}
          brandReturnTo={brandReturnTo}
        />
      </section>

      <Separator />

      <section className="space-y-2">
        <h4 className="text-sm font-semibold text-destructive">
          Zona de exclusão
        </h4>
        {isBlocked && (
          <p className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-400">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>
              Esta marca possui {productTotal}{" "}
              {productTotal === 1
                ? "produto relacionado"
                : "produtos relacionados"}{" "}
              e não pode ser excluída. Remova ou troque a marca dos produtos
              antes de tentar novamente.
            </span>
          </p>
        )}
        <BrandDeleteDialog
          brandId={brand.id}
          brandName={brand.name}
          blocked={isBlocked}
          blockedReason={
            isBlocked
              ? "Exclusão bloqueada pela presença de produtos relacionados."
              : undefined
          }
          onSuccess={onDeleted}
        />
      </section>
    </div>
  );
}
