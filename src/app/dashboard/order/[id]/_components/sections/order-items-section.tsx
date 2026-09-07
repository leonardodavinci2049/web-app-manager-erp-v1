import { PackageOpen } from "lucide-react";
import { RegistryEntityImage } from "@/app/dashboard/_components/registry";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UIOrdersManagerOrderItem } from "@/services/api-main/order_manager";
import {
  formatOrderCount,
  formatOrderDateTime,
  formatOrderMoney,
  formatWarranty,
} from "../lib/format";

const DEFAULT_PRODUCT_IMAGE = "/images/product/no-image.jpeg";

function OrderItemImage({ item }: { item: UIOrdersManagerOrderItem }) {
  return (
    <RegistryEntityImage
      name={item.name}
      imagePath={item.imagePath}
      defaultImage={DEFAULT_PRODUCT_IMAGE}
      entityLabel="do produto"
      viewMode="list"
      size="sm"
    />
  );
}

function OrderItemCard({ item }: { item: UIOrdersManagerOrderItem }) {
  return (
    <article className="space-y-4 rounded-lg border p-3">
      <div className="flex min-w-0 items-start gap-3">
        <OrderItemImage item={item} />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-xs tabular-nums">
              Item #{item.id}
            </span>
            {item.status?.trim() ? (
              <Badge variant="secondary">{item.status}</Badge>
            ) : null}
          </div>
          <h3 className="break-words text-sm font-semibold">{item.name}</h3>
          <p className="text-muted-foreground text-xs">
            SKU {item.sku} · Produto #{item.productId}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-4 text-sm">
        <div>
          <dt className="text-muted-foreground text-xs">Quantidade</dt>
          <dd className="mt-0.5 font-medium tabular-nums">
            {formatOrderCount(item.quantity)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Estornada</dt>
          <dd className="mt-0.5 font-medium tabular-nums">
            {formatOrderCount(item.returnedQuantity)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Valor unitário</dt>
          <dd className="mt-0.5 font-medium tabular-nums">
            {formatOrderMoney(item.unitPrice)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Total</dt>
          <dd className="mt-0.5 font-semibold tabular-nums">
            {formatOrderMoney(item.total)}
          </dd>
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-3 rounded-md bg-muted/50 p-3">
          <div>
            <dt className="text-muted-foreground text-xs">Subtotal</dt>
            <dd className="mt-0.5 tabular-nums">
              {formatOrderMoney(item.subtotal)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Acréscimo</dt>
            <dd className="mt-0.5 tabular-nums">
              {formatOrderMoney(item.addition)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Seguro</dt>
            <dd className="mt-0.5 tabular-nums">
              {formatOrderMoney(item.insurance)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Frete</dt>
            <dd className="mt-0.5 tabular-nums">
              {formatOrderMoney(item.freight)}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted-foreground text-xs">Desconto</dt>
            <dd className="mt-0.5 tabular-nums">
              {formatOrderMoney(item.discount)}
            </dd>
          </div>
        </div>
        <div className="col-span-2">
          <dt className="text-muted-foreground text-xs">Garantia</dt>
          <dd className="mt-0.5 font-medium">
            {formatWarranty(item.warrantyMonths, item.warrantyDays)}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted-foreground text-xs">Cadastro do item</dt>
          <dd className="mt-0.5 font-medium">
            {formatOrderDateTime(item.createdAt)}
          </dd>
        </div>
      </dl>
    </article>
  );
}

export function OrderItemsSection({
  items,
}: {
  items: UIOrdersManagerOrderItem[];
}) {
  return (
    <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-base">Itens do pedido</CardTitle>
        <p className="text-muted-foreground text-sm">
          {items.length}{" "}
          {items.length === 1 ? "item encontrado" : "itens encontrados"}
        </p>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <PackageOpen
              className="text-muted-foreground mx-auto size-8"
              aria-hidden="true"
            />
            <p className="mt-3 font-medium">Nenhum item retornado.</p>
            <p className="text-muted-foreground mt-1 text-sm">
              O pedido consultado não possui itens disponíveis para exibição.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden min-w-0 max-w-full overflow-x-auto rounded-lg border md:block">
              <Table
                aria-label="Itens do pedido de venda"
                className="min-w-[1050px]"
              >
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="min-w-80">Produto</TableHead>
                    <TableHead className="min-w-32">Quantidades</TableHead>
                    <TableHead className="min-w-40">Valores</TableHead>
                    <TableHead className="min-w-44">Ajustes</TableHead>
                    <TableHead className="min-w-44">
                      Garantia e cadastro
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="[&_tr:nth-child(even)]:bg-muted/30">
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="whitespace-normal">
                        <div className="flex min-w-0 items-center gap-3">
                          <OrderItemImage item={item} />
                          <div className="min-w-0 space-y-1">
                            <p className="break-words font-medium">
                              {item.name}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              Item #{item.id} · SKU {item.sku} · Produto #
                              {item.productId}
                            </p>
                            {item.status?.trim() ? (
                              <Badge variant="secondary">{item.status}</Badge>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs tabular-nums">
                          <p>Quantidade: {formatOrderCount(item.quantity)}</p>
                          <p>
                            Estornada: {formatOrderCount(item.returnedQuantity)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs tabular-nums">
                          <p>Unitário: {formatOrderMoney(item.unitPrice)}</p>
                          <p>Subtotal: {formatOrderMoney(item.subtotal)}</p>
                          <p className="font-semibold">
                            Total: {formatOrderMoney(item.total)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs tabular-nums">
                          <p>Acréscimo: {formatOrderMoney(item.addition)}</p>
                          <p>Seguro: {formatOrderMoney(item.insurance)}</p>
                          <p>Frete: {formatOrderMoney(item.freight)}</p>
                          <p>Desconto: {formatOrderMoney(item.discount)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <div className="space-y-1 text-xs">
                          <p>
                            {formatWarranty(
                              item.warrantyMonths,
                              item.warrantyDays,
                            )}
                          </p>
                          <p className="text-muted-foreground">
                            {formatOrderDateTime(item.createdAt)}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="space-y-3 md:hidden">
              {items.map((item) => (
                <OrderItemCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
