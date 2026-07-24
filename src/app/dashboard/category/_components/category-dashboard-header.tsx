import { Plus } from "lucide-react";
import { CategoryCreateTrigger } from "./dialogs/category-create-dialog";

export function CategoryDashboardHeader() {
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
      <CategoryCreateTrigger className="hidden md:inline-flex">
        <Plus /> Nova família
      </CategoryCreateTrigger>
    </div>
  );
}
