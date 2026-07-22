import { Plus } from "lucide-react";
import type { CategoryDetailDto } from "./category-types";
import { CategoryCreateTrigger } from "./dialogs/category-create-dialog";

export function CategoryDashboardHeader({
  detail,
}: {
  detail?: CategoryDetailDto;
}) {
  return (
    <div className="flex flex-col justify-between gap-3 px-3 py-3 sm:flex-row sm:items-center lg:px-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Gerenciamento de categorias
        </h1>
        <p className="text-xs text-muted-foreground">
          Famílias, grupos, subgrupos e seus produtos.
        </p>
      </div>
      <CategoryCreateTrigger parent={detail}>
        <Plus /> Nova família
      </CategoryCreateTrigger>
    </div>
  );
}
