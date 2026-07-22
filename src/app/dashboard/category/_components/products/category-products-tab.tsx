"use client";

import {
  ChevronLeft,
  ChevronRight,
  Package,
  Plus,
  Search,
  Unlink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  linkProductAction,
  unlinkProductAction,
} from "../../_actions/category-actions";
import { useCategoryQueryNavigation } from "../../_hooks/use-category-query-navigation";
import type { CategoryDetailDto, CategoryProductDto } from "../category-types";
import { MassLinkPreviewDialog } from "../dialogs/mass-link-preview-dialog";

export function CategoryProductsTab({
  detail,
  products,
  total,
  productSearch,
  page,
  pageSize,
}: {
  detail: CategoryDetailDto;
  products: CategoryProductDto[];
  total: number;
  productSearch: string;
  page: number;
  pageSize: number;
}) {
  const router = useRouter();
  const navigate = useCategoryQueryNavigation();
  const [search, setSearch] = useState(productSearch);
  const [productId, setProductId] = useState("");
  const [pending, startTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const firstProduct = total === 0 ? 0 : page * pageSize + 1;
  const lastProduct = Math.min((page + 1) * pageSize, total);

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-semibold">
            {total} produtos vinculados diretamente
          </h3>
          <p className="text-xs text-muted-foreground">
            Exibindo até {pageSize} produtos por página.
          </p>
        </div>
        <MassLinkPreviewDialog detail={detail} />
      </div>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            navigate({
              productSearch: search.trim() || undefined,
              productPage: undefined,
            });
          }}
          className="relative"
        >
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar nos produtos vinculados…"
            className="pl-8"
          />
        </form>
        <Input
          inputMode="numeric"
          value={productId}
          onChange={(event) =>
            setProductId(event.target.value.replace(/\D/g, ""))
          }
          placeholder="ID do produto"
          aria-label="ID do produto para vincular"
        />
        <Button
          disabled={pending || !productId}
          onClick={() =>
            startTransition(async () => {
              const result = await linkProductAction({
                categoryId: detail.id,
                productId: Number(productId),
              });
              result.success
                ? toast.success(result.message)
                : toast.error(result.message);
              if (result.success) {
                setProductId("");
                router.refresh();
              }
            })
          }
        >
          <Plus /> Vincular
        </Button>
      </div>
      {products.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center">
          <Package className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="font-medium">
            {productSearch
              ? "Nenhum produto corresponde à busca"
              : "Esta categoria ainda não tem produtos"}
          </p>
          {productSearch && (
            <Button
              variant="link"
              onClick={() =>
                navigate({
                  productSearch: undefined,
                  productPage: undefined,
                })
              }
            >
              Limpar busca
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border">
          <div className="hidden grid-cols-[1fr_120px_160px_100px_48px] gap-3 bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground md:grid">
            <span>Produto</span>
            <span>SKU</span>
            <span>Referência</span>
            <span>Modelo</span>
            <span />
          </div>
          {products.map((product) => (
            <div
              key={product.id}
              className="grid gap-2 border-t p-3 first:border-t-0 md:grid-cols-[1fr_120px_160px_100px_48px] md:items-center"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground md:hidden">
                  SKU {product.sku} · {product.model || "Sem modelo"}
                </p>
              </div>
              <span className="hidden text-xs font-mono md:block">
                {product.sku}
              </span>
              <span className="hidden text-xs font-mono md:block">
                {product.ref || "—"}
              </span>
              <span className="hidden truncate text-xs md:block">
                {product.model || "—"}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Desvincular ${product.name}`}
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await unlinkProductAction({
                      categoryId: detail.id,
                      productId: product.id,
                    });
                    result.success
                      ? toast.success(result.message)
                      : toast.error(result.message);
                    if (result.success) router.refresh();
                  })
                }
              >
                <Unlink />
              </Button>
            </div>
          ))}
        </div>
      )}
      {total > pageSize && (
        <div className="flex flex-col gap-3 border-t pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground">
            {firstProduct}–{lastProduct} de {total} produtos
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending || page === 0}
              onClick={() =>
                navigate({ productPage: String(Math.max(0, page - 1)) })
              }
            >
              <ChevronLeft /> Anterior
            </Button>
            <span className="min-w-20 text-center text-muted-foreground">
              Página {page + 1} de {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending || page + 1 >= totalPages}
              onClick={() => navigate({ productPage: String(page + 1) })}
            >
              Próxima <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
