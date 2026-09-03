"use client";

import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { updateSupplierAction } from "@/app/dashboard/suppliers/_actions/supplier-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { UISupplier } from "@/services/api-main/supplier";

interface SupplierEditingTabProps {
  supplier: UISupplier;
}

export function SupplierEditingTab({ supplier }: SupplierEditingTabProps) {
  const router = useRouter();
  const [name, setName] = useState(supplier.name);
  const [notes, setNotes] = useState(supplier.notes ?? "");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<"name" | "notes", string[]>>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFieldErrors({});

    try {
      const result = await updateSupplierAction({
        supplierId: supplier.id,
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
    <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-base">Editar dados do fornecedor</CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="supplier-detail-name">
              Nome
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            </Label>
            <Input
              id="supplier-detail-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setFieldErrors((current) => ({
                  ...current,
                  name: undefined,
                }));
              }}
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
              <Label htmlFor="supplier-detail-notes">Observações</Label>
              <span className="text-muted-foreground text-xs tabular-nums">
                {notes.length}/2.000
              </span>
            </div>
            <Textarea
              id="supplier-detail-notes"
              value={notes}
              onChange={(event) => {
                setNotes(event.target.value);
                setFieldErrors((current) => ({
                  ...current,
                  notes: undefined,
                }));
              }}
              rows={9}
              maxLength={2000}
              disabled={isSaving}
              placeholder="Informações administrativas sobre este fornecedor..."
              aria-invalid={Boolean(fieldErrors.notes?.length)}
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
        </form>
      </CardContent>
    </Card>
  );
}
