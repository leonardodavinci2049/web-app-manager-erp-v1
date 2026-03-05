/**
 * Parent Category Card Component
 *
 * Displays the parent category with inline editing capability.
 * Wraps the ParentCategoryEditor in a card with proper styling and layout.
 */

import { Card } from "@/components/ui/card";
import type { UITaxonomyMenuItem } from "@/services/api-main/taxonomy-base/transformers/transformers";
import { ParentCategoryEditor } from "./inline-update/ParentCategoryEditor";

interface ParentCategoryCardProps {
  categoryId: number;
  currentParentId: number;
  currentParentName: string;
  categories: UITaxonomyMenuItem[];
}

export function ParentCategoryCard({
  categoryId,
  currentParentId,
  currentParentName,
  categories,
}: ParentCategoryCardProps) {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Categoria Pai</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Define o nível hierárquico da categoria.
        </p>
      </div>
      <ParentCategoryEditor
        categoryId={categoryId}
        currentParentId={currentParentId}
        currentParentName={currentParentName}
        categories={categories}
      />
    </Card>
  );
}
