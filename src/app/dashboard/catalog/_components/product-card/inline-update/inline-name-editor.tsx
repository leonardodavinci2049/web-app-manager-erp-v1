"use client";

import { Check, Edit2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { updateProductName } from "@/app/actions/action-product-updates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InlineNameEditorProps {
  productId: number;
  productName: string;
  productDetailsHref?: string;
  className?: string;
}

export function InlineNameEditor({
  productId,
  productName,
  productDetailsHref,
  className = "",
}: InlineNameEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tempName, setTempName] = useState(productName);
  const [displayName, setDisplayName] = useState(productName);

  const MIN_LENGTH = 3;
  const MAX_LENGTH = 255;

  const handleEdit = () => {
    setTempName(displayName);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempName(displayName);
    setIsEditing(false);
  };

  const validateName = (): { valid: boolean; error?: string } => {
    const trimmedName = tempName.trim();

    if (!trimmedName) {
      return { valid: false, error: "Nome do produto não pode ser vazio" };
    }

    if (trimmedName.length < MIN_LENGTH) {
      return {
        valid: false,
        error: `Nome deve ter pelo menos ${MIN_LENGTH} caracteres`,
      };
    }

    if (trimmedName.length > MAX_LENGTH) {
      return {
        valid: false,
        error: `Nome não pode ter mais de ${MAX_LENGTH} caracteres`,
      };
    }

    return { valid: true };
  };

  const handleSave = async () => {
    const validation = validateName();
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    const trimmedName = tempName.trim();

    if (trimmedName === displayName) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);

      const result = await updateProductName(productId, trimmedName);

      if (result.success) {
        toast.success("Nome do produto atualizado com sucesso!");
        setIsEditing(false);
        setDisplayName(trimmedName);
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao atualizar nome do produto");
      }
    } catch (error) {
      console.error("Error updating product name:", error);
      toast.error("Erro ao atualizar nome do produto");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSaving) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const remainingChars = MAX_LENGTH - tempName.length;
  const isOverLimit = tempName.length > MAX_LENGTH;

  if (isEditing) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm font-medium">
              Editando Nome
            </span>
          </div>
          <Input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSaving}
            className="text-sm font-semibold"
            placeholder="Nome do produto"
            autoFocus
            maxLength={MAX_LENGTH + 10}
          />
          <div className="flex items-center justify-between text-xs">
            <span
              className={`${
                isOverLimit
                  ? "font-medium text-destructive"
                  : remainingChars < 50
                    ? "text-yellow-600 dark:text-yellow-500"
                    : "text-muted-foreground"
              }`}
            >
              {isOverLimit
                ? `${Math.abs(remainingChars)} caracteres a mais`
                : `${remainingChars} caracteres restantes`}
            </span>
            <span className="text-muted-foreground">
              {tempName.length} / {MAX_LENGTH}
            </span>
          </div>
        </div>

        <p className="text-muted-foreground text-xs">
          ℹ️ Pressione{" "}
          <kbd className="rounded bg-muted px-1 py-0.5 text-xs">Enter</kbd> para
          salvar ou{" "}
          <kbd className="rounded bg-muted px-1 py-0.5 text-xs">Esc</kbd> para
          cancelar
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isSaving}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || isOverLimit || !tempName.trim()}
            className="gap-2"
          >
            <Check className="h-4 w-4" />
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`text-left w-full ${className}`}>
      <div className="group/name-editor">
        <div className="flex items-start gap-1.5">
          <div className="flex-1 min-w-0">
            <Link
              href={productDetailsHref ?? `/dashboard/product/${productId}`}
            >
              <h3 className="text-wrap break-words text-sm font-semibold leading-tight transition-colors hover:text-primary hover:underline sm:text-base">
                {displayName}
              </h3>
            </Link>
          </div>
          <button
            type="button"
            onClick={handleEdit}
            className="flex size-6 shrink-0 items-center justify-center transition-opacity md:size-auto md:opacity-0 md:group-hover/name-editor:opacity-100 md:focus-visible:opacity-100"
            title="Editar nome do produto"
            aria-label="Editar nome do produto"
          >
            <Edit2 className="h-3 w-3 shrink-0 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
