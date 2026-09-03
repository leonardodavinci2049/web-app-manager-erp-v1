import { Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UIEntryListItem } from "@/services/api-main/entry/transformers/transformers";
import { formatEntryDate, formatEntryMoney } from "../lib/format";
import { EntryImage } from "./entry-image";
import { EntryStatusBadge } from "./entry-status-badge";

interface EntryTableProps {
  entries: UIEntryListItem[];
  buildDetailHref: (entryId: number) => string;
}

/**
 * Tabela de entradas para o modo tabela em telas desktop (Server Component).
 * Colunas: imagem do fornecedor, ID + status de estoque, fornecedor,
 * transportadora, nota + valor total, itens/totais real/dolar, status
 * fisico/etiqueta, data de entrada, modelo e acoes. A acao abre a pagina de
 * detalhes.
 */
export function EntryTable({ entries, buildDetailHref }: EntryTableProps) {
  return (
    <div className="min-w-0 max-w-full overflow-x-auto rounded-lg border">
      <Table aria-label="Lista de entradas">
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-20">Imagem</TableHead>
            <TableHead className="min-w-40">ID</TableHead>
            <TableHead className="min-w-48">Fornecedor</TableHead>
            <TableHead className="min-w-36">Transportadora</TableHead>
            <TableHead className="min-w-36">Nota</TableHead>
            <TableHead className="min-w-36 text-right">
              Itens / Real / Dólar
            </TableHead>
            <TableHead className="min-w-48">Status</TableHead>
            <TableHead className="w-28">Entrada</TableHead>
            <TableHead className="w-28">Modelo</TableHead>
            <TableHead className="w-16 text-right">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="[&_tr:nth-child(even)]:bg-muted/30">
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>
                <EntryImage
                  name={entry.supplier}
                  imagePath={entry.imagePath}
                  viewMode="list"
                  size="sm"
                />
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground tabular-nums">
                    {entry.id}
                  </span>
                  <EntryStatusBadge label="Estoque" value={entry.stockStatus} />
                </div>
              </TableCell>
              <TableCell className="min-w-48 whitespace-normal break-words font-medium">
                <Link
                  href={buildDetailHref(entry.id)}
                  className="hover:text-primary focus-visible:outline-none focus-visible:underline"
                >
                  {entry.supplier}
                </Link>
              </TableCell>
              <TableCell className="whitespace-normal break-words">
                {entry.carrier}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium tabular-nums">
                    {entry.invoiceNumber}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {formatEntryMoney(entry.totalInvoice)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right align-top">
                <div className="flex flex-col gap-0.5 tabular-nums">
                  <span>{entry.movementQuantity} itens</span>
                  <span>{formatEntryMoney(entry.totalReal)}</span>
                  <span>
                    {formatEntryMoney(entry.totalDollar, {
                      currency: "USD",
                    })}
                  </span>
                </div>
              </TableCell>
              <TableCell className="align-top">
                <div className="flex flex-wrap gap-1">
                  <EntryStatusBadge
                    label="Físico"
                    value={entry.physicalStatus}
                  />
                  <EntryStatusBadge
                    label="Etiqueta"
                    value={entry.labelStatus}
                  />
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground whitespace-nowrap tabular-nums">
                {formatEntryDate(entry.entryDate)}
              </TableCell>
              <TableCell>{entry.model}</TableCell>
              <TableCell className="text-right">
                <Button asChild size="icon" variant="ghost">
                  <Link href={buildDetailHref(entry.id)}>
                    <Eye className="size-4" />
                    <span className="sr-only">
                      Ver detalhes da entrada {entry.id}
                    </span>
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
