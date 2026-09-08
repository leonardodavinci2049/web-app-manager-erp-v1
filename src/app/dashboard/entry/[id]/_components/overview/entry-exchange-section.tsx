import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UIEntryDetail } from "@/services/api-main/entry/transformers/transformers";
import { formatEntryNumber } from "../../../_components/lib/format";
import { EntryDetailField } from "../entry-detail-field";
import { EntrySectionCard } from "../entry-section-card";
import { EntryUnimplementedNote } from "../entry-unimplemented-note";

interface EntryExchangeSectionProps {
  entry: Pick<UIEntryDetail, "exchangeRate">;
}

export function EntryExchangeSection({ entry }: EntryExchangeSectionProps) {
  return (
    <EntrySectionCard
      icon={<DollarSign className="size-4" />}
      title="Câmbio dólar"
      action={
        <Button type="button" variant="outline" size="sm" disabled>
          Atualizar
        </Button>
      }
    >
      <div className="space-y-4">
        <dl>
          <EntryDetailField
            label="Câmbio atual"
            value={formatEntryNumber(entry.exchangeRate)}
          />
        </dl>
        <EntryUnimplementedNote />
      </div>
    </EntrySectionCard>
  );
}
