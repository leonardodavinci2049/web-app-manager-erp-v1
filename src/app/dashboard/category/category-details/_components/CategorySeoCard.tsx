"use client";

/**
 * Category SEO Card Component
 *
 * Displays the category SEO section with inline editing capability.
 * Handles meta title and meta description editing with inline edit mode.
 */

import { Check, Edit2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TaxonomyData } from "@/services/api/taxonomy/types/taxonomy-types";

interface CategorySeoCardProps {
  category: TaxonomyData;
}

interface EditingState {
  field: string | null;
  value: string;
}

export function CategorySeoCard({ category }: CategorySeoCardProps) {
  const [editingState, setEditingState] = useState<EditingState>({
    field: null,
    value: "",
  });
  const [metaTitle, setMetaTitle] = useState(category.META_TITLE || "");
  const [metaDescription, setMetaDescription] = useState(
    category.META_DESCRIPTION || "",
  );

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
    if (fieldName === "metaTitle") {
      setMetaTitle(editingState.value);
    } else if (fieldName === "metaDescription") {
      setMetaDescription(editingState.value);
    }

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
        <h2 className="text-xl font-semibold">SEO</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Otimização para motores de busca.
        </p>
      </div>

      <div className="space-y-4">
        {/* Meta Title Field */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Meta Title (SEO)
          </Label>
          {isEditing("metaTitle") ? (
            <div className="flex gap-2">
              <Input
                value={editingState.value}
                onChange={(e) =>
                  setEditingState((prev) => ({
                    ...prev,
                    value: e.target.value,
                  }))
                }
                onKeyDown={(e) => handleKeyDown(e, "metaTitle")}
                maxLength={60}
                autoFocus
                className="flex-1"
                placeholder="Eletrônicos e Tecnologia - Melhores Produtos"
              />
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0"
                onClick={() => saveField("metaTitle")}
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
            <button
              type="button"
              className="group flex items-center gap-2 rounded-md border border-transparent bg-muted/50 px-3 py-2 transition-colors hover:border-border hover:bg-background cursor-pointer w-full text-left"
              onClick={() => startEditing("metaTitle", metaTitle)}
            >
              <p className="flex-1 text-sm text-muted-foreground">
                {metaTitle || "Eletrônicos e Tecnologia - Melhores Produtos"}
              </p>
              <Edit2 className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          )}
        </div>

        {/* Meta Description Field */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Meta Description (SEO)
          </Label>
          {isEditing("metaDescription") ? (
            <div className="flex gap-2">
              <Textarea
                value={editingState.value}
                onChange={(e) =>
                  setEditingState((prev) => ({
                    ...prev,
                    value: e.target.value,
                  }))
                }
                onKeyDown={(e) => handleKeyDown(e, "metaDescription")}
                maxLength={160}
                rows={3}
                autoFocus
                className="flex-1"
                placeholder="Descubra nossa ampla linha de produtos eletrônicos"
              />
              <div className="flex flex-col gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="shrink-0"
                  onClick={() => saveField("metaDescription")}
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
              className="group flex items-start gap-2 rounded-md border border-transparent bg-muted/50 px-3 py-2 transition-colors hover:border-border hover:bg-background cursor-pointer w-full text-left"
              onClick={() => startEditing("metaDescription", metaDescription)}
            >
              <p className="flex-1 text-sm text-muted-foreground">
                {metaDescription ||
                  "Descubra nossa ampla linha de produtos eletrônicos"}
              </p>
              <Edit2 className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 mt-0.5" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
