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
import { EntryStatusBadge } from "./entry-status-badge";

interface EntryTableProps {
  entries: UIEntryListItem[];
  buildDetailHref: (entryId: number) => string;
}

/**
 * Tabela de entradas para o modo tabela em telas desktop (Server Component).
 * Colunas: ID, data de entrada, fornecedor, transportadora, nota, modelo,
 * valores, status e acoes. A acao abre a pagina de detalhes.
 */
export function EntryTable({ entries, buildDetailHref }: EntryTableProps) {
  return (
    <div className="min-w-0 max-w-full overflow-x-auto rounded-lg border">
      <Table aria-label="Lista de entradas">
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-20">ID</TableHead>
            <TableHead className="w-28">Entrada</TableHead>
            <TableHead className="min-w-48">Fornecedor</TableHead>
            <TableHead className="min-w-36">Transportadora</TableHead>
            <TableHead className="w-24">Nota</TableHead>
            <TableHead className="w-28">Modelo</TableHead>
            <TableHead className="w-32 text-right">Total nota</TableHead>
            <TableHead className="w-32 text-right">Total produtos</TableHead>
            <TableHead className="w-64">Status</TableHead>
            <TableHead className="w-16 text-right">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="[&_tr:nth-child(even)]:bg-muted/30">
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="text-muted-foreground tabular-nums">
                {entry.id}
              </TableCell>
              <TableCell className="text-muted-foreground whitespace-nowrap tabular-nums">
                {formatEntryDate(entry.entryDate)}
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
              <TableCell className="tabular-nums">
                {entry.invoiceNumber}
              </TableCell>
              <TableCell>{entry.model}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatEntryMoney(entry.totalInvoice)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatEntryMoney(entry.totalProducts)}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  <EntryStatusBadge label="Estoque" value={entry.stockStatus} />
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
