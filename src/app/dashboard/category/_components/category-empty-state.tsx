import { FolderTree, Plus } from "lucide-react";
import type { CategoryDetailDto } from "./category-types";
import { CategoryCreateTrigger } from "./dialogs/category-create-dialog";

export function CategoryEmptyState({ detail }: { detail?: CategoryDetailDto }) {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="text-center">
        <FolderTree className="mx-auto mb-3 size-10 text-muted-foreground" />
        <h2 className="font-semibold">Nenhuma categoria cadastrada</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Crie uma família para iniciar a hierarquia.
        </p>
        <CategoryCreateTrigger parent={detail} className="mt-4">
          <Plus /> Nova família
        </CategoryCreateTrigger>
      </div>
    </div>
  );
}
