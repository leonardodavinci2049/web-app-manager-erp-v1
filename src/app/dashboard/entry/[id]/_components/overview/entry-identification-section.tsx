import { CalendarClock } from "lucide-react";
import type { UIEntryDetail } from "@/services/api-main/entry/transformers/transformers";
import {
  formatEntryDate,
  formatEntryDateTime,
} from "../../../_components/lib/format";
import { EntryDetailField } from "../entry-detail-field";
import { EntrySectionCard } from "../entry-section-card";

interface EntryIdentificationSectionProps {
  entry: Pick<
    UIEntryDetail,
    | "id"
    | "userName"
    | "entryDate"
    | "postingDate"
    | "postingTime"
    | "updatedAt"
  >;
}

export function EntryIdentificationSection({
  entry,
}: EntryIdentificationSectionProps) {
  return (
    <EntrySectionCard
      icon={<CalendarClock className="size-4" />}
      title="Identificação e datas"
    >
      <dl className="grid gap-4 sm:grid-cols-2">
        <EntryDetailField label="ID da entrada" value={entry.id} />
        <EntryDetailField label="Usuário" value={entry.userName} />
        <EntryDetailField
          label="Data de entrada"
          value={formatEntryDate(entry.entryDate)}
        />
        <EntryDetailField
          label="Data de lançamento"
          value={formatEntryDate(entry.postingDate)}
        />
        <EntryDetailField
          label="Hora de lançamento"
          value={entry.postingTime}
        />
        <EntryDetailField
          label="Última atualização"
          value={formatEntryDateTime(entry.updatedAt)}
        />
      </dl>
    </EntrySectionCard>
  );
}
