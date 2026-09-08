import { Eye } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
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

interface EntryModelBadgeProps {
  model: string;
  compact?: boolean;
}

/**
 * Displays the entry model over the image with a neutral translucent surface.
 * Imported and national models retain a subtle color distinction.
 */
function EntryModelBadge({ model, compact = false }: EntryModelBadgeProps) {
  const normalized = model.trim().toUpperCase();
  const isImported = normalized === "IMPORTADO";
  const isNational = normalized === "NACIONAL";

  return (
    <Badge
      variant="outline"
      title={`Modelo da nota: ${model}`}
      className={cn(
        compact
          ? "absolute top-0.5 left-0.5 z-10 px-1 py-0 text-[8px]"
          : "absolute top-2 left-2 z-10 px-1.5 py-0 text-[9px] sm:text-[11px]",
        "border-background/70 bg-background/90 font-normal text-muted-foreground shadow-sm backdrop-blur-sm",
        isImported &&
          "border-sky-500/35 text-sky-800 dark:border-sky-400/35 dark:text-sky-200",
        isNational &&
          "border-emerald-500/35 text-emerald-800 dark:border-emerald-400/35 dark:text-emerald-200",
      )}
    >
      {model}
    </Badge>
  );
}

/**
 * Entry card rendered horizontally in list mode and vertically in grid mode.
 * Detail navigation remains available only through the details button.
 */
export function EntryCard({
  entry,
  viewMode,
  detailHref,
  eager = false,
}: EntryCardProps) {
  const movementTable = (
    <div className="text-muted-foreground border-border/60 overflow-hidden rounded-md border text-[10px] tabular-nums sm:text-[11px]">
      <div className="bg-muted/35 divide-border/60 grid grid-cols-3 divide-x">
        <span className="px-1 py-0.5 text-center font-medium">Qt Items</span>
        <span className="px-1 py-0.5 text-center font-medium">Total (R$)</span>
        <span className="px-1 py-0.5 text-center font-medium">Total ($)</span>
      </div>
      <div className="divide-border/60 border-border/60 grid grid-cols-3 divide-x border-t">
        <span className="px-1 py-1 text-center">
          {entry.movementQuantity} itens
        </span>
        <span className="text-foreground px-1 py-1 text-center font-semibold">
          {formatEntryMoney(entry.totalReal)}
        </span>
        <span className="px-1 py-1 text-center">
          {formatEntryMoney(entry.totalDollar, { currency: "USD" })}
        </span>
      </div>
    </div>
  );

  const statusLine = (
    <div className="flex flex-wrap items-center gap-1">
      <EntryStatusBadge label="Físico" value={entry.physicalStatus} />
      <EntryStatusBadge label="Etiqueta" value={entry.labelStatus} />
    </div>
  );

  const invoiceLine = (
    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 text-xs">
      <span className="font-medium tabular-nums">
        <span className="text-muted-foreground font-normal">Nota Nº:</span>{" "}
        {entry.invoiceNumber}
      </span>
      <span className="font-semibold tabular-nums">
        <span className="text-muted-foreground font-normal">Vl:</span>{" "}
        {formatEntryMoney(entry.totalInvoice)}
      </span>
    </div>
  );

  const footerLine = (
    <div className="text-muted-foreground text-xs">
      <span className="font-medium">Criada em</span>{" "}
      <span className="tabular-nums">{formatEntryDate(entry.entryDate)}</span>
    </div>
  );

  if (viewMode === "list") {
    return (
      <Card className="border-border/60 gap-0 py-0 transition-all duration-200 hover:shadow-md">
        <CardContent className="flex items-start gap-3 p-2 sm:p-2.5">
          <div className="relative shrink-0">
            <EntryImage
              name={entry.supplier}
              imagePath={entry.imagePath}
              viewMode="list"
              eager={eager}
            />
            <EntryModelBadge model={entry.model} compact />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground text-xs tabular-nums">
                #{entry.id}
              </span>
              <EntryStatusBadge value={entry.stockStatus} />
            </div>
            <span className="truncate text-left text-sm font-medium">
              {entry.supplier}
            </span>
            <span className="text-muted-foreground truncate text-left text-xs">
              {entry.carrier}
            </span>
            <Separator className="bg-border/60 my-0.5" />
            {invoiceLine}
            {movementTable}
            <Separator className="bg-border/60 my-0.5" />
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
    <Card className="group border-border/60 h-full gap-2 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex h-full flex-col gap-2 p-2">
        <div className="relative">
          <EntryImage
            name={entry.supplier}
            imagePath={entry.imagePath}
            viewMode="grid"
            eager={eager}
          />
          <EntryModelBadge model={entry.model} />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-1 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-xs tabular-nums">
              #{entry.id}
            </span>
            <EntryStatusBadge value={entry.stockStatus} />
          </div>
          <span className="line-clamp-2 text-left text-sm font-medium">
            {entry.supplier}
          </span>
          <span className="text-muted-foreground line-clamp-1 text-left text-xs">
            {entry.carrier}
          </span>
          <Separator className="bg-border/60 my-0.5" />
          {invoiceLine}
          {movementTable}
          <Separator className="bg-border/60 my-0.5" />
          {statusLine}
          {footerLine}
        </div>
        <Button
          asChild
          size="sm"
          variant="secondary"
          className="mt-0.5 w-full gap-1"
        >
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
