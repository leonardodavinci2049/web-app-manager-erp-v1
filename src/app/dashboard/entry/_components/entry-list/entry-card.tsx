import { Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { UIEntryListItem } from "@/services/api-main/entry/transformers/transformers";
import { formatEntryDate, formatEntryMoney } from "../lib/format";
import { EntryImage } from "./entry-image";
import { EntryStatusBadge } from "./entry-status-badge";

interface EntryCardProps {
  entry: UIEntryListItem;
  viewMode: "grid" | "list";
  detailHref: string;
  eager?: boolean;
}

/**
 * Card de entrada (Server Component). Bloco superior com imagem do fornecedor,
 * ID + status de estoque, fornecedor e transportadora; linha divisoria; numero
 * da nota com valor total, quantidade de itens com totais real/dolar; nova
 * linha divisoria acima dos status fisico/etiqueta; data de entrada e modelo.
 * No modo lista e' horizontal; no modo grid e' vertical. A navegacao para os
 * detalhes ocorre apenas pelo botao "Ver detalhes".
 */
export function EntryCard({
  entry,
  viewMode,
  detailHref,
  eager = false,
}: EntryCardProps) {
  const movementLine = (
    <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs tabular-nums">
      <span>{entry.movementQuantity} itens</span>
      <span aria-hidden="true">•</span>
      <span>{formatEntryMoney(entry.totalReal)}</span>
      <span aria-hidden="true">•</span>
      <span>{formatEntryMoney(entry.totalDollar, { currency: "USD" })}</span>
    </div>
  );

  const statusLine = (
    <div className="flex flex-wrap items-center gap-1">
      <EntryStatusBadge label="Físico" value={entry.physicalStatus} />
      <EntryStatusBadge label="Etiqueta" value={entry.labelStatus} />
    </div>
  );

  const footerLine = (
    <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
      <span>{formatEntryDate(entry.entryDate)}</span>
      <span aria-hidden="true">•</span>
      <span>Modelo {entry.model}</span>
    </div>
  );

  if (viewMode === "list") {
    return (
      <Card className="gap-0 py-0 transition-all duration-200 hover:shadow-md">
        <CardContent className="flex items-start gap-3 p-2 sm:p-2.5">
          <EntryImage
            name={entry.supplier}
            imagePath={entry.imagePath}
            viewMode="list"
            eager={eager}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground text-xs tabular-nums">
                #{entry.id}
              </span>
              <EntryStatusBadge label="Estoque" value={entry.stockStatus} />
            </div>
            <span className="truncate text-sm font-medium">
              {entry.supplier}
            </span>
            <span className="text-muted-foreground truncate text-xs">
              {entry.carrier}
            </span>
            <Separator className="my-0.5" />
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 text-xs">
              <span className="font-medium">Nota {entry.invoiceNumber}</span>
              <span className="font-semibold tabular-nums">
                {formatEntryMoney(entry.totalInvoice)}
              </span>
            </div>
            {movementLine}
            <Separator className="my-0.5" />
            {statusLine}
            {footerLine}
          </div>
          <Button
            asChild
            size="sm"
            variant="ghost"
            className="ml-auto gap-1 self-center"
          >
            <Link href={detailHref}>
              <Eye className="size-4" />
              <span className="sm:hidden">Detalhes</span>
              <span className="hidden sm:inline">Ver detalhes</span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group h-full gap-2 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex h-full flex-col gap-2 p-2 text-center">
        <EntryImage
          name={entry.supplier}
          imagePath={entry.imagePath}
          viewMode="grid"
          eager={eager}
        />
        <div className="flex min-h-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-muted-foreground text-xs tabular-nums">
              #{entry.id}
            </span>
            <EntryStatusBadge label="Estoque" value={entry.stockStatus} />
          </div>
          <span className="line-clamp-2 text-sm font-medium">
            {entry.supplier}
          </span>
          <span className="text-muted-foreground line-clamp-1 text-xs">
            {entry.carrier}
          </span>
          <Separator className="my-0.5" />
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-xs">
            <span className="font-medium">Nota {entry.invoiceNumber}</span>
            <span aria-hidden="true">•</span>
            <span className="font-semibold tabular-nums">
              {formatEntryMoney(entry.totalInvoice)}
            </span>
          </div>
          {movementLine}
          <Separator className="my-0.5" />
          {statusLine}
          {footerLine}
        </div>
        <Button asChild size="sm" className="mt-0.5 w-full gap-1">
          <Link href={detailHref}>
            <Eye className="size-3.5" />
            <span className="sm:hidden">Detalhes</span>
            <span className="hidden sm:inline">Ver detalhes</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
