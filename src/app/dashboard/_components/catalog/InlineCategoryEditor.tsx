"use client";

import { Edit2, Loader2, Plus, Tag, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  deleteTaxonomyRelationship,
  fetchProductCategories,
} from "@/app/actions/action-taxonomy";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UITaxonomyRelProduct } from "@/services/api-main/taxonomy-rel/transformers/transformers";
import type { ProductCategory } from "../../../../../types/types";
import { AddCategoryInlineDialog } from "./AddCategoryInlineDialog";

interface InlineCategoryEditorProps {
  productId: number;
  productSku?: string;
  productName?: string;
  onCategoriesUpdated?: (categories: ProductCategory[]) => void;
}

export function InlineCategoryEditor({
  productId,
  productSku,
  productName,
  onCategoriesUpdated,
}: InlineCategoryEditorProps) {
  const [categories, setCategories] = useState<UITaxonomyRelProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categoryToDelete, setCategoryToDelete] =
    useState<UITaxonomyRelProduct | null>(null);

  // Load categories only when Sheet is opened
  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchProductCategories(productId);

      if (result.success) {
        setCategories(result.data);
        setHasLoadedOnce(true);
        // Notify parent about updated categories (map to ProductCategory for compatibility)
        onCategoriesUpdated?.(
          result.data.map((c) => ({
            ID_TAXONOMY: c.taxonomyId,
            TAXONOMIA: c.name,
          })),
        );
      } else {
        setError(result.message);
        setCategories([]);
      }
    } catch {
      setError("Erro ao carregar categorias");
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sheet open state change
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    // Load categories when opening the sheet for the first time
    if (open && !hasLoadedOnce) {
      loadCategories();
    }
  };

  const handleAddCategory = () => {
    setIsAddDialogOpen(true);
  };

  // Callback when a category is added successfully
  const handleAddCategorySuccess = () => {
    // Reload categories to show the new one
    loadCategories();
  };

  // Open confirmation dialog for delete
  const handleDeleteClick = (category: UITaxonomyRelProduct) => {
    setCategoryToDelete(category);
  };

  // Close confirmation dialog
  const handleCancelDelete = () => {
    setCategoryToDelete(null);
  };

  // Confirm and execute delete
  const handleConfirmDelete = async () => {
    if (!categoryToDelete?.taxonomyId) return;

    setIsDeleting(true);

    try {
      const result = await deleteTaxonomyRelationship(
        categoryToDelete.taxonomyId,
        productId,
      );

      if (result.success) {
        toast.success(result.message);
        // Reload categories to reflect the change
        loadCategories();
      } else {
        toast.error(result.message);
      }
    } catch (_error) {
      toast.error("Erro inesperado ao remover categoria");
    } finally {
      setIsDeleting(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 mt-2 group/category-editor cursor-pointer hover:bg-accent/50 p-1 -ml-1 rounded-md transition-colors text-left"
        >
          <Tag className="h-4 w-4 shrink-0" />
          <span className="font-medium text-muted-foreground">Categorias:</span>
          <Edit2 className="h-3 w-3 opacity-0 group-hover/category-editor:opacity-100 transition-opacity text-muted-foreground" />
        </button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="space-y-1">
            {(productSku || productName) && (
              <p className="text-sm text-muted-foreground">
                {productSku && <span>SKU: {productSku}</span>}
                {productSku && productName && <span> • </span>}
                {productName && <span>{productName}</span>}
              </p>
            )}
            <SheetTitle>Categorias Relacionadas</SheetTitle>
          </div>
        </SheetHeader>

        <div className="py-6 space-y-6">
          <div className="flex justify-end">
            <Button size="sm" className="gap-2" onClick={handleAddCategory}>
              <Plus className="h-4 w-4" />
              Adicionar Categoria
            </Button>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">ID</TableHead>
                  <TableHead>Nome da Categoria</TableHead>
                  <TableHead className="w-[100px]">Nível</TableHead>
                  <TableHead className="w-20 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton
                  [1, 2, 3].map((skeletonId) => (
                    <TableRow key={`skeleton-${skeletonId}`}>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-full max-w-[200px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-8" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-8 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  // Error state
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-destructive h-24"
                    >
                      {error}
                      <Button
                        variant="link"
                        size="sm"
                        onClick={loadCategories}
                        className="ml-2"
                      >
                        Tentar novamente
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : categories.length === 0 ? (
                  // Empty state
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground h-24"
                    >
                      Nenhuma categoria vinculada
                    </TableCell>
                  </TableRow>
                ) : (
                  // Categories list
                  categories.map((category) => (
                    <TableRow key={category.taxonomyId}>
                      <TableCell className="font-medium">
                        {category.taxonomyId}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{category.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          ---
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive/90"
                          onClick={() => handleDeleteClick(category)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Add Category Dialog */}
        <AddCategoryInlineDialog
          productId={productId}
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSuccess={handleAddCategorySuccess}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!categoryToDelete}
          onOpenChange={(open) => !open && handleCancelDelete()}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover categoria</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover a categoria{" "}
                <span className="font-semibold">
                  "{categoryToDelete?.name}"
                </span>{" "}
                deste produto?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Removendo...
                  </>
                ) : (
                  "Remover"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  );
}
