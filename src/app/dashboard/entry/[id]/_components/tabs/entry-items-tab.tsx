import { Eye, PackageOpen, Plus, Trash2 } from "lucide-react";
import { RegistryEntityImage } from "@/app/dashboard/_components/registry";
import { Badge } from "@/components/ui/badge";
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
import {
  formatEntryDate,
  formatEntryMoney,
} from "../../../_components/lib/format";

const DEFAULT_PRODUCT_IMAGE = "/images/product/no-image.jpeg";

export interface EntryItemViewModel {
  id: number;
  productId: number;
  productName: string;
  brand: string;
  model: string;
  productReference: string;
  productType: string;
  imagePath: string | null;
  purchasedQuantity: number;
  receivedQuantity: number;
  unitValue: string;
  freightValue: string;
  invoiceValue: string;
  entryDate: string;
}

interface EntryItemsTabProps {
  items: EntryItemViewModel[];
  hasLoadError?: boolean;
}

function EntryItemImage({ item }: { item: EntryItemViewModel }) {
  return (
    <RegistryEntityImage
      name={item.productName}
      imagePath={item.imagePath ?? undefined}
      defaultImage={DEFAULT_PRODUCT_IMAGE}
      entityLabel="do produto"
      viewMode="list"
      size="sm"
    />
  );
}

function EntryItemActions({ item }: { item: EntryItemViewModel }) {
  return (
    <div className="grid grid-cols-2 gap-2 md:flex md:justify-end">
      <Button type="button" size="sm" variant="outline" disabled>
        <Eye className="size-4" aria-hidden="true" />
        Visualizar
        <span className="sr-only"> o item {item.id}</span>
      </Button>
      <Button type="button" size="sm" variant="destructive" disabled>
        <Trash2 className="size-4" aria-hidden="true" />
        Excluir
        <span className="sr-only"> o item {item.id}</span>
      </Button>
    </div>
  );
}

function EntryItemCard({ item }: { item: EntryItemViewModel }) {
  return (
    <article className="space-y-4 rounded-lg border p-3">
      <div className="flex min-w-0 items-start gap-3">
        <EntryItemImage item={item} />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-xs tabular-nums">
              Item #{item.id}
            </span>
            <Badge variant="secondary">{item.productType || "Produto"}</Badge>
          </div>
          <h3 className="break-words text-sm font-semibold">
            {item.productName}
          </h3>
          <p className="text-muted-foreground text-xs">
            Produto #{item.productId}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-4 text-sm">
        <div className="col-span-2">
          <dt className="text-muted-foreground text-xs">Marca / modelo</dt>
          <dd className="mt-0.5 font-medium">
            {[item.brand, item.model].filter(Boolean).join(" / ") || "—"}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted-foreground text-xs">Referência</dt>
          <dd className="mt-0.5 break-words font-medium">
            {item.productReference || "—"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Comprada</dt>
          <dd className="mt-0.5 font-medium tabular-nums">
            {item.purchasedQuantity}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Recebida</dt>
          <dd className="mt-0.5 font-medium tabular-nums">
            {item.receivedQuantity}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Valor unitário</dt>
          <dd className="mt-0.5 font-medium tabular-nums">
            {formatEntryMoney(item.unitValue)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Valor da nota</dt>
          <dd className="mt-0.5 font-medium tabular-nums">
            {formatEntryMoney(item.invoiceValue)}
          </dd>
        </div>
      </dl>

      <EntryItemActions item={item} />
    </article>
  );
}

function EntryItemsEmptyState() {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center">
      <PackageOpen
        className="text-muted-foreground mx-auto size-8"
        aria-hidden="true"
      />
      <p className="mt-3 font-medium">Nenhum item cadastrado nesta entrada.</p>
      <p className="text-muted-foreground mt-1 text-sm">
        Os produtos adicionados serão exibidos aqui.
      </p>
    </div>
  );
}

function EntryItemsErrorState() {
  return (
    <div
      className="border-destructive/40 bg-destructive/5 rounded-lg border p-4"
      role="alert"
    >
      <p className="font-medium">Não foi possível carregar os itens.</p>
      <p className="text-muted-foreground mt-1 text-sm">
        Atualize a página para tentar novamente.
      </p>
    </div>
  );
}

export function EntryItemsTab({
  items,
  hasLoadError = false,
}: EntryItemsTabProps) {
  return (
    <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
      <CardHeader className="px-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">Itens cadastrados</CardTitle>
            <p className="text-muted-foreground text-sm">
              {hasLoadError
                ? "Quantidade indisponível"
                : `${items.length} ${items.length === 1 ? "item" : "itens"}`}
            </p>
          </div>
          <Button type="button" size="sm" disabled>
            <Plus className="size-4" aria-hidden="true" />
            Adicionar Item
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-4 sm:px-6">
        {hasLoadError ? (
          <EntryItemsErrorState />
        ) : items.length === 0 ? (
          <EntryItemsEmptyState />
        ) : (
          <>
            <div className="hidden min-w-0 max-w-full overflow-x-auto rounded-lg border md:block">
              <Table aria-label="Itens da entrada" className="min-w-[1050px]">
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="min-w-80">Produto</TableHead>
                    <TableHead className="min-w-44">Referências</TableHead>
                    <TableHead className="min-w-32">Quantidades</TableHead>
                    <TableHead className="min-w-40">Valores</TableHead>
                    <TableHead className="w-28">Entrada</TableHead>
                    <TableHead className="min-w-56 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="[&_tr:nth-child(even)]:bg-muted/30">
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="whitespace-normal">
                        <div className="flex min-w-0 items-center gap-3">
                          <EntryItemImage item={item} />
                          <div className="min-w-0 space-y-1">
                            <p className="break-words font-medium">
                              {item.productName}
                            </p>
                            <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                              <span className="tabular-nums">
                                Item #{item.id}
                              </span>
                              <span className="tabular-nums">
                                Produto #{item.productId}
                              </span>
                              <Badge variant="secondary">
                                {item.productType || "Produto"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <div className="space-y-1 text-xs">
                          <p>{item.brand || "—"}</p>
                          <p className="text-muted-foreground">
                            {item.model || "—"}
                          </p>
                          <p className="text-muted-foreground break-words">
                            Ref.: {item.productReference || "—"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs tabular-nums">
                          <p>Comprada: {item.purchasedQuantity}</p>
                          <p>Recebida: {item.receivedQuantity}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs tabular-nums">
                          <p>Unitário: {formatEntryMoney(item.unitValue)}</p>
                          <p>Frete: {formatEntryMoney(item.freightValue)}</p>
                          <p>Nota: {formatEntryMoney(item.invoiceValue)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap text-xs tabular-nums">
                        {formatEntryDate(item.entryDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        <EntryItemActions item={item} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-3 md:hidden">
              {items.map((item) => (
                <EntryItemCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
