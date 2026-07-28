"use client";

import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { createBrandAction } from "@/app/dashboard/brand/_actions/brand-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SheetFooter } from "@/components/ui/sheet";

interface BrandCreateFormProps {
  onCancel: () => void;
  onCreated: (brandId: number) => void;
  onDirtyChange: (isDirty: boolean) => void;
}

function validateName(name: string): string | undefined {
  const trimmed = name.trim();
  if (trimmed.length === 0) return "Informe o nome da marca.";
  if (trimmed.length > 100) return "O nome deve ter no máximo 100 caracteres.";
  return undefined;
}

/**
 * Formulario de criacao de marca (Client). Valida no cliente para feedback
 * imediato e novamente na Server Action. Possui somente o campo nome.
 */
export function BrandCreateForm({
  onCancel,
  onCreated,
  onDirtyChange,
}: BrandCreateFormProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const validationError = validateName(trimmedName);
    setError(validationError);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createBrandAction({ name: trimmedName });

      if (!result.success || !result.brandId) {
        const fieldError = result.fieldErrors?.name?.[0];
        if (fieldError) setError(fieldError);
        toast.error(
          result.message ?? "Não foi possível criar a marca. Tente novamente.",
        );
        return;
      }

      onDirtyChange(false);
      toast.success(result.message ?? "Marca criada com sucesso!");
      onCreated(result.brandId);
    } catch {
      toast.error(
        "Não foi possível concluir a comunicação com o servidor. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-h-0 flex-1 flex-col"
      onChangeCapture={() => onDirtyChange(true)}
    >
      <fieldset
        disabled={isSubmitting}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6"
      >
        <div className="space-y-2">
          <Label htmlFor="brand-name" className="font-semibold">
            Nome da marca
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
            <span className="sr-only"> obrigatório</span>
          </Label>
          <Input
            id="brand-name"
            name="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(undefined);
            }}
            placeholder="Ex.: Acme Tools"
            maxLength={100}
            autoFocus
            autoComplete="off"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "brand-name-error" : undefined}
          />
          {error && (
            <p id="brand-name-error" className="text-destructive text-sm">
              {error}
            </p>
          )}
          <p className="text-muted-foreground text-xs">
            O identificador e o slug serão gerados automaticamente.
          </p>
        </div>
      </fieldset>

      <SheetFooter className="supports-[backdrop-filter]:bg-background/80 shrink-0 border-t bg-background/95 p-4 backdrop-blur sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-full sm:w-auto"
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="w-full sm:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Criando marca..." : "Criar marca"}
        </Button>
      </SheetFooter>
    </form>
  );
}
