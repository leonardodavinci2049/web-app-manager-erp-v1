"use client";

import { Copy, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateSettingsNotesAction } from "../../_actions/settings-actions";

interface SettingsNotesTabProps {
  configId: number;
  initialNotes: string | null;
}

export function SettingsNotesTab({
  configId,
  initialNotes,
}: SettingsNotesTabProps) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const result = await updateSettingsNotesAction({ configId, notes });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    } catch {
      toast.error("Não foi possível concluir a comunicação com o servidor.");
    } finally {
      setSaving(false);
    }
  };

  const copyNotes = async () => {
    try {
      await navigator.clipboard.writeText(notes);
      toast.success("Anotações copiadas para a área de transferência.");
    } catch {
      toast.error("Não foi possível copiar as anotações.");
    }
  };

  return (
    <form
      className="space-y-3 rounded-lg border p-3 sm:space-y-4 sm:p-4"
      onSubmit={handleSubmit}
    >
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="settings-notes">Anotações</Label>
          <span className="text-muted-foreground text-xs tabular-nums">
            {notes.length}/2.000
          </span>
        </div>
        <Textarea
          id="settings-notes"
          value={notes}
          maxLength={2000}
          rows={7}
          disabled={saving}
          placeholder="Informações administrativas sobre esta configuração..."
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={saving || notes.length > 2000}>
          {saving ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          {saving ? "Salvando..." : "Salvar anotações"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={notes.length === 0 || saving}
          onClick={() => void copyNotes()}
        >
          <Copy className="size-4" aria-hidden="true" />
          Copiar
        </Button>
      </div>
    </form>
  );
}
