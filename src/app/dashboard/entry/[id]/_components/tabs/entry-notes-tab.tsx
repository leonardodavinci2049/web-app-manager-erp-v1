import { StickyNote } from "lucide-react";
import { EntryTabCard } from "./entry-tab-card";

interface EntryNotesTabProps {
  notes: string;
}

export function EntryNotesTab({ notes }: EntryNotesTabProps) {
  return (
    <EntryTabCard icon={<StickyNote className="size-4" />} title="Anotações">
      <p className="whitespace-pre-wrap break-words text-sm">
        {notes.trim() ? notes : "Nenhuma anotação registrada."}
      </p>
    </EntryTabCard>
  );
}
