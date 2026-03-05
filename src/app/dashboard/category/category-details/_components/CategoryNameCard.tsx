/**
 * Category Name Card Component
 *
 * Displays the category name with inline editing capability.
 * Wraps the CategoryNameEditor in a card with proper styling and layout.
 */

import { Card } from "@/components/ui/card";
import { CategoryNameEditor } from "./inline-update/CategoryNameEditor";

interface CategoryNameCardProps {
  categoryId: number;
  initialName: string;
}

export function CategoryNameCard({
  categoryId,
  initialName,
}: CategoryNameCardProps) {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Nome da Categoria</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Clique no nome para editá-lo diretamente.
        </p>
      </div>
      <CategoryNameEditor categoryId={categoryId} initialName={initialName} />
    </Card>
  );
}
