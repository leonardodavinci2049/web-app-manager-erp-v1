"use client";

import {
  Loader2,
  PackagePlus,
  PackageSearch,
  Plus,
  RotateCcw,
  Search,
  TriangleAlert,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { RegistryEntityImage } from "@/app/dashboard/_components/registry";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatEntryMoney } from "../../../_components/lib/format";
import {
  createEntryItemAction,
  type EntryItemProductDto,
  searchEntryItemProductsAction,
} from "../../_actions/entry-item-actions";
import {
  EntryItemProductCreateSheet,
  type EntryItemProductFormOptions,
} from "./entry-item-product-create-sheet";

const SEARCH_DEBOUNCE_MS = 400;
const DEFAULT_PRODUCT_IMAGE = "/images/product/no-image.jpeg";

type SearchStatus = "idle" | "loading" | "error" | "success";

interface EntryItemAddDialogProps {
  entryId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingProductIds: number[];
  productFormOptions: EntryItemProductFormOptions;
}

export function EntryItemAddDialog({
  entryId,
  open,
  onOpenChange,
  existingProductIds,
  productFormOptions,
}: EntryItemAddDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [products, setProducts] = useState<EntryItemProductDto[]>([]);
  const [selectingProductId, setSelectingProductId] = useState<number | null>(
    null,
  );
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [createdProductId, setCreatedProductId] = useState<number | null>(null);
  const [createdIncludeError, setCreatedIncludeError] = useState<string | null>(
    null,
  );
  const [isIncludingCreated, setIsIncludingCreated] = useState(false);

  const includedIds = useMemo(
    () => new Set(existingProductIds),
    [existingProductIds],
  );
  const isMutating =
    selectingProductId !== null || isIncludingCreated || isCreateSheetOpen;

  useEffect(() => {
    if (open) {
      setSearchTerm("");
      setStatus("loading");
      setProducts([]);
      setSelectingProductId(null);
      setIsCreateSheetOpen(false);
      setCreatedProductId(null);
      setCreatedIncludeError(null);
      setIsIncludingCreated(false);
    }
  }, [open]);

  const searchRequestRef = useRef(0);

  const runSearch = useCallback(async (term: string) => {
    const requestId = searchRequestRef.current + 1;
    searchRequestRef.current = requestId;
    setStatus("loading");
    try {
      const result = await searchEntryItemProductsAction({ search: term });
      if (searchRequestRef.current !== requestId) return;
      if (!result.success) {
        setStatus("error");
        return;
      }
      setProducts(result.products);
      setStatus("success");
    } catch {
      if (searchRequestRef.current === requestId) setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      void runSearch(searchTerm.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [open, searchTerm, runSearch]);

  const closeDialog = () => {
    if (isMutating) return;
    onOpenChange(false);
  };

  const handleSelect = async (product: EntryItemProductDto) => {
    if (isMutating) return;
    setSelectingProductId(product.productId);
    try {
      const result = await createEntryItemAction({
        entryId,
        productId: product.productId,
      });
      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        return;
      }
      toast.error(result.message);
    } catch {
      toast.error(
        "Não foi possível comunicar com o servidor. Tente novamente.",
      );
    }
    setSelectingProductId(null);
  };

  const includeCreatedProduct = async (productId: number) => {
    setIsIncludingCreated(true);
    setCreatedIncludeError(null);
    try {
      const result = await createEntryItemAction({ entryId, productId });
      if (result.success) {
        toast.success("Produto criado e incluído na entrada com sucesso.");
        onOpenChange(false);
        return;
      }
      setCreatedIncludeError(result.message);
      toast.warning(
        `Produto criado no catálogo, mas não foi incluído na entrada: ${result.message}`,
      );
    } catch {
      setCreatedIncludeError(
        "Não foi possível comunicar com o servidor. Tente novamente.",
      );
      toast.warning(
        "Produto criado no catálogo, mas a inclusão na entrada falhou.",
      );
    }
    setIsIncludingCreated(false);
  };

  const handleProductCreated = async (productId: number) => {
    setCreatedProductId(productId);
    await includeCreatedProduct(productId);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) =>
          nextOpen ? onOpenChange(nextOpen) : closeDialog()
        }
      >
        <DialogContent className="flex max-h-[85vh] flex-col gap-0 sm:max-w-2xl">
          <DialogHeader className="shrink-0 text-left">
            <DialogTitle className="flex items-center gap-2">
              <PackagePlus className="text-primary size-5" aria-hidden="true" />
              Adicionar item à entrada
            </DialogTitle>
            <DialogDescription>
              Pesquise o produto no catálogo e selecione-o para incluí-lo
              imediatamente. Produtos já presentes na entrada não podem ser
              selecionados novamente.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-6">
            <div className="relative">
              <Search
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Pesquisar produto por nome, marca, modelo ou referência"
                aria-label="Pesquisar produto"
                className="pl-9"
                autoFocus
              />
            </div>

            {createdProductId !== null && createdIncludeError !== null && (
              <div
                role="alert"
                className="border-destructive/40 bg-destructive/5 flex flex-col gap-2 rounded-lg border p-3 text-sm"
              >
                <p>
                  O produto foi criado no catálogo, mas não foi incluído nesta
                  entrada.
                </p>
                <p className="text-muted-foreground">{createdIncludeError}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="self-start"
                  disabled={isIncludingCreated}
                  onClick={() => includeCreatedProduct(createdProductId)}
                >
                  {isIncludingCreated ? (
                    <Loader2
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <RotateCcw className="size-4" aria-hidden="true" />
                  )}
                  Tentar incluir novamente
                </Button>
              </div>
            )}

            <div aria-live="polite">
              {status === "loading" && (
                <div
                  className="text-muted-foreground flex items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-sm"
                  aria-busy="true"
                >
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Pesquisando produtos...
                </div>
              )}

              {status === "error" && (
                <div
                  role="alert"
                  className="border-destructive/40 bg-destructive/5 space-y-2 rounded-lg border p-6 text-center"
                >
                  <TriangleAlert
                    className="text-destructive mx-auto size-6"
                    aria-hidden="true"
                  />
                  <p className="font-medium">
                    Não foi possível pesquisar produtos.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void runSearch(searchTerm.trim())}
                  >
                    <RotateCcw className="size-4" aria-hidden="true" />
                    Tentar novamente
                  </Button>
                </div>
              )}

              {status === "success" && products.length === 0 && (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <PackageSearch
                    className="text-muted-foreground mx-auto size-8"
                    aria-hidden="true"
                  />
                  <p className="mt-3 font-medium">Nenhum produto encontrado.</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Ajuste o termo de pesquisa ou cadastre um novo produto.
                  </p>
                </div>
              )}

              {status === "success" && products.length > 0 && (
                <ul className="space-y-2">
                  {products.map((product) => {
                    const isAlreadyIncluded = includedIds.has(
                      product.productId,
                    );
                    const isSelecting =
                      selectingProductId === product.productId;

                    return (
                      <li
                        key={product.productId}
                        className="flex items-start gap-3 rounded-lg border p-3"
                      >
                        <RegistryEntityImage
                          name={product.name}
                          imagePath={product.imagePath ?? undefined}
                          defaultImage={DEFAULT_PRODUCT_IMAGE}
                          entityLabel="do produto"
                          viewMode="list"
                          size="sm"
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="min-w-0 break-words font-medium">
                              {product.name}
                            </p>
                            {product.inactive && (
                              <Badge variant="outline">Inativo</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-xs">
                            {[product.brand, product.model]
                              .filter(Boolean)
                              .join(" / ") || "—"}
                            {product.reference
                              ? ` • Ref.: ${product.reference}`
                              : ""}
                          </p>
                          <div className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5 text-xs tabular-nums">
                            <span>Produto #{product.productId}</span>
                            <span>Estoque loja: {product.storeStock}</span>
                            <span>
                              Atacado:{" "}
                              {formatEntryMoney(product.wholesalePrice)}
                            </span>
                            <span>
                              Varejo: {formatEntryMoney(product.retailPrice)}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 self-center">
                          {isAlreadyIncluded ? (
                            <Badge
                              variant="secondary"
                              title="Este produto já está incluído nesta entrada."
                            >
                              Já incluído
                            </Badge>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleSelect(product)}
                              disabled={isMutating}
                            >
                              {isSelecting ? (
                                <Loader2
                                  className="size-4 animate-spin"
                                  aria-hidden="true"
                                />
                              ) : (
                                <Plus className="size-4" aria-hidden="true" />
                              )}
                              Adicionar
                              <span className="sr-only">
                                {" "}
                                o produto {product.name}
                              </span>
                            </Button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t p-4 sm:justify-start">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateSheetOpen(true)}
              disabled={isMutating}
            >
              <PackagePlus className="size-4" aria-hidden="true" />
              Cadastrar novo produto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EntryItemProductCreateSheet
        open={isCreateSheetOpen}
        onOpenChange={setIsCreateSheetOpen}
        productFormOptions={productFormOptions}
        onCreated={handleProductCreated}
      />
    </>
  );
}
