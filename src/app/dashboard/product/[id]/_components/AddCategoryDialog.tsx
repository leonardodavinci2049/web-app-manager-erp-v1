"use client";

import { Plus, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { loadCategoriesMenuAction } from "@/app/actions/action-categories";
import { createTaxonomyRelationship } from "@/app/actions/action-taxonomy";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import type { UITaxonomyMenuItem } from "@/services/api-main/taxonomy-base/transformers/transformers";

interface AddCategoryDialogProps {
  productId: number;
  existingCategoryIds?: number[]; // Optional now, not used for filtering
  onSuccess?: () => void;
}

/**
 * Get prefix dashes based on level
 */
function getLevelPrefix(level: number): string {
  if (level === 1) return "";
  if (level === 2) return "- ";
  if (level === 3) return "-- ";
  return "--- ";
}

/**
 * AddCategoryDialog Component
 *
 * Dialog to add a category relationship to a product.
 * Allows searching and selecting from available categories.
 */
export function AddCategoryDialog({
  productId,
  onSuccess,
}: AddCategoryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [categories, setCategories] = useState<UITaxonomyMenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Load categories when dialog opens
  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await loadCategoriesMenuAction();

      if (response.success) {
        setCategories(response.data);
      } else {
        toast.error(response.message || "Erro ao carregar categorias");
      }
    } catch (_error) {
      toast.error("Erro ao carregar categorias");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen, loadCategories]);

  async function handleAddCategory(categoryId: number) {
    setIsAdding(true);

    try {
      const result = await createTaxonomyRelationship(categoryId, productId);

      if (result.success) {
        toast.success(result.message);
        setIsOpen(false);
        setSearchTerm("");
        onSuccess?.();
      } else {
        // Check if it's a duplicate category message (not an error, just information)
        if (result.message.includes("Categoria já existe")) {
          toast.info(result.message);
        } else {
          toast.error(result.message);
        }
      }
    } catch (_error) {
      toast.error("Erro inesperado ao adicionar categoria");
    } finally {
      setIsAdding(false);
    }
  }

  // Filter categories based on search only (show all categories, including existing ones)
  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Categoria
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Categoria ao Produto</DialogTitle>
          <DialogDescription>
            Selecione uma categoria para adicionar ao produto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Categories List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">
                Nenhuma categoria encontrada
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] rounded-md border">
              <div className="space-y-1 p-4">
                {filteredCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleAddCategory(category.id)}
                    disabled={isAdding}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
                  >
                    <span className="flex items-center gap-1">
                      <span className="text-muted-foreground">
                        {getLevelPrefix(category.level || 1)}
                      </span>
                      <span>{category.name}</span>
                    </span>
                    <span className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>ID: {category.id}</span>
                      <span>Nível {category.level}</span>
                    </span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              setSearchTerm("");
            }}
            disabled={isAdding}
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
