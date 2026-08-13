"use client";

import { Check, Edit2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { updateProductShortDescription } from "@/app/actions/action-product-updates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface ShortDescriptionEditorProps {
  productId: number;
  initialDescription: string | null;
  onUpdate?: (newDescription: string) => void;
}

export function ShortDescriptionEditor({
  productId,
  initialDescription,
  onUpdate,
}: ShortDescriptionEditorProps) {
  const MAX_CHARACTERS = 1000;
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(initialDescription || "");
  const [tempDescription, setTempDescription] = useState(description);
  const [isSaving, setIsSaving] = useState(false);

  const remainingCharacters = MAX_CHARACTERS - tempDescription.length;
  const isOverLimit = tempDescription.length > MAX_CHARACTERS;

  const handleEdit = () => {
    setTempDescription(description);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempDescription(description);
    setIsEditing(false);
  };

  const handleSave = async () => {
    // Validation: check if description is not empty or only whitespace
    if (!tempDescription.trim()) {
      toast.error("A descrição curta não pode estar vazia");
      return;
    }

    // Validation: check if description exceeds max length
    if (isOverLimit) {
      toast.error(
        `A descrição não pode ter mais de ${MAX_CHARACTERS} caracteres`,
      );
      return;
    }

    // If no changes were made
    if (tempDescription === description) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);

      // Call Server Action to update short description
      const result = await updateProductShortDescription(
        productId,
        tempDescription,
      );

      // Check if update was successful
      if (result.success) {
        setDescription(tempDescription);
        setIsEditing(false);
        toast.success("Descrição curta atualizada com sucesso!");

        // Callback to parent component if provided
        if (onUpdate) {
          onUpdate(tempDescription);
        }
      } else {
        toast.error(result.error || "Erro ao atualizar descrição curta");
      }
    } catch (error) {
      console.error("Error updating short description:", error);
      toast.error("Erro ao atualizar descrição curta");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Descrição Curta de Vendas</span>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-8 gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Editar
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Textarea
                value={tempDescription}
                onChange={(e) => setTempDescription(e.target.value)}
                placeholder="Digite a descrição curta de vendas do produto..."
                className="min-h-[120px] resize-none"
                disabled={isSaving}
                autoFocus
                maxLength={MAX_CHARACTERS + 50}
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
                  {tempDescription.length} / {MAX_CHARACTERS}
                </span>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
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
                disabled={isSaving || isOverLimit}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                Salvar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {description ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm italic">
                Nenhuma descrição curta cadastrada. Clique em editar para
                adicionar.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
