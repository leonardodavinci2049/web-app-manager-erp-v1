"use client";

import { Save } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import { updateBrandAction } from "../_actions/brand-detail-actions";

interface BrandDetailFormProps {
  brand: UIBrand;
  onSaved: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

type ValidationErrors = Partial<Record<"name" | "notes", string>>;

function validate(name: string, notes: string): ValidationErrors {
  const errors: ValidationErrors = {};
  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    errors.name = "Informe o nome da marca.";
  } else if (trimmedName.length > 100) {
    errors.name = "O nome deve ter no máximo 100 caracteres.";
  }
  if (notes.length > 2000) {
    errors.notes = "As observações devem ter no máximo 2000 caracteres.";
  }
  return errors;
}

/**
 * Formulario de edicao da marca (Client). Salva nome e observacoes em uma
 * unica submissao. ID, imagem e slug permanecem somente leitura. Impede
 * submissoes duplicadas e atualiza os dados server-side apos a mutation.
 */
export function BrandDetailForm({
  brand,
  onSaved,
  onDirtyChange,
}: BrandDetailFormProps) {
  const [name, setName] = useState(brand.name);
  const [notes, setNotes] = useState(brand.notes ?? "");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const dirty =
      name.trim() !== brand.name || notes.trim() !== (brand.notes ?? "");
    onDirtyChange?.(dirty);
  }, [name, notes, brand.name, brand.notes, onDirtyChange]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedNotes = notes.trim();
    const validationErrors = validate(trimmedName, trimmedNotes);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Revise os campos destacados antes de salvar.");
      return;
    }

    const isDirty =
      trimmedName !== brand.name || trimmedNotes !== (brand.notes ?? "");

    if (!isDirty) {
      toast.info("Não há alterações para salvar.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateBrandAction({
        brandId: brand.id,
        name: trimmedName,
        notes: trimmedNotes,
      });

      if (!result.success) {
        const fieldErrors = result.fieldErrors ?? {};
        setErrors({
          name: fieldErrors.name?.[0],
          notes: fieldErrors.notes?.[0],
        });
        toast.error(result.message ?? "Não foi possível atualizar a marca.");
        return;
      }

      toast.success(result.message ?? "Marca atualizada com sucesso.");
      onSaved();
    } catch {
      toast.error(
        "Não foi possível concluir a comunicação com o servidor. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="brand-detail-name" className="font-semibold">
          Nome
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
          <span className="sr-only"> obrigatório</span>
        </Label>
        <Input
          id="brand-detail-name"
          name="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name)
              setErrors((current) => ({ ...current, name: undefined }));
          }}
          maxLength={100}
          autoComplete="off"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "brand-detail-name-error" : undefined}
        />
        {errors.name && (
          <p id="brand-detail-name-error" className="text-destructive text-sm">
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand-detail-slug">Slug</Label>
        <Input
          id="brand-detail-slug"
          value={brand.slug ?? ""}
          readOnly
          disabled
          className="text-muted-foreground"
          aria-describedby="brand-detail-slug-hint"
        />
        <p
          id="brand-detail-slug-hint"
          className="text-muted-foreground text-xs"
        >
          O slug é gerado automaticamente e não pode ser editado.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand-detail-notes">Observações</Label>
        <Textarea
          id="brand-detail-notes"
          name="notes"
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            if (errors.notes)
              setErrors((current) => ({ ...current, notes: undefined }));
          }}
          rows={4}
          maxLength={2000}
          placeholder="Informações internas sobre a marca..."
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.notes)}
          aria-describedby={
            errors.notes ? "brand-detail-notes-error" : undefined
          }
        />
        {errors.notes ? (
          <p id="brand-detail-notes-error" className="text-destructive text-sm">
            {errors.notes}
          </p>
        ) : (
          <p className="text-muted-foreground text-xs tabular-nums">
            {notes.length}/2000
          </p>
        )}
      </div>

      <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
        <Save className="size-4" aria-hidden="true" />
        {isSubmitting ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  );
}
