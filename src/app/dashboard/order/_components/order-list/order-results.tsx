import { AlertTriangle, Eye, ListX } from "lucide-react";
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
import type { UIOrdersManagerOrder } from "@/services/api-main/order_manager";
import { formatCurrency } from "@/utils/common-utils";
import { buildOrderDetailsHref } from "../lib/search-params";

const DEFAULT_SELLER_IMAGE = "/default-images/seller.webp";

interface OrderResultsProps {
  orders: UIOrdersManagerOrder[];
  viewMode: RegistryViewMode;
  total: number;
  page: number;
  pageSize: number;
  returnTo: string;
  hasLoadError: boolean;
  hasActiveQuery: boolean;
}

function formatOrderDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function OrderStatusBadge({ value }: { value: string }) {
  const normalized = value.trim() || "Não informado";
  return <Badge variant="secondary">{normalized}</Badge>;
}

function FinancialStatusBadge({ value }: { value: string }) {
  const normalized = value.trim() || "Não informado";
  const completed = normalized.toLocaleLowerCase("pt-BR").includes("conclu");
  return (
    <Badge
      variant="outline"
      className={
        completed
          ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
          : undefined
      }
    >
      {normalized}
    </Badge>
  );
}

function DeliveryStatusBadge({ value }: { value: string }) {
  const normalized = value.trim() || "Não informado";
  const delivered = normalized.toLocaleLowerCase("pt-BR").includes("entreg");
  return (
    <Badge
      variant="outline"
      className={
        delivered
          ? "border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200"
          : undefined
      }
    >
      {normalized}
    </Badge>
  );
}

function SellerImage({
  order,
  viewMode,
  compact = false,
  eager = false,
}: {
  order: UIOrdersManagerOrder;
  viewMode: RegistryViewMode;
  compact?: boolean;
  eager?: boolean;
}) {
  return (
    <RegistryEntityImage
      name={order.sellerName}
      imagePath={order.sellerImagePath}
      defaultImage={DEFAULT_SELLER_IMAGE}
      entityLabel="do vendedor"
      viewMode={viewMode}
      size={viewMode === "list" ? "sm" : "md"}
      compact={compact}
      eager={eager}
      uploadTrigger={<span className="sr-only">Imagem padrão do vendedor</span>}
    />
  );
}

function OrderCard({
  order,
  viewMode,
  returnTo,
  eager,
}: {
  order: UIOrdersManagerOrder;
  viewMode: RegistryViewMode;
  returnTo: string;
  eager: boolean;
}) {
  const href = buildOrderDetailsHref(order.id, returnTo);
  const horizontal = viewMode === "list";

  return (
    <Link
      href={href}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Ver detalhes do pedido ${order.id}`}
    >
      <Card className="h-full gap-0 py-0 transition-shadow group-hover:shadow-md">
        <CardContent
          className={horizontal ? "flex gap-3 p-3" : "flex h-full flex-col p-3"}
        >
          <div className={horizontal ? "shrink-0" : ""}>
            <SellerImage
              order={order}
              viewMode={viewMode}
              compact
              eager={eager}
            />
          </div>
          <div
            className={
              horizontal
                ? "min-w-0 flex-1 space-y-3"
                : "mt-3 flex min-w-0 flex-1 flex-col gap-3"
            }
          >
            <div className="space-y-1 border-b pb-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold">Pedido #{order.id}</h2>
                <span className="text-muted-foreground text-xs">
                  {formatOrderDate(order.quoteAt)}
                </span>
              </div>
              <p className="truncate text-sm font-medium">
                {order.customerName}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                Vendedor: {order.sellerName}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <OrderStatusBadge value={order.orderStatus} />
              <FinancialStatusBadge value={order.financialStatus} />
              <DeliveryStatusBadge value={order.deliveryStatus} />
            </div>

            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
              <div>
                <dt className="text-muted-foreground">Itens</dt>
                <dd className="font-medium tabular-nums">{order.itemsCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Pagamento</dt>
                <dd className="truncate font-medium">
                  {order.paymentMethod || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-medium tabular-nums">
                  {formatCurrency(Number(order.subtotal))}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Total</dt>
                <dd className="font-semibold tabular-nums">
                  {formatCurrency(Number(order.total))}
                </dd>
              </div>
            </dl>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function OrderTable({
  orders,
  returnTo,
}: {
  orders: UIOrdersManagerOrder[];
  returnTo: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table aria-label="Pedidos de venda">
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Itens</TableHead>
            <TableHead>Subtotal</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead>Orçamento</TableHead>
            <TableHead>
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="[&_tr:nth-child(even)]:bg-muted/30">
          {orders.map((order, index) => {
            const href = buildOrderDetailsHref(order.id, returnTo);
            return (
              <TableRow key={order.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Link
                      href={href}
                      className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <SellerImage
                        order={order}
                        viewMode="list"
                        eager={index === 0}
                      />
                    </Link>
                    <div className="min-w-0">
                      <Link href={href} className="font-medium hover:underline">
                        #{order.id}
                      </Link>
                      <p className="text-muted-foreground max-w-40 truncate text-xs">
                        {order.sellerName}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="max-w-48 whitespace-normal">
                  {order.customerName}
                </TableCell>
                <TableCell className="whitespace-normal">
                  <div className="flex max-w-48 flex-wrap gap-1">
                    <OrderStatusBadge value={order.orderStatus} />
                    <FinancialStatusBadge value={order.financialStatus} />
                    <DeliveryStatusBadge value={order.deliveryStatus} />
                  </div>
                </TableCell>
                <TableCell className="tabular-nums">
                  {order.itemsCount}
                </TableCell>
                <TableCell className="tabular-nums">
                  {formatCurrency(Number(order.subtotal))}
                </TableCell>
                <TableCell className="font-medium tabular-nums">
                  {formatCurrency(Number(order.total))}
                </TableCell>
                <TableCell className="max-w-36 whitespace-normal">
                  {order.paymentMethod || "—"}
                </TableCell>
                <TableCell className="whitespace-normal">
                  {formatOrderDate(order.quoteAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="icon">
                    <Link
                      href={href}
                      aria-label={`Ver detalhes do pedido ${order.id}`}
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

export function OrderResults({
  orders,
  viewMode,
  total,
  page,
  pageSize,
  returnTo,
  hasLoadError,
  hasActiveQuery,
}: OrderResultsProps) {
  if (hasLoadError) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <AlertTriangle
          className="text-destructive mb-4 size-14"
          aria-hidden="true"
        />
        <h2 className="text-lg font-semibold">
          Não foi possível carregar os pedidos
        </h2>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          Os filtros atuais foram preservados. Tente consultar os pedidos
          novamente.
        </p>
        <Button asChild variant="outline" className="mt-5">
          <Link href={returnTo}>Tentar novamente</Link>
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <ListX
          className="text-muted-foreground mb-4 size-14"
          aria-hidden="true"
        />
        <h2 className="text-lg font-semibold">
          {hasActiveQuery
            ? "Nenhum pedido corresponde à consulta"
            : "Nenhum pedido de venda encontrado"}
        </h2>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          {hasActiveQuery
            ? "Ajuste os filtros ou limpe a pesquisa para consultar outros pedidos."
            : "Não há pedidos no período padrão consultado."}
        </p>
      </div>
    );
  }

  const pageStart = page * pageSize + 1;
  const pageEnd = Math.min(page * pageSize + orders.length, total);

  return (
    <div className="space-y-4">
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {orders.map((order, index) => (
            <OrderCard
              key={order.id}
              order={order}
              viewMode="grid"
              returnTo={returnTo}
              eager={index < 8}
            />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-2 lg:hidden">
            {orders.map((order, index) => (
              <OrderCard
                key={order.id}
                order={order}
                viewMode="list"
                returnTo={returnTo}
                eager={index === 0}
              />
            ))}
          </div>
          <div className="hidden lg:block">
            <OrderTable orders={orders} returnTo={returnTo} />
          </div>
        </>
      )}

      <div className="flex flex-col items-center gap-3 pt-2">
        <p className="text-muted-foreground text-xs tabular-nums">
          Exibindo {pageStart}–{pageEnd} de {total}{" "}
          {total === 1 ? "pedido" : "pedidos"}
        </p>
        <RegistryPagination
          currentPage={page}
          total={total}
          pageSize={pageSize}
          ariaLabel="Paginação dos pedidos de venda"
        />
        <RegistryLoadMore
          displayed={page * pageSize + orders.length}
          total={total}
          label="Carregar mais pedidos"
        />
        {pageEnd >= total && (
          <p className="text-muted-foreground text-xs">Fim dos resultados.</p>
        )}
      </div>
    </div>
  );
}
