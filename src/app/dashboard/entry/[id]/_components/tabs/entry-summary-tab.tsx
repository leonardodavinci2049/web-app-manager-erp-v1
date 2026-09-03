import { Boxes, ClipboardList } from "lucide-react";
import type { UIEntryDetail } from "@/services/api-main/entry/transformers/transformers";
import { EntryStatusBadge } from "../../../_components/entry-list/entry-status-badge";
import {
  formatEntryDate,
  formatEntryMoney,
  formatEntryNumber,
} from "../../../_components/lib/format";
import { EntryDetailField } from "../entry-detail-field";
import { EntrySectionCard } from "../entry-section-card";

interface EntrySummaryTabProps {
  entry: UIEntryDetail;
}

export function EntrySummaryTab({ entry }: EntrySummaryTabProps) {
  return (
    <div className="grid gap-3 sm:gap-4 lg:grid-cols-2 lg:items-start">
      <EntrySectionCard icon={<Boxes className="size-4" />} title="Status">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-wrap gap-1 sm:col-span-2">
            <EntryStatusBadge label="Estoque" value={entry.stockStatus} />
            <EntryStatusBadge label="Físico" value={entry.physicalStatus} />
            <EntryStatusBadge label="Etiqueta" value={entry.labelStatus} />
          </div>
          <EntryDetailField
            label="Data de entrada em estoque"
            value={
              entry.stockEntryDate
                ? formatEntryDate(entry.stockEntryDate)
                : "Não informada"
            }
          />
          <EntryDetailField
            label="Hora de entrada em estoque"
            value={entry.stockEntryTime ?? "Não informada"}
          />
        </dl>
      </EntrySectionCard>

      <EntrySectionCard
        icon={<ClipboardList className="size-4" />}
        title="Resumo"
      >
        <dl className="grid gap-4 sm:grid-cols-2">
          <EntryDetailField
            label="Quantidade de movimento"
            value={entry.summary?.movementQuantity ?? 0}
          />
          <EntryDetailField
            label="Total em real"
            value={
              entry.summary ? formatEntryMoney(entry.summary.totalReal) : "—"
            }
          />
          <EntryDetailField
            label="Total em dólar"
            value={
              entry.summary ? formatEntryNumber(entry.summary.totalDollar) : "—"
            }
          />
        </dl>
      </EntrySectionCard>
    </div>
  );
}
