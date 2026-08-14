"use client";

import { AlertCircle, Loader2, PackageOpen, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
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
import type { SellerOrderListItem } from "./seller-sales-types";

export interface SellerSalesListState {
  items: SellerOrderListItem[];
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

export function SellerOrdersList({
  items,
  error,
  isLoading,
  isLoadingMore,
  hasMore,
  retry,
  loadMore,
}: SellerSalesListState) {
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} retry={retry} />;
  if (items.length === 0)
    return <EmptyState message="Nenhum pedido encontrado." />;

  return (
    <div className="space-y-3">
      <div className="hidden overflow-x-auto rounded-lg border md:block">
        <Table aria-label="Pedidos do vendedor" className="min-w-[1200px]">
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Pedido</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Subtotal</TableHead>
              <TableHead>Frete</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Cliente</TableHead>
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
                <TableCell>{displayValue(order.customerName)}</TableCell>
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
              <DataField label="Cliente">
                {displayValue(order.customerName)}
              </DataField>
              <DataField label="Pagamento">
                {displayValue(order.paymentForm)}
              </DataField>
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
