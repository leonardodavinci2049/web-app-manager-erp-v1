/**
 * Category Order Card Component
 *
 * Displays the category order with inline editing capability.
 * Wraps the CategoryOrderEditor in a card with proper styling and layout.
 */

import { Card } from "@/components/ui/card";
import { CategoryOrderEditor } from "./inline-update/CategoryOrderEditor";

interface CategoryOrderCardProps {
  categoryId: number;
  parentId: number;
  initialOrder: number;
}

export function CategoryOrderCard({
  categoryId,
  parentId,
  initialOrder,
}: CategoryOrderCardProps) {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Ordem de Exibição</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Define a posição da categoria na listagem.
        </p>
      </div>
      <CategoryOrderEditor
        categoryId={categoryId}
        parentId={parentId}
        initialOrder={initialOrder}
      />
    </Card>
  );
}
