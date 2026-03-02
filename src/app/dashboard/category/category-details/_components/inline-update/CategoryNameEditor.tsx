"use client";

import { Check, Edit2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateCategoryName } from "../../actions/action-category-updates";

interface CategoryNameEditorProps {
  categoryId: number;
  initialName: string;
  onUpdate?: (newName: string) => void;
}

export function CategoryNameEditor({
  categoryId,
  initialName,
  onUpdate,
}: CategoryNameEditorProps) {
  const MAX_CHARACTERS = 100;
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

  const handleCancel = () => {
    setTempName(name);
    setIsEditing(false);
  };

  const handleSave = async () => {
    // Validation: check if name is not empty or only whitespace
    if (!tempName.trim()) {
      toast.error("Nome da categoria é obrigatório");
      return;
    }

    // Validation: check if name exceeds max length
    if (isOverLimit) {
      toast.error(`Nome não pode ter mais de ${MAX_CHARACTERS} caracteres`);
      return;
    }

    // If no changes were made
    if (tempName === name) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);

      // Call Server Action to update category name
      const result = await updateCategoryName(categoryId, tempName.trim());

      // Check if update was successful
      if (result.success) {
        setName(tempName.trim());
        setIsEditing(false);
        toast.success(result.message || "Nome atualizado com sucesso");

        // Callback to parent component if provided
        if (onUpdate) {
          onUpdate(tempName.trim());
        }
      } else {
        toast.error(result.error || "Erro ao atualizar nome da categoria");
      }
    } catch (error) {
      console.error("Error updating category name:", error);
      toast.error("Falha ao atualizar nome da categoria");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Save with Enter
    if (e.key === "Enter" && !isSaving) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <div className="space-y-2">
      {isEditing ? (
        <div className="space-y-3">
          <div className="space-y-2">
            <Input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Ex: Eletrônicos"
              className="text-2xl font-semibold "
              disabled={isSaving}
              autoFocus
              maxLength={MAX_CHARACTERS + 10}
              onKeyDown={handleKeyDown}
            />
            <div className="flex items-center justify-between text-xs">
              <span
                className={`${
                  isOverLimit
                    ? "text-destructive font-medium"
                    : remainingCharacters < 20
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
              Pressione Enter para salvar ou Esc para cancelar
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
        <div
          role="button"
          tabIndex={0}
          className="group flex items-center gap-2 rounded-md border border-transparent bg-muted/50 px-3 py-2 transition-colors hover:border-border hover:bg-background cursor-pointer"
          onClick={handleEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleEdit();
            }
          }}
        >
          <p className="flex-1 text-2xl font-semibold">{name}</p>
          <Edit2 className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      )}
    </div>
  );
}
