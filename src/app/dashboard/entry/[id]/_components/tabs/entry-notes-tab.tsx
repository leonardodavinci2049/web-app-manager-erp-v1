import { StickyNote } from "lucide-react";
import { EntrySectionCard } from "../entry-section-card";

interface EntryNotesTabProps {
  notes: string;
}

export function EntryNotesTab({ notes }: EntryNotesTabProps) {
  return (
    <EntrySectionCard
      icon={<StickyNote className="size-4" />}
      title="Anotações"
    >
      <p className="whitespace-pre-wrap break-words text-sm">
        {notes.trim() ? notes : "Nenhuma anotação registrada."}
      </p>
    </EntrySectionCard>
  );
}
