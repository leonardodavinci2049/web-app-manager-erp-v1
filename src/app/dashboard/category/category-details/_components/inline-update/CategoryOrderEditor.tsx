"use client";

import { Check, Edit2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateCategoryOrder } from "../../actions/action-category-updates";

interface CategoryOrderEditorProps {
  categoryId: number;
  parentId: number;
  initialOrder: number;
  onUpdate?: (newOrder: number) => void;
}

export function CategoryOrderEditor({
  categoryId,
  parentId,
  initialOrder,
  onUpdate,
}: CategoryOrderEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [order, setOrder] = useState(initialOrder);
  const [tempOrder, setTempOrder] = useState(order);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setTempOrder(order);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempOrder(order);
    setIsEditing(false);
  };

  const handleSave = async () => {
    // If no changes were made
    if (tempOrder === order) {
      setIsEditing(false);
      return;
    }

    // Validate order is positive
    if (tempOrder < 1) {
      toast.error("A ordem deve ser maior que zero");
      return;
    }

    try {
      setIsSaving(true);

      // Call Server Action to update category order
      const result = await updateCategoryOrder(categoryId, parentId, tempOrder);

      // Check if update was successful
      if (result.success) {
        setOrder(tempOrder);
        setIsEditing(false);
        toast.success(result.message || "Ordem atualizada com sucesso");

        // Callback to parent component if provided
        if (onUpdate) {
          onUpdate(tempOrder);
        }
      } else {
        toast.error(result.error || "Erro ao atualizar ordem");
      }
    } catch (error) {
      console.error("Error updating category order:", error);
      toast.error("Erro ao atualizar ordem");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-muted-foreground">Ordem</Label>
      {isEditing ? (
        <div className="space-y-3">
          <Input
            type="number"
            min="1"
            value={tempOrder}
            onChange={(e) =>
              setTempOrder(Number.parseInt(e.target.value, 10) || 1)
            }
            onKeyDown={handleKeyDown}
            disabled={isSaving}
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            💡 A ordem determina a posição de exibição da categoria
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
              disabled={isSaving}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              Salvar
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
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
            <p className="flex-1 text-sm text-muted-foreground">{order}</p>
            <Edit2 className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>
      )}
    </div>
  );
}
