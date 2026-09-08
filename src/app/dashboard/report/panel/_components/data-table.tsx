"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/common-utils";
import { displayDate } from "../_lib/period";
import type { ReportOrder } from "../_lib/report";

type DisplayOrder = Omit<ReportOrder, "sellerId" | "customerId">;
function fields(order: DisplayOrder) {
  return [
    ["Data do pedido", displayDate(order.date)],
    ["Pedido", `#${order.id}`],
    ["Cliente", order.customer],
    ["Vendedor", order.seller],
    ["Status do pedido", order.status],
    ["Financeiro", order.financial],
    ["Entrega", order.delivery],
    ["Itens", order.items.toLocaleString("pt-BR")],
    ["Produtos vendidos", order.products.toLocaleString("pt-BR")],
    ["Pagamento", order.payment],
    ["Subtotal", formatCurrency(order.subtotal / 100)],
    ["Total", formatCurrency(order.total / 100)],
  ];
}
const headings = [
  "Data do pedido",
  "Pedido",
  "Cliente / vendedor",
  "Status",
  "Quantidades",
  "Pagamento",
  "Valores",
];

export function DataTable({ orders }: { orders: DisplayOrder[] }) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const pages = Math.max(1, Math.ceil(orders.length / pageSize));
  const visible = orders.slice(page * pageSize, (page + 1) * pageSize);
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Pedidos do período</CardTitle>
        <p className="text-sm text-muted-foreground">
          Data do pedido decrescente, seguida pelo número do pedido.
        </p>
      </CardHeader>
      <CardContent className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p role="status">
            {orders.length === 0
              ? "0 pedidos"
              : `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, orders.length)} de ${orders.length.toLocaleString("pt-BR")} pedidos`}
          </p>
          <label className="flex items-center gap-2">
            Por página
            <select
              className="rounded-md border bg-background p-2 focus-visible:outline-2"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(0);
              }}
            >
              {[20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="space-y-3 xl:hidden">
          {visible.map((order) => (
            <article key={order.id} className="rounded-lg border p-3">
              <h3 className="mb-3 font-semibold">Pedido #{order.id}</h3>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {fields(order).map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="break-words font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
        <div className="hidden xl:block">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                {headings.map((heading) => (
                  <TableHead key={heading} className="whitespace-normal">
                    {heading}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="whitespace-normal">
                    {displayDate(order.date)}
                  </TableCell>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell className="whitespace-normal break-words">
                    <p>{order.customer}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.seller}
                    </p>
                  </TableCell>
                  <TableCell className="whitespace-normal break-words">
                    <p>{order.status}</p>
                    <p className="text-xs">Financeiro: {order.financial}</p>
                    <p className="text-xs">Entrega: {order.delivery}</p>
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <p>{order.items.toLocaleString("pt-BR")} itens</p>
                    <p>{order.products.toLocaleString("pt-BR")} produtos</p>
                  </TableCell>
                  <TableCell className="whitespace-normal break-words">
                    {order.payment}
                  </TableCell>
                  <TableCell className="whitespace-normal break-words">
                    <p className="font-semibold">
                      {formatCurrency(order.total / 100)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Subtotal: {formatCurrency(order.subtotal / 100)}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {orders.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            Nenhum pedido encontrado neste período.
          </p>
        )}
        <nav
          aria-label="Paginação dos pedidos"
          className="flex flex-wrap items-center justify-end gap-3"
        >
          <Button
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm">
            Página {page + 1} de {pages}
          </span>
          <Button
            variant="outline"
            disabled={page + 1 >= pages}
            onClick={() => setPage(page + 1)}
          >
            Próxima
          </Button>
        </nav>
      </CardContent>
    </Card>
  );
}
