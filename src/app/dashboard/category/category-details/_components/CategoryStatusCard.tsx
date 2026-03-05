/**
 * Category Status Card Component
 *
 * Displays the category status with inline editing capability.
 * Wraps the CategoryStatusEditor in a card with proper styling and layout.
 */

import { Card } from "@/components/ui/card";
import { CategoryStatusEditor } from "./inline-update/CategoryStatusEditor";

interface CategoryStatusCardProps {
  categoryId: number;
  initialStatus: number;
}

export function CategoryStatusCard({
  categoryId,
  initialStatus,
}: CategoryStatusCardProps) {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Status da Categoria</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ative ou desative a exibição da categoria no site.
        </p>
      </div>
      <CategoryStatusEditor
        categoryId={categoryId}
        initialStatus={initialStatus}
      />
    </Card>
  );
}
