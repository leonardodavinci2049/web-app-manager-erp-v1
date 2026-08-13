"use client";

import { Check, Edit2, X } from "lucide-react";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { updateProductName } from "@/app/actions/action-product-updates";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ProductNameEditorProps {
  productId: number;
  initialName: string;
  onUpdate?: (newName: string) => void;
  metadata?: ReactNode;
}

export function ProductNameEditor({
  productId,
  initialName,
  onUpdate,
  metadata,
}: ProductNameEditorProps) {
  const MAX_CHARACTERS = 200;
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [tempName, setTempName] = useState(name);
  const [isSaving, setIsSaving] = useState(false);

  const remainingCharacters = MAX_CHARACTERS - tempName.length;
  const isOverLimit = tempName.length > MAX_CHARACTERS;

  const handleEdit = () => {
    setTempName(name);
    setIsEditing(true);
  };

  const handleDoubleClick = () => {
    if (!isEditing) {
      handleEdit();
    }
  };

  const handleCancel = () => {
    setTempName(name);
    setIsEditing(false);
  };

  const handleSave = async () => {
    // Validation: check if name is not empty or only whitespace
    if (!tempName.trim()) {
      toast.error("O nome do produto não pode estar vazio");
      return;
    }

    // Validation: check if name exceeds max length
    if (isOverLimit) {
      toast.error(`O nome não pode ter mais de ${MAX_CHARACTERS} caracteres`);
      return;
    }

    // If no changes were made
    if (tempName === name) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);

      // Call Server Action to update product name
      const result = await updateProductName(productId, tempName.trim());

      // Check if update was successful
      if (result.success) {
        setName(tempName.trim());
        setIsEditing(false);
        toast.success("Nome do produto atualizado com sucesso!");

        // Callback to parent component if provided
        if (onUpdate) {
          onUpdate(tempName.trim());
        }
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Save with Ctrl+Enter or Cmd+Enter
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !isSaving) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <div className="space-y-1">
      {isEditing ? (
        <div className="space-y-3">
          <div className="space-y-2">
            <Textarea
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Digite o nome do produto..."
              className="text-lg md:text-2xl font-bold leading-tight resize-none min-h-[3.5rem]"
              disabled={isSaving}
              autoFocus
              maxLength={MAX_CHARACTERS + 50}
              onKeyDown={handleKeyDown}
              rows={2}
            />
            <div className="flex items-center justify-between text-xs">
              <span
                className={`${
                  isOverLimit
                    ? "text-destructive font-medium"
                    : remainingCharacters < 50
                      ? "text-yellow-600 dark:text-yellow-500"
                      : "text-muted-foreground"
                }`}
              >
                {isOverLimit
                  ? `${Math.abs(remainingCharacters)} caracteres acima do limite`
                  : `${remainingCharacters} caracteres restantes`}
              </span>
              <span className="text-muted-foreground">
                {tempName.length} / {MAX_CHARACTERS}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Pressione Ctrl+Enter para salvar ou Esc para cancelar
            </p>
          </div>
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
              Salvar
            </Button>
          </div>
        </div>
      ) : (
        <h1
          className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight leading-snug break-words cursor-pointer hover:text-primary transition-colors"
          onDoubleClick={handleDoubleClick}
          title="Clique duas vezes para editar"
        >
          {name}
        </h1>
      )}

      {metadata || !isEditing ? (
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          {metadata}
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="ml-auto h-7 gap-1 px-2 text-foreground"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span className="sr-only">Editar nome do produto</span>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
