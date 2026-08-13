"use client";

import { AlertCircle, Loader2, PackageOpen, RefreshCw } from "lucide-react";
import Image from "next/image";
import { type ReactNode, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEFAULT_PRODUCT_IMAGE, getValidImageUrl } from "@/utils/image-utils";
import type {
  CustomerOrderListItem,
  CustomerPurchasedProductListItem,
  CustomerWarrantyListItem,
} from "./customer-purchases-types";

const PRODUCT_IMAGE_FALLBACK = "/default-images/no-product-image.png";

interface PurchaseListProps<T> {
  items: T[];
  error: string | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  retry: () => void;
  loadMore: () => void;
}

function formatCurrency(value: string): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return value || "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

function formatDate(value: string | null): string {
  if (!value) return "Não informada";
  const timestamp = Date.parse(value.replace(" ", "T"));
  if (Number.isNaN(timestamp)) return value;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(
    timestamp,
  );
}

function displayValue(value: string | number | null): string | number {
  return value === null || value === "" ? "—" : value;
}

function LoadingState() {
  return (
    <div className="space-y-3" aria-live="polite" aria-busy="true">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Carregando informações...
      </div>
      <div className="space-y-2">
        {["first", "second", "third", "fourth"].map((key) => (
          <Skeleton key={key} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}

function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <div
      className="border-destructive/40 bg-destructive/5 rounded-lg border p-4"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className="text-destructive mt-0.5 size-5 shrink-0"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className="font-medium">Não foi possível concluir a consulta.</p>
          <p className="text-muted-foreground mt-1 break-words text-sm">
            {message}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={retry}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Tentar novamente
          </Button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center">
      <PackageOpen
        className="text-muted-foreground mx-auto size-8"
        aria-hidden="true"
      />
      <p className="mt-3 font-medium">{message}</p>
      <p className="text-muted-foreground mt-1 text-sm">
        Tente ajustar o termo informado.
      </p>
    </div>
  );
}

function LoadMore({
  hasMore,
  isLoading,
  onClick,
}: {
  hasMore: boolean;
  isLoading: boolean;
  onClick: () => void;
}) {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center pt-2">
      <Button
        type="button"
        variant="outline"
        disabled={isLoading}
        onClick={onClick}
      >
        {isLoading && (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        )}
        {isLoading ? "Carregando..." : "Carregar mais"}
      </Button>
    </div>
  );
}

function DataField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium">{children}</dd>
    </div>
  );
}

function ProductThumbnail({
  description,
  imagePath,
}: {
  description: string;
  imagePath: string;
}) {
  const normalizedImage = getValidImageUrl(imagePath);
  const [hasError, setHasError] = useState(false);
  const source =
    hasError || normalizedImage === DEFAULT_PRODUCT_IMAGE
      ? PRODUCT_IMAGE_FALLBACK
      : normalizedImage;

  return (
    <div className="relative size-14 shrink-0 overflow-hidden rounded-md border bg-muted">
      <Image
        src={source}
        alt={`Imagem do produto ${description}`}
        fill
        sizes="56px"
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export function CustomerOrdersList({
  items,
  error,
  isLoading,
  isLoadingMore,
  hasMore,
  retry,
  loadMore,
}: PurchaseListProps<CustomerOrderListItem>) {
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} retry={retry} />;
  if (items.length === 0)
    return <EmptyState message="Nenhum pedido encontrado." />;

  return (
    <div className="space-y-3">
      <div className="hidden overflow-x-auto rounded-lg border md:block">
        <Table aria-label="Pedidos do cliente" className="min-w-[1200px]">
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Pedido</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Subtotal</TableHead>
              <TableHead>Frete</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead>Status do pedido</TableHead>
              <TableHead>Status financeiro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr:nth-child(even)]:bg-muted/30">
            {items.map((order) => (
              <TableRow key={order.orderId}>
                <TableCell>{formatDate(order.orderDate)}</TableCell>
                <TableCell className="font-medium tabular-nums">
                  {order.orderId}
                </TableCell>
                <TableCell className="tabular-nums">
                  {order.itemCount}
                </TableCell>
                <TableCell>{formatCurrency(order.subtotalValue)}</TableCell>
                <TableCell>{formatCurrency(order.freightValue)}</TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(order.totalOrderValue)}
                </TableCell>
                <TableCell>{displayValue(order.sellerName)}</TableCell>
                <TableCell>{displayValue(order.paymentForm)}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {displayValue(order.orderStatus)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {displayValue(order.financialStatus)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {items.map((order) => (
          <article
            key={order.orderId}
            className="space-y-3 rounded-lg border p-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">Pedido {order.orderId}</p>
                <p className="text-muted-foreground text-xs">
                  {formatDate(order.orderDate)} · {order.itemCount} itens
                </p>
              </div>
              <Badge variant="outline">{displayValue(order.orderStatus)}</Badge>
            </div>
            <dl className="grid grid-cols-2 gap-3">
              <DataField label="Subtotal">
                {formatCurrency(order.subtotalValue)}
              </DataField>
              <DataField label="Frete">
                {formatCurrency(order.freightValue)}
              </DataField>
              <DataField label="Total">
                {formatCurrency(order.totalOrderValue)}
              </DataField>
              <DataField label="Status financeiro">
                {displayValue(order.financialStatus)}
              </DataField>
              <DataField label="Vendedor">
                {displayValue(order.sellerName)}
              </DataField>
              <DataField label="Pagamento">
                {displayValue(order.paymentForm)}
              </DataField>
            </dl>
          </article>
        ))}
      </div>
      <LoadMore
        hasMore={hasMore}
        isLoading={isLoadingMore}
        onClick={loadMore}
      />
    </div>
  );
}

export function CustomerPurchasedProductsList({
  items,
  error,
  isLoading,
  isLoadingMore,
  hasMore,
  retry,
  loadMore,
}: PurchaseListProps<CustomerPurchasedProductListItem>) {
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} retry={retry} />;
  if (items.length === 0)
    return <EmptyState message="Nenhum produto encontrado." />;

  return (
    <div className="space-y-3">
      <div className="hidden overflow-x-auto rounded-lg border md:block">
        <Table
          aria-label="Produtos comprados pelo cliente"
          className="min-w-[1050px]"
        >
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-20">Imagem</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead className="min-w-72">Descrição</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Valor unitário</TableHead>
              <TableHead>Subtotal</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Data do pedido</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr:nth-child(even)]:bg-muted/30">
            {items.map((product) => (
              <TableRow key={`${product.movementId}-${product.productId}`}>
                <TableCell>
                  <ProductThumbnail
                    description={product.description}
                    imagePath={product.imagePath}
                  />
                </TableCell>
                <TableCell className="font-medium tabular-nums">
                  {product.productId}
                </TableCell>
                <TableCell className="max-w-md whitespace-normal break-words">
                  {product.description}
                </TableCell>
                <TableCell className="tabular-nums">
                  {product.quantity}
                </TableCell>
                <TableCell>{formatCurrency(product.unitValue)}</TableCell>
                <TableCell>{formatCurrency(product.subtotalValue)}</TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(product.totalValue)}
                </TableCell>
                <TableCell>{formatDate(product.orderDate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {items.map((product) => (
          <article
            key={`${product.movementId}-${product.productId}`}
            className="space-y-3 rounded-lg border p-3"
          >
            <div className="flex items-start gap-3">
              <ProductThumbnail
                description={product.description}
                imagePath={product.imagePath}
              />
              <div className="min-w-0">
                <p className="line-clamp-3 font-semibold">
                  {product.description}
                </p>
                <p className="text-muted-foreground mt-1 text-xs tabular-nums">
                  Produto {product.productId} · {formatDate(product.orderDate)}
                </p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3">
              <DataField label="Quantidade">{product.quantity}</DataField>
              <DataField label="Valor unitário">
                {formatCurrency(product.unitValue)}
              </DataField>
              <DataField label="Subtotal">
                {formatCurrency(product.subtotalValue)}
              </DataField>
              <DataField label="Total">
                {formatCurrency(product.totalValue)}
              </DataField>
            </dl>
          </article>
        ))}
      </div>
      <LoadMore
        hasMore={hasMore}
        isLoading={isLoadingMore}
        onClick={loadMore}
      />
    </div>
  );
}

export function CustomerWarrantiesList({
  items,
  error,
  isLoading,
  isLoadingMore,
  hasMore,
  retry,
  loadMore,
}: PurchaseListProps<CustomerWarrantyListItem>) {
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} retry={retry} />;
  if (items.length === 0)
    return <EmptyState message="Nenhuma garantia encontrada." />;

  return (
    <div className="space-y-3">
      <div className="hidden overflow-x-auto rounded-lg border md:block">
        <Table aria-label="Garantias do cliente" className="min-w-[1500px]">
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Garantia</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead className="min-w-72">Descrição</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Dias de garantia</TableHead>
              <TableHead>Nº de série</TableHead>
              <TableHead>Código de barras</TableHead>
              <TableHead>Data do pedido</TableHead>
              <TableHead>Pedido</TableHead>
              <TableHead>Movimento</TableHead>
              <TableHead>Status do pedido</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr:nth-child(even)]:bg-muted/30">
            {items.map((warranty) => (
              <TableRow key={warranty.warrantyId}>
                <TableCell className="font-medium tabular-nums">
                  {warranty.warrantyId}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {displayValue(warranty.warrantyStatus)}
                  </Badge>
                </TableCell>
                <TableCell className="tabular-nums">
                  {displayValue(warranty.productId)}
                </TableCell>
                <TableCell className="max-w-md whitespace-normal break-words">
                  {displayValue(warranty.productName)}
                </TableCell>
                <TableCell>{displayValue(warranty.brand)}</TableCell>
                <TableCell className="tabular-nums">
                  {warranty.warrantyDays}
                </TableCell>
                <TableCell>{displayValue(warranty.serialNumber)}</TableCell>
                <TableCell>{displayValue(warranty.barcode)}</TableCell>
                <TableCell>{formatDate(warranty.orderDate)}</TableCell>
                <TableCell className="tabular-nums">
                  {warranty.orderId}
                </TableCell>
                <TableCell className="tabular-nums">
                  {warranty.movementId}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {displayValue(warranty.orderStatus)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {items.map((warranty) => (
          <article
            key={warranty.warrantyId}
            className="space-y-3 rounded-lg border p-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">Garantia {warranty.warrantyId}</p>
                <p className="text-muted-foreground text-xs">
                  Produto {displayValue(warranty.productId)} · Pedido{" "}
                  {warranty.orderId}
                </p>
              </div>
              <Badge variant="secondary">
                {displayValue(warranty.warrantyStatus)}
              </Badge>
            </div>
            <p className="text-sm font-medium">
              {displayValue(warranty.productName)}
            </p>
            <dl className="grid grid-cols-2 gap-3">
              <DataField label="Marca">
                {displayValue(warranty.brand)}
              </DataField>
              <DataField label="Garantia">
                {warranty.warrantyDays} dias
              </DataField>
              <DataField label="Nº de série">
                {displayValue(warranty.serialNumber)}
              </DataField>
              <DataField label="Código de barras">
                {displayValue(warranty.barcode)}
              </DataField>
              <DataField label="Data do pedido">
                {formatDate(warranty.orderDate)}
              </DataField>
              <DataField label="Movimento">{warranty.movementId}</DataField>
              <DataField label="Status do pedido">
                {displayValue(warranty.orderStatus)}
              </DataField>
            </dl>
          </article>
        ))}
      </div>
      <LoadMore
        hasMore={hasMore}
        isLoading={isLoadingMore}
        onClick={loadMore}
      />
    </div>
  );
}
