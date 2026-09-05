"use client";

import { Edit2, Loader2, Plus, Tag, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { AddCategoryInlineDialog } from "../../add-category-inline-dialog";

interface InlineCategoryEditorProps {
  productId: number;
  productSku?: string;
  productName?: string;
}

export function InlineCategoryEditor({
  productId,
  productSku,
  productName,
}: InlineCategoryEditorProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<UITaxonomyRelProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categoryToDelete, setCategoryToDelete] =
    useState<UITaxonomyRelProduct | null>(null);

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchProductCategories(productId);

      if (result.success) {
        setCategories(result.data);
        setHasLoadedOnce(true);
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

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !hasLoadedOnce) {
      loadCategories();
    }
  };

  const handleAddCategorySuccess = () => {
    loadCategories();
    router.refresh();
  };

  const handleDeleteClick = (category: UITaxonomyRelProduct) => {
    setCategoryToDelete(category);
  };

  const handleCancelDelete = () => {
    setCategoryToDelete(null);
  };

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
        loadCategories();
        router.refresh();
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
          className="group/category-editor hover:bg-accent/50 -ml-1 flex cursor-pointer items-center gap-1.5 rounded-md p-0.5 text-left text-xs transition-colors"
        >
          <Tag className="h-4 w-4 shrink-0" />
          <span className="text-muted-foreground font-medium">Categorias:</span>
          <Edit2 className="h-3 w-3 text-muted-foreground transition-opacity md:opacity-0 md:group-hover/category-editor:opacity-100 md:group-focus-visible/category-editor:opacity-100" />
        </button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader className="flex flex-row items-center justify-between space-y-0 border-b pb-4">
          <div className="space-y-1">
            {(productSku || productName) && (
              <p className="text-muted-foreground text-sm">
                {productSku && <span>SKU: {productSku}</span>}
                {productSku && productName && <span> • </span>}
                {productName && <span>{productName}</span>}
              </p>
            )}
            <SheetTitle>Categorias Relacionadas</SheetTitle>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <div className="flex justify-end">
            <Button
              size="sm"
              className="gap-2"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Adicionar Categoria
            </Button>
          </div>

          <div className="rounded-md border">
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
                        <Skeleton className="ml-auto h-8 w-8" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-destructive h-24 text-center"
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
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-muted-foreground h-24 text-center"
                    >
                      Nenhuma categoria vinculada
                    </TableCell>
                  </TableRow>
                ) : (
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
                        <span className="text-muted-foreground text-xs">
                          ---
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive h-8 w-8 hover:text-destructive/90"
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

        <AddCategoryInlineDialog
          productId={productId}
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSuccess={handleAddCategorySuccess}
        />

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
