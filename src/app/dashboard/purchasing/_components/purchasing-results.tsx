import { AlertTriangle, Eye, PackageSearch, Truck } from "lucide-react";
import Link from "next/link";
import {
  RegistryEntityImage,
  RegistryLoadMore,
  RegistryPagination,
  type RegistryViewMode,
} from "@/app/dashboard/_components/registry";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UIPurchasingProduct } from "@/services/api-main/purchasing/transformers/transformers";
import { formatCurrency, getMonthName } from "@/utils/common-utils";
import { buildPurchasingDetailsHref } from "./lib/search-params";

const DEFAULT_PRODUCT_IMAGE = "/images/product/no-image.jpeg";

interface PurchasingResultsProps {
  products: UIPurchasingProduct[];
  viewMode: RegistryViewMode;
  total: number;
  page: number;
  pageSize: number;
  returnTo: string;
  hasLoadError: boolean;
  hasActiveQuery: boolean;
}

function parseCategoryNames(raw?: string): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (typeof item === "string") return [item];
      if (!item || typeof item !== "object") return [];
      const record = item as Record<string, unknown>;
      const name = record.TAXONOMIA ?? record.name ?? record.NOME;
      return typeof name === "string" && name.trim() ? [name] : [];
    });
  } catch {
    return [];
  }
}

function formatQuantity(value?: number): string {
  return (value ?? 0).toLocaleString("pt-BR");
}

function formatLastSale(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("pt-BR").format(date);
}

function CriticalityBadge({ value }: { value?: string }) {
  const normalized = value?.trim() || "Não informada";
  const lower = normalized.toLocaleLowerCase("pt-BR");
  const className =
    lower.includes("crít") || lower.includes("critic")
      ? "border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
      : lower.includes("alta")
        ? "border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200"
        : "";

  return (
    <Badge variant="outline" className={className}>
      {normalized}
    </Badge>
  );
}

function CategoryBadges({ raw }: { raw?: string }) {
  const categories = parseCategoryNames(raw);
  if (categories.length === 0)
    return <span className="text-muted-foreground text-xs">—</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {categories.slice(0, 3).map((category) => (
        <Badge key={category} variant="secondary" className="font-normal">
          {category}
        </Badge>
      ))}
      {categories.length > 3 && (
        <Badge variant="outline">+{categories.length - 3}</Badge>
      )}
    </div>
  );
}

function PurchasingImage({
  product,
  viewMode,
  compact = false,
  size = "md",
  eager = false,
}: {
  product: UIPurchasingProduct;
  viewMode: RegistryViewMode;
  compact?: boolean;
  size?: "sm" | "md";
  eager?: boolean;
}) {
  return (
    <RegistryEntityImage
      name={product.name}
      imagePath={product.imagePath}
      defaultImage={DEFAULT_PRODUCT_IMAGE}
      entityLabel="do produto"
      viewMode={viewMode}
      compact={compact}
      size={size}
      eager={eager}
      uploadTrigger={<span className="sr-only">Produto sem imagem</span>}
    />
  );
}

function PurchasingCard({
  product,
  viewMode,
  returnTo,
  eager,
}: {
  product: UIPurchasingProduct;
  viewMode: RegistryViewMode;
  returnTo: string;
  eager: boolean;
}) {
  const href = buildPurchasingDetailsHref(product.id, returnTo);
  const horizontal = viewMode === "list";
  const twoMonthsAgo = getMonthName(-2);
  const previousMonth = getMonthName(-1);
  const currentMonth = getMonthName();

  return (
    <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
      <CardContent
        className={horizontal ? "flex gap-3 p-2" : "flex h-full flex-col p-2"}
      >
        <Link
          href={href}
          className={
            horizontal
              ? "shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              : "rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          }
          aria-label={`Ver detalhes de ${product.name}`}
        >
          <PurchasingImage
            product={product}
            viewMode={viewMode}
            compact
            eager={eager}
          />
        </Link>
        <div
          className={
            horizontal
              ? "min-w-0 flex-1 space-y-2"
              : "mt-2 flex flex-1 flex-col gap-2"
          }
        >
          <div className="space-y-1 border-b pb-2">
            <Link
              href={href}
              className="line-clamp-2 text-sm font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {product.name}
            </Link>
            <div className="flex flex-wrap items-center gap-1.5">
              <CriticalityBadge value={product.criticalityLevel} />
              <span className="text-muted-foreground text-xs">
                SKU {product.sku}
              </span>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            <div className="min-w-0">
              <dt className="text-muted-foreground">Marca</dt>
              <dd className="truncate">{product.brand || "—"}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-muted-foreground">Tipo</dt>
              <dd className="truncate">{product.type || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Estoque</dt>
              <dd className="font-medium tabular-nums">
                {formatQuantity(product.storeStock)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Vendas em 30 dias</dt>
              <dd className="font-medium tabular-nums">
                {formatQuantity(product.salesLast30Days)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Última venda</dt>
              <dd>{formatLastSale(product.lastSaleAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Referência</dt>
              <dd className="truncate">{product.ref || "—"}</dd>
            </div>
          </dl>

          <div className="grid grid-cols-3 gap-1 rounded-md border p-2 text-center text-xs">
            <div>
              <p className="text-muted-foreground truncate">{twoMonthsAgo}</p>
              <p className="font-medium tabular-nums">
                {formatQuantity(product.salesTwoMonthsAgo)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground truncate">{previousMonth}</p>
              <p className="font-medium tabular-nums">
                {formatQuantity(product.salesPreviousMonth)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground truncate">{currentMonth}</p>
              <p className="font-medium tabular-nums">
                {formatQuantity(product.salesCurrentMonth)}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-3 gap-1 text-xs">
            <div>
              <dt className="text-muted-foreground">Atacado</dt>
              <dd className="truncate">
                {formatCurrency(Number(product.wholesalePrice))}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Varejo</dt>
              <dd className="truncate">
                {formatCurrency(Number(product.retailPrice))}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Corporativo</dt>
              <dd className="truncate">
                {formatCurrency(Number(product.corporatePrice))}
              </dd>
            </div>
          </dl>

          <div className="rounded-md bg-muted/50 p-2 text-xs">
            <p className="flex min-w-0 items-center gap-1.5 font-medium">
              <Truck className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {product.supplier || "Fornecedor não informado"}
              </span>
            </p>
          </div>
          <CategoryBadges raw={product.categories} />
          <div className="min-h-0 flex-1" />
          <Button asChild size="sm" variant="outline" className="w-full">
            <Link href={href}>
              <Eye className="size-4" aria-hidden="true" />
              Ver detalhes
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PurchasingTable({
  products,
  returnTo,
}: {
  products: UIPurchasingProduct[];
  returnTo: string;
}) {
  const twoMonthsAgo = getMonthName(-2);
  const previousMonth = getMonthName(-1);
  const currentMonth = getMonthName();

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table aria-label="Produtos com necessidade de compra">
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Criticidade</TableHead>
            <TableHead>Fornecedor</TableHead>
            <TableHead>Marca e tipo</TableHead>
            <TableHead>Vendas</TableHead>
            <TableHead>Últ. venda</TableHead>
            <TableHead>Estoque</TableHead>
            <TableHead>Preços</TableHead>
            <TableHead>Categorias</TableHead>
            <TableHead>
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="[&_tr:nth-child(even)]:bg-muted/30">
          {products.map((product, index) => {
            const href = buildPurchasingDetailsHref(product.id, returnTo);
            return (
              <TableRow key={product.id}>
                <TableCell className="max-w-72 whitespace-normal">
                  <div className="flex items-center gap-3">
                    <Link
                      href={href}
                      className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <PurchasingImage
                        product={product}
                        viewMode="list"
                        size="sm"
                        eager={index === 0}
                      />
                    </Link>
                    <div className="min-w-0">
                      <Link
                        href={href}
                        className="line-clamp-2 font-medium hover:underline"
                      >
                        {product.name}
                      </Link>
                      <span className="text-muted-foreground text-xs">
                        SKU {product.sku}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <CriticalityBadge value={product.criticalityLevel} />
                </TableCell>
                <TableCell className="max-w-44 whitespace-normal">
                  {product.supplier || "—"}
                </TableCell>
                <TableCell className="max-w-32 whitespace-normal text-xs">
                  <p>{product.brand || "—"}</p>
                  <p className="text-muted-foreground">{product.type || "—"}</p>
                </TableCell>
                <TableCell className="whitespace-normal text-xs tabular-nums">
                  <p>
                    {twoMonthsAgo}: {formatQuantity(product.salesTwoMonthsAgo)}
                  </p>
                  <p>
                    {previousMonth}:{" "}
                    {formatQuantity(product.salesPreviousMonth)}
                  </p>
                  <p>
                    {currentMonth}: {formatQuantity(product.salesCurrentMonth)}
                  </p>
                  <p className="font-medium">
                    30 dias: {formatQuantity(product.salesLast30Days)}
                  </p>
                </TableCell>
                <TableCell>{formatLastSale(product.lastSaleAt)}</TableCell>
                <TableCell className="font-medium tabular-nums">
                  {formatQuantity(product.storeStock)}
                </TableCell>
                <TableCell className="whitespace-normal text-xs">
                  <p>
                    Atacado: {formatCurrency(Number(product.wholesalePrice))}
                  </p>
                  <p>Varejo: {formatCurrency(Number(product.retailPrice))}</p>
                  <p>
                    Corporativo:{" "}
                    {formatCurrency(Number(product.corporatePrice))}
                  </p>
                </TableCell>
                <TableCell className="max-w-48 whitespace-normal">
                  <CategoryBadges raw={product.categories} />
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="icon">
                    <Link
                      href={href}
                      aria-label={`Ver detalhes de ${product.name}`}
                    >
                      <Eye className="size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export function PurchasingResults({
  products,
  viewMode,
  total,
  page,
  pageSize,
  returnTo,
  hasLoadError,
  hasActiveQuery,
}: PurchasingResultsProps) {
  if (hasLoadError) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <AlertTriangle
          className="text-destructive mb-4 size-14"
          aria-hidden="true"
        />
        <h2 className="text-lg font-semibold">
          Não foi possível carregar a necessidade de compra
        </h2>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          Os filtros atuais foram preservados. Tente consultar os produtos
          novamente.
        </p>
        <Button asChild variant="outline" className="mt-5">
          <Link href={returnTo}>Tentar novamente</Link>
        </Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <PackageSearch
          className="text-muted-foreground mb-4 size-14"
          aria-hidden="true"
        />
        <h2 className="text-lg font-semibold">
          {hasActiveQuery
            ? "Nenhum produto corresponde à consulta"
            : "Nenhum produto com necessidade de compra encontrado"}
        </h2>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          {hasActiveQuery
            ? "Ajuste os filtros ou limpe a pesquisa para consultar outros produtos."
            : "No momento, a consulta não retornou produtos para reposição."}
        </p>
      </div>
    );
  }

  const pageStart = page * pageSize + 1;
  const pageEnd = Math.min(page * pageSize + products.length, total);

  return (
    <div className="space-y-4">
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] sm:gap-3 lg:gap-4">
          {products.map((product, index) => (
            <PurchasingCard
              key={product.id}
              product={product}
              viewMode="grid"
              returnTo={returnTo}
              eager={index < 10}
            />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-2 lg:hidden">
            {products.map((product, index) => (
              <PurchasingCard
                key={product.id}
                product={product}
                viewMode="list"
                returnTo={returnTo}
                eager={index === 0}
              />
            ))}
          </div>
          <div className="hidden lg:block">
            <PurchasingTable products={products} returnTo={returnTo} />
          </div>
        </>
      )}

      <div className="flex flex-col items-center gap-3 pt-2">
        <p className="text-muted-foreground text-xs tabular-nums">
          Exibindo {pageStart}–{pageEnd} de {total}{" "}
          {total === 1 ? "produto" : "produtos"}
        </p>
        <RegistryPagination
          currentPage={page}
          total={total}
          pageSize={pageSize}
          ariaLabel="Paginação da necessidade de compra"
        />
        <RegistryLoadMore
          displayed={products.length}
          total={total}
          label="Carregar mais produtos"
        />
        {pageEnd >= total && (
          <p className="text-muted-foreground text-xs">Fim dos resultados.</p>
        )}
      </div>
    </div>
  );
}
