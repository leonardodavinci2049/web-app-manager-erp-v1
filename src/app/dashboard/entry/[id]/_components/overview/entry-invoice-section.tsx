import { FileText } from "lucide-react";
import type { UIEntryDetail } from "@/services/api-main/entry/transformers/transformers";
import { EntryDetailField } from "../entry-detail-field";
import { EntrySectionCard } from "../entry-section-card";

interface EntryInvoiceSectionProps {
  entry: Pick<UIEntryDetail, "invoiceNumber" | "model" | "description">;
}

export function EntryInvoiceSection({ entry }: EntryInvoiceSectionProps) {
  return (
    <EntrySectionCard
      icon={<FileText className="size-4" />}
      title="Nota e modelo"
    >
      <dl className="grid gap-4 sm:grid-cols-2">
        <EntryDetailField label="Número da nota" value={entry.invoiceNumber} />
        <EntryDetailField label="Modelo" value={entry.model} />
        <div className="sm:col-span-2">
          <EntryDetailField label="Descrição" value={entry.description} />
        </div>
      </dl>
    </EntrySectionCard>
  );
}
