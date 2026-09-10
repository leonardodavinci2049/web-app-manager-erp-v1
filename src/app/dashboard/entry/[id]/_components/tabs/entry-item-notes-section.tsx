"use client";

import { Check, Loader2, StickyNote, X } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { EntryItemDetailDto } from "../../_actions/entry-item-actions";
import { updateEntryItemNotesAction } from "../../_actions/entry-item-update-actions";
import { EntryDetailField } from "../entry-detail-field";
import { ENTRY_CLOSED_EDIT_MESSAGE } from "../entry-edit-action";
import { EntrySectionCard } from "../entry-section-card";
import { EntryItemSectionEditAction } from "./entry-item-section-edit-action";

const NOTES_MAX_LENGTH = 2000;

interface EntryItemNotesSectionProps {
  entryId: number;
  isStockClosed: boolean;
  detail: EntryItemDetailDto;
  onSaved: () => void;
  onEntryClosed: () => void;
}

export function EntryItemNotesSection({
  entryId,
  isStockClosed,
  detail,
  onSaved,
  onEntryClosed,
}: EntryItemNotesSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState(detail.notes);
  const [error, setError] = useState<string>();

  const resetForm = () => {
    setNotes(detail.notes);
    setError(undefined);
  };

  const handleEdit = () => {
    resetForm();
    setIsEditing(true);
  };

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSaving) return;

    if (isStockClosed) {
      toast.error(ENTRY_CLOSED_EDIT_MESSAGE);
      setIsEditing(false);
      return;
    }

    if (notes.length > NOTES_MAX_LENGTH) {
      const message = `As anotações devem ter no máximo ${NOTES_MAX_LENGTH} caracteres.`;
      setError(message);
      toast.error(message);
      return;
    }

    if (notes.trim() === detail.notes.trim()) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(undefined);

    try {
      const result = await updateEntryItemNotesAction({
        entryId,
        itemId: detail.itemId,
        notes,
      });

      if (!result.success) {
        if (result.entryClosed) {
          setIsEditing(false);
          onEntryClosed();
        }
        setError(result.fieldErrors?.notes?.[0]);
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setIsEditing(false);
      onSaved();
    } catch {
      toast.error("Não foi possível concluir a comunicação com o servidor.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <EntrySectionCard
      icon={<StickyNote className="text-primary size-4" aria-hidden="true" />}
      title="Anotações"
      action={
        !isEditing ? (
          <EntryItemSectionEditAction
            isStockClosed={isStockClosed}
            label="anotações do item"
            onEdit={handleEdit}
          />
        ) : null
      }
    >
      {isEditing ? (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <fieldset disabled={isSaving} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="entry-item-notes">Anotações</Label>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {notes.length}/{NOTES_MAX_LENGTH}
                </span>
              </div>
              <Textarea
                id="entry-item-notes"
                value={notes}
                onChange={(event) => {
                  setNotes(event.target.value);
                  setError(undefined);
                }}
                maxLength={NOTES_MAX_LENGTH}
                rows={5}
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
                onClick={handleCancel}
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
        <dl>
          <EntryDetailField label="Anotações" value={detail.notes} />
        </dl>
      )}
    </EntrySectionCard>
  );
}
