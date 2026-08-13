import { FolderTree } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UIProductManagerRelatedCategory } from "@/services/api-main/product-manager/transformers/transformers";
import { ProductCategoryAddDialog } from "./product-category-add-dialog";
import { ProductCategoryRemoveButton } from "./product-category-remove-button";

interface ProductCategoriesCardProps {
  relatedCategories: UIProductManagerRelatedCategory[];
  productId: number;
}

/**
 * ProductCategoriesCard Component
 *
 * Displays product related categories in a table format.
 * Shows a message when no categories are defined.
 * Allows adding and deleting category relationships.
 */
export function ProductCategoriesCard({
  relatedCategories,
  productId,
}: ProductCategoriesCardProps) {
  const hasTaxonomies = relatedCategories.length > 0;
  const existingCategoryIds = relatedCategories.map((t) => t.taxonomyId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Categorias Relacionadas
          </CardTitle>
          <ProductCategoryAddDialog
            productId={productId}
            existingCategoryIds={existingCategoryIds}
          />
        </div>
      </CardHeader>
      <CardContent>
        {hasTaxonomies ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Nome da Categoria</TableHead>
                  <TableHead className="w-[80px] text-center">Nível</TableHead>
                  <TableHead className="w-[80px] text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatedCategories.map((category) => (
                  <TableRow key={category.taxonomyId}>
                    <TableCell className="font-medium">
                      {category.taxonomyId}
                    </TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell className="text-center">
                      {category.level ?? "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <ProductCategoryRemoveButton
                        taxonomyId={category.taxonomyId}
                        taxonomyName={category.name}
                        productId={productId}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-muted-foreground italic text-sm">
            Nenhuma categoria relacionada
          </p>
        )}
      </CardContent>
    </Card>
  );
}
