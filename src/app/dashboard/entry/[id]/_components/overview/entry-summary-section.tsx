import { ClipboardList } from "lucide-react";
import { formatEntryMoney } from "@/app/dashboard/entry/_components/lib/format";
import type { UIEntryDetail } from "@/services/api-main/entry";
import { EntryDetailField } from "../entry-detail-field";
import { EntrySectionCard } from "../entry-section-card";

interface EntrySummarySectionProps {
  entry: Pick<
    UIEntryDetail,
    | "invoiceNumber"
    | "model"
    | "freightValue"
    | "totalInvoice"
    | "totalTaxes"
    | "summary"
  >;
}

export function EntrySummarySection({ entry }: EntrySummarySectionProps) {
  return (
    <EntrySectionCard
      icon={<ClipboardList className="size-4" />}
      title="Resumo da nota"
    >
      <dl className="grid grid-cols-2 gap-4">
        <EntryDetailField label="Número da nota" value={entry.invoiceNumber} />
        <EntryDetailField label="Modelo" value={entry.model} />
        <EntryDetailField
          label="Valor do frete"
          value={formatEntryMoney(entry.freightValue)}
        />
        <EntryDetailField
          label="Total da nota"
          value={formatEntryMoney(entry.totalInvoice)}
        />
        <EntryDetailField
          label="Total de impostos"
          value={formatEntryMoney(entry.totalTaxes)}
        />
        <EntryDetailField
          label="Total dos produtos em real"
          value={
            entry.summary ? formatEntryMoney(entry.summary.totalReal) : "—"
          }
        />
        <EntryDetailField
          label="Total dos produtos em dólar"
          value={
            entry.summary
              ? formatEntryMoney(entry.summary.totalDollar, { currency: "USD" })
              : "—"
          }
        />
      </dl>
    </EntrySectionCard>
  );
}
