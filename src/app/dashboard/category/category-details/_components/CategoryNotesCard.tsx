"use client";

/**
 * Category Notes Card Component
 *
 * Displays the category notes section with inline editing capability.
 * Handles notes/annotations editing with inline edit mode.
 */

import { Check, Edit2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TaxonomyData } from "@/services/api/taxonomy/types/taxonomy-types";

interface CategoryNotesCardProps {
  category: TaxonomyData;
}

interface EditingState {
  field: string | null;
  value: string;
}

export function CategoryNotesCard({ category }: CategoryNotesCardProps) {
  const [editingState, setEditingState] = useState<EditingState>({
    field: null,
    value: "",
  });
  const [notes, setNotes] = useState(category.ANOTACOES || "");

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
    setNotes(editingState.value);

    // TODO: Implement API call to save changes
    console.log(`Saving ${fieldName}:`, editingState.value);

    // Exit editing mode
    cancelEditing();
  };

  // Handle Enter key to save (Shift+Enter for new line in textarea)
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
        <h2 className="text-xl font-semibold">Anotações</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Informações adicionais e notas internas.
        </p>
      </div>

      <div className="space-y-4">
        {/* Notes Field */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Anotações
          </Label>
          {isEditing("notes") ? (
            <div className="flex gap-2">
              <Textarea
                value={editingState.value}
                onChange={(e) =>
                  setEditingState((prev) => ({
                    ...prev,
                    value: e.target.value,
                  }))
                }
                onKeyDown={(e) => handleKeyDown(e, "notes")}
                rows={4}
                autoFocus
                className="flex-1"
                placeholder="Informações adicionais sobre a categoria"
              />
              <div className="flex flex-col gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="shrink-0"
                  onClick={() => saveField("notes")}
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
            </div>
          ) : (
            <button
              type="button"
              className="group flex items-start gap-2 rounded-md border border-transparent bg-muted/50 px-3 py-2 transition-colors hover:border-border hover:bg-background cursor-pointer min-h-[100px] w-full text-left"
              onClick={() => startEditing("notes", notes)}
            >
              <p className="flex-1 text-sm text-muted-foreground whitespace-pre-wrap">
                {notes || "Informações adicionais sobre a categoria"}
              </p>
              <Edit2 className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 mt-0.5" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
