import { Percent } from "lucide-react";
import type { UIEntryDetail } from "@/services/api-main/entry/transformers/transformers";
import {
  formatEntryMoney,
  formatEntryNumber,
} from "../../../_components/lib/format";
import { EntryTabCard, EntryTabField } from "./entry-tab-card";

interface EntryTaxesTabProps {
  entry: UIEntryDetail;
}

export function EntryTaxesTab({ entry }: EntryTaxesTabProps) {
  return (
    <EntryTabCard icon={<Percent className="size-4" />} title="Tributos">
      <dl className="grid gap-4 sm:grid-cols-2">
        <EntryTabField
          label="Alíquota de ICMS"
          value={formatEntryNumber(entry.icmsRate)}
        />
        <EntryTabField
          label="Alíquota de IPI"
          value={formatEntryNumber(entry.ipiRate)}
        />
        <EntryTabField
          label="Valor de ICMS"
          value={formatEntryMoney(entry.icmsValue)}
        />
        <EntryTabField
          label="Valor de IPI"
          value={formatEntryMoney(entry.ipiValue)}
        />
        <EntryTabField
          label="Valor de PIS"
          value={formatEntryMoney(entry.pisValue)}
        />
        <EntryTabField
          label="Valor de COFINS"
          value={formatEntryMoney(entry.cofinsValue)}
        />
        <EntryTabField
          label="Valor de IBS"
          value={formatEntryMoney(entry.ibsValue)}
        />
        <EntryTabField
          label="Valor de CBS"
          value={formatEntryMoney(entry.cbsValue)}
        />
      </dl>
    </EntryTabCard>
  );
}
