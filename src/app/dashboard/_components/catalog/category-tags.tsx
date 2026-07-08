import { Badge } from "@/components/ui/badge";
import type { ProductCategory } from "@/types/types";

interface CategoryTagsProps {
  categories?: ProductCategory[];
  className?: string;
}

/**
 * Exibe as categorias de um produto como tags/badges.
 * Server Component apresentacional.
 */
export function CategoryTags({ categories, className }: CategoryTagsProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

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
            className="bg-slate-100 text-slate-700 text-xs hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {category.TAXONOMIA}
          </Badge>
        ))}
      </div>
    </div>
  );
}
