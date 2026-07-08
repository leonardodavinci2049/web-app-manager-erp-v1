import { Badge } from "@/components/ui/badge";
import type { ProductCategory } from "@/types/types";

interface CategoryTagsProps {
  categories?: ProductCategory[];
  className?: string;
}

/**
 * CategoryTags Component
 * Displays product categories as tags/badges
 * Shows categories from the CATEGORIAS field returned by the API
 * Categories are sorted by ID_TAXONOMY in ascending order
 */
export function CategoryTags({ categories, className }: CategoryTagsProps) {
  // Don't render if no categories
  if (!categories || categories.length === 0) {
    return null;
  }

  // Sort categories by ID_TAXONOMY in ascending order
  const sortedCategories = [...categories].sort(
    (a, b) => (a.ID_TAXONOMY ?? 0) - (b.ID_TAXONOMY ?? 0),
  );

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-1.5">
        {sortedCategories.map((category) => (
          <Badge
            key={category.ID_TAXONOMY}
            variant="secondary"
            className="text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {category.TAXONOMIA}
          </Badge>
        ))}
      </div>
    </div>
  );
}
