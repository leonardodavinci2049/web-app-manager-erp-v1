"use client";

import { Check, Edit2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UITaxonomyMenuItem } from "@/services/api-main/taxonomy-base/transformers/transformers";
import { updateCategoryParent } from "../../actions/action-category-updates";

interface ParentCategoryEditorProps {
  categoryId: number;
  currentParentId: number;
  currentParentName: string;
  categories: UITaxonomyMenuItem[];
  onUpdate?: (newParentId: number, newParentName: string) => void;
}

export function ParentCategoryEditor({
  categoryId,
  currentParentId,
  currentParentName,
  categories,
  onUpdate,
}: ParentCategoryEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [parentId, setParentId] = useState(currentParentId);
  const [parentName, setParentName] = useState(currentParentName);
  const [tempParentId, setTempParentId] = useState(parentId);
  const [isSaving, setIsSaving] = useState(false);

  // Filter out the current category and its descendants to prevent circular references
  const availableCategories = categories.filter((cat) => cat.id !== categoryId);

  // Group categories by parent (level 1 = root, level 2 = children)
  const level1Categories = availableCategories.filter(
    (cat) => (cat.level ?? 1) === 1,
  );
  const level2Categories = availableCategories.filter(
    (cat) => (cat.level ?? 1) === 2,
  );

  // Create map of children by parent ID for grouping
  const childrenByParent = new Map<number, UITaxonomyMenuItem[]>();
  for (const child of level2Categories) {
    const parentId = child.parentId;
    const existing = childrenByParent.get(parentId) ?? [];
    existing.push(child);
    childrenByParent.set(parentId, existing);
  }

  const handleEdit = () => {
    setTempParentId(parentId);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempParentId(parentId);
    setIsEditing(false);
  };

  const handleSave = async () => {
    // If no changes were made
    if (tempParentId === parentId) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);

      // Call Server Action to update category parent
      const result = await updateCategoryParent(categoryId, tempParentId);

      // Check if update was successful
      if (result.success) {
        // Find the new parent name
        const newParentName =
          tempParentId === 0
            ? "Raiz"
            : availableCategories.find((cat) => cat.id === tempParentId)
                ?.name || `ID ${tempParentId}`;

        setParentId(tempParentId);
        setParentName(newParentName);
        setIsEditing(false);
        toast.success(result.message || "Categoria pai atualizada com sucesso");

        // Callback to parent component if provided
        if (onUpdate) {
          onUpdate(tempParentId, newParentName);
        }
      } else {
        toast.error(result.error || "Erro ao atualizar categoria pai");
      }
    } catch (error) {
      console.error("Error updating category parent:", error);
      toast.error("Erro ao atualizar categoria pai");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-muted-foreground">
        Categoria Pai
      </Label>
      {isEditing ? (
        <div className="space-y-3">
          <Select
            value={tempParentId.toString()}
            onValueChange={(value) =>
              setTempParentId(Number.parseInt(value, 10))
            }
            disabled={isSaving}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione a categoria pai" />
            </SelectTrigger>
            <SelectContent>
              {/* Root option */}
              <SelectItem value="0">Categoria Raiz</SelectItem>

              {/* Level 1 categories (selectable) with their level 2 children grouped below */}
              {level1Categories.map((rootCategory) => {
                const children = childrenByParent.get(rootCategory.id);
                const hasChildren = children && children.length > 0;

                if (hasChildren) {
                  return (
                    <SelectGroup key={rootCategory.id}>
                      {/* Level 1 category as selectable item */}
                      <SelectItem
                        value={rootCategory.id.toString()}
                        className="font-semibold"
                      >
                        📁 {rootCategory.name}
                      </SelectItem>
                      {/* Level 2 children indented */}
                      {children.map((childCategory) => (
                        <SelectItem
                          key={childCategory.id}
                          value={childCategory.id.toString()}
                          className="pl-8"
                        >
                          <span className="text-muted-foreground">└─</span>{" "}
                          {childCategory.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  );
                }

                // Root category without children
                return (
                  <SelectItem
                    key={rootCategory.id}
                    value={rootCategory.id.toString()}
                    className="font-semibold"
                  >
                    📁 {rootCategory.name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            💡 Selecione a categoria pai (Nível 1 - Família ou Nível 2 - Grupo)
            ou "Raiz" para categoria de nível 1
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
          <button
            type="button"
            className="group flex items-center gap-2 rounded-md border border-transparent bg-muted/50 px-3 py-2 transition-colors hover:border-border hover:bg-background cursor-pointer w-full text-left"
            onClick={handleEdit}
          >
            <p className="flex-1 text-sm text-muted-foreground">{parentName}</p>
            <Edit2 className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        </div>
      )}
    </div>
  );
}
