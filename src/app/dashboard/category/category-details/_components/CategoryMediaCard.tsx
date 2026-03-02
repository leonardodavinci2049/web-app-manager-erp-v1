"use client";

/**
 * Category Media Card Component
 *
 * Displays the category media section with inline editing capability.
 * Handles image path editing with inline edit mode.
 */

import { Check, Edit2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TaxonomyData } from "@/services/api/taxonomy/types/taxonomy-types";

interface CategoryMediaCardProps {
  category: TaxonomyData;
}

interface EditingState {
  field: string | null;
  value: string;
}

export function CategoryMediaCard({ category }: CategoryMediaCardProps) {
  const [editingState, setEditingState] = useState<EditingState>({
    field: null,
    value: "",
  });
  const [imagePath, setImagePath] = useState(category.PATH_IMAGEM || "");

  // Check if a field is being edited
  const isEditing = (fieldName: string) => editingState.field === fieldName;

  // Start editing a field
  const startEditing = (fieldName: string, currentValue: string) => {
    setEditingState({ field: fieldName, value: currentValue });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingState({ field: null, value: "" });
  };

  // Save changes (placeholder - will implement later)
  const saveField = (fieldName: string) => {
    // Update local state
    setImagePath(editingState.value);

    // TODO: Implement API call to save changes
    console.log(`Saving ${fieldName}:`, editingState.value);

    // Exit editing mode
    cancelEditing();
  };

  // Handle Enter key to save
  const handleKeyDown = (e: React.KeyboardEvent, fieldName: string) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveField(fieldName);
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEditing();
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Mídia</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Gerencie as imagens da categoria.
        </p>
      </div>

      <div className="space-y-4">
        {/* Image Path Field */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Caminho da Imagem
          </Label>
          {isEditing("imagePath") ? (
            <div className="flex gap-2">
              <Input
                value={editingState.value}
                onChange={(e) =>
                  setEditingState((prev) => ({
                    ...prev,
                    value: e.target.value,
                  }))
                }
                onKeyDown={(e) => handleKeyDown(e, "imagePath")}
                autoFocus
                className="flex-1"
                placeholder="/images/categories/electronics.jpg"
              />
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0"
                onClick={() => saveField("imagePath")}
              >
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0"
                onClick={cancelEditing}
              >
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              className="group flex items-center gap-2 rounded-md border border-transparent bg-muted/50 px-3 py-2 transition-colors hover:border-border hover:bg-background cursor-pointer"
              onClick={() => startEditing("imagePath", imagePath)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  startEditing("imagePath", imagePath);
                }
              }}
            >
              <p className="flex-1 text-sm text-muted-foreground truncate">
                {imagePath || "/images/categories/electronics.jpg"}
              </p>
              <Edit2 className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
