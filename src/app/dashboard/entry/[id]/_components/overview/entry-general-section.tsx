import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UIEntryDetail } from "@/services/api-main/entry/transformers/transformers";
import {
  formatEntryDateTime,
  formatEntryMoney,
  formatEntryNumber,
} from "../../../_components/lib/format";
import { EntryDetailField } from "../entry-detail-field";
import { EntrySectionCard } from "../entry-section-card";
import { EntryUnimplementedNote } from "../entry-unimplemented-note";

interface EntryGeneralSectionProps {
  entry: Pick<
    UIEntryDetail,
    | "invoiceNumber"
    | "model"
    | "totalInvoice"
    | "totalProducts"
    | "freightValue"
    | "freightRate"
    | "description"
    | "updatedAt"
  >;
}

export function EntryGeneralSection({ entry }: EntryGeneralSectionProps) {
  return (
    <EntrySectionCard
      icon={<Info className="size-4" />}
      title="Geral"
      action={
        <Button type="button" variant="outline" size="sm" disabled>
          Salvar
        </Button>
      }
    >
      <div className="space-y-4">
        <dl className="grid grid-cols-2 gap-4">
          <EntryDetailField
            label="Número da nota"
            value={entry.invoiceNumber}
          />
          <EntryDetailField label="Modelo" value={entry.model} />
          <EntryDetailField
            label="Total da nota"
            value={formatEntryMoney(entry.totalInvoice)}
          />
          <EntryDetailField
            label="Total dos produtos"
            value={formatEntryMoney(entry.totalProducts)}
          />
          <EntryDetailField
            label="Frete"
            value={formatEntryMoney(entry.freightValue)}
          />
          <EntryDetailField
            label="Taxa do frete"
            value={formatEntryNumber(entry.freightRate)}
          />
          <div className="col-span-2 min-w-0">
            <EntryDetailField
              label="Última atualização"
              value={formatEntryDateTime(entry.updatedAt)}
            />
          </div>
          <div className="col-span-2 min-w-0">
            <EntryDetailField label="Descrição" value={entry.description} />
          </div>
        </dl>
        <EntryUnimplementedNote />
      </div>
    </EntrySectionCard>
  );
}
