import { Percent } from "lucide-react";
import type { UIEntryDetail } from "@/services/api-main/entry/transformers/transformers";
import {
  formatEntryMoney,
  formatEntryNumber,
} from "../../../_components/lib/format";
import { EntryDetailField } from "../entry-detail-field";
import { EntrySectionCard } from "../entry-section-card";

interface EntryTaxesTabProps {
  entry: UIEntryDetail;
}

export function EntryTaxesTab({ entry }: EntryTaxesTabProps) {
  return (
    <EntrySectionCard icon={<Percent className="size-4" />} title="Tributos">
      <dl className="grid gap-4 sm:grid-cols-2">
        <EntryDetailField
          label="Alíquota de ICMS"
          value={formatEntryNumber(entry.icmsRate)}
        />
        <EntryDetailField
          label="Alíquota de IPI"
          value={formatEntryNumber(entry.ipiRate)}
        />
        <EntryDetailField
          label="Valor de ICMS"
          value={formatEntryMoney(entry.icmsValue)}
        />
        <EntryDetailField
          label="Valor de IPI"
          value={formatEntryMoney(entry.ipiValue)}
        />
        <EntryDetailField
          label="Valor de PIS"
          value={formatEntryMoney(entry.pisValue)}
        />
        <EntryDetailField
          label="Valor de COFINS"
          value={formatEntryMoney(entry.cofinsValue)}
        />
        <EntryDetailField
          label="Valor de IBS"
          value={formatEntryMoney(entry.ibsValue)}
        />
        <EntryDetailField
          label="Valor de CBS"
          value={formatEntryMoney(entry.cbsValue)}
        />
      </dl>
    </EntrySectionCard>
  );
}
