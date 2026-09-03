"use client";

import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { UIPtype } from "@/services/api-main/ptype";
import { updatePtypeAction } from "../../_actions/ptype-detail-actions";

interface PtypeDetailFormSectionProps {
  item: UIPtype;
}

export function PtypeDetailFormSection({ item }: PtypeDetailFormSectionProps) {
  const router = useRouter();
  const [name, setName] = useState(item.name);
  const [notes, setNotes] = useState(item.notes ?? "");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFieldErrors({});
    try {
      const result = await updatePtypeAction({
        ptypeId: item.id,
        name,
        notes,
      });
      if (!result.success) {
        setFieldErrors(result.fieldErrors ?? {});
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    } catch {
      toast.error("Não foi possível concluir a comunicação com o servidor.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Dados do cadastro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ptype-detail-name">Nome</Label>
            <Input
              id="ptype-detail-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              disabled={isSaving}
              aria-invalid={Boolean(fieldErrors.name?.length)}
            />
            {fieldErrors.name?.[0] && (
              <p className="text-destructive text-sm">{fieldErrors.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="ptype-detail-notes">Observações</Label>
              <span className="text-muted-foreground text-xs tabular-nums">
                {notes.length}/2.000
              </span>
            </div>
            <Textarea
              id="ptype-detail-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={2000}
              rows={8}
              disabled={isSaving}
              aria-invalid={Boolean(fieldErrors.notes?.length)}
              placeholder="Informações administrativas sobre este tipo..."
            />
            {fieldErrors.notes?.[0] && (
              <p className="text-destructive text-sm">{fieldErrors.notes[0]}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSaving || name.trim() === "" || notes.length > 2000}
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {isSaving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
