import { Banknote } from "lucide-react";
import type { UIEntryDetail } from "@/services/api-main/entry/transformers/transformers";
import {
  formatEntryMoney,
  formatEntryNumber,
} from "../../../_components/lib/format";
import { EntryDetailField } from "../entry-detail-field";
import { EntrySectionCard } from "../entry-section-card";

interface EntryValuesSectionProps {
  entry: Pick<
    UIEntryDetail,
    | "totalInvoice"
    | "totalProducts"
    | "freightValue"
    | "freightRate"
    | "exchangeRate"
  >;
}

export function EntryValuesSection({ entry }: EntryValuesSectionProps) {
  return (
    <EntrySectionCard icon={<Banknote className="size-4" />} title="Valores">
      <dl className="grid gap-4 sm:grid-cols-2">
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
        <EntryDetailField
          label="Câmbio"
          value={formatEntryNumber(entry.exchangeRate)}
        />
      </dl>
    </EntrySectionCard>
  );
}
