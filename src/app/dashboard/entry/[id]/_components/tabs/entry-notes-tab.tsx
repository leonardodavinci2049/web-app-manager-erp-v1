"use client";

import { Check, Loader2, StickyNote, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { UIEntryDetail } from "@/services/api-main/entry/transformers/transformers";
import { updateEntryNotesAction } from "../../_actions/entry-detail-actions";
import {
  ENTRY_CLOSED_EDIT_MESSAGE,
  EntryEditAction,
} from "../entry-edit-action";
import { EntrySectionCard } from "../entry-section-card";

interface EntryNotesTabProps {
  entry: Pick<UIEntryDetail, "id" | "notes" | "isStockClosed">;
}

export function EntryNotesTab({ entry }: EntryNotesTabProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState(entry.notes);
  const [error, setError] = useState<string>();

  const resetForm = () => {
    setNotes(entry.notes);
    setError(undefined);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (entry.isStockClosed) {
      toast.error(ENTRY_CLOSED_EDIT_MESSAGE);
      setIsEditing(false);
      return;
    }

    if (notes.length > 2000) {
      const message = "As anotações devem ter no máximo 2000 caracteres.";
      setError(message);
      toast.error(message);
      return;
    }

    if (notes.trim() === entry.notes.trim()) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(undefined);

    try {
      const result = await updateEntryNotesAction({
        entryId: entry.id,
        notes,
      });

      if (!result.success) {
        setError(result.fieldErrors?.notes?.[0]);
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setIsEditing(false);
      router.refresh();
    } catch {
      toast.error("Não foi possível concluir a comunicação com o servidor.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <EntrySectionCard
      icon={<StickyNote className="size-4" />}
      title="Anotações"
      action={
        !isEditing ? (
          <EntryEditAction
            isStockClosed={entry.isStockClosed}
            label="anotações"
            onEdit={() => {
              resetForm();
              setIsEditing(true);
            }}
          />
        ) : null
      }
    >
      {isEditing ? (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <fieldset disabled={isSaving} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="entry-notes">Anotações</Label>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {notes.length}/2000
                </span>
              </div>
              <Textarea
                id="entry-notes"
                value={notes}
                onChange={(event) => {
                  setNotes(event.target.value);
                  setError(undefined);
                }}
                maxLength={2000}
                rows={7}
                className="resize-y"
                aria-invalid={Boolean(error)}
              />
              {error ? (
                <p className="text-destructive text-xs">{error}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  resetForm();
                  setIsEditing(false);
                }}
              >
                <X className="size-4" aria-hidden="true" />
                Cancelar
              </Button>
              <Button type="submit" size="sm">
                {isSaving ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Check className="size-4" aria-hidden="true" />
                )}
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </fieldset>
        </form>
      ) : (
        <p className="whitespace-pre-wrap break-words text-sm">
          {entry.notes.trim() ? entry.notes : "Nenhuma anotação registrada."}
        </p>
      )}
    </EntrySectionCard>
  );
}
