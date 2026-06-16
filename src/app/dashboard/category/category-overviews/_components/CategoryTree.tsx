"use client";

import { Plus } from "lucide-react";
import Form from "next/form";
import { useRouter } from "next/navigation";
import { useCallback, useId, useState } from "react";
import { toast } from "sonner";
import {
  createCategoryFromMenuAction,
  deleteCategoryFromMenuAction,
} from "@/app/actions/action-categories";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CategoryTreeItem } from "./CategoryTreeItem";
import type {
  CategoryNode,
  CategoryTreeProps,
  CreateCategoryTarget,
} from "./category-tree.types";

/** Busca um nó pelo ID na árvore */
function findNodeById(
  nodes: CategoryNode[],
  id: string | number,
): CategoryNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/** Retorna siblings de um nó (excluindo ele mesmo) */
function findSiblings(
  rootNodes: CategoryNode[],
  targetId: string | number,
  parentId: string | number | null | undefined,
): CategoryNode[] {
  if (parentId == null) {
    return rootNodes.filter((n) => n.id !== targetId);
  }
  const parent = findNodeById(rootNodes, parentId);
  if (!parent?.children) return [];
  return parent.children.filter((n) => n.id !== targetId);
}

/** Coleta todos os IDs de um nó e seus descendentes */
function collectAllIds(node: CategoryNode): (string | number)[] {
  const ids: (string | number)[] = [node.id];
  if (node.children) {
    for (const child of node.children) {
      ids.push(...collectAllIds(child));
    }
  }
  return ids;
}

/**
 * Componente cliente que gerencia o estado de expansão/colapso da árvore
 * Comportamento accordion: apenas um item aberto por nível de siblings
 */
export function CategoryTree({
  categories,
  onSelect,
  selectedId,
}: CategoryTreeProps) {
  const createFormId = useId();
  const router = useRouter();
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(
    new Set(),
  );
  const [createTarget, setCreateTarget] = useState<CreateCategoryTarget | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<CategoryNode | null>(null);
  const [createName, setCreateName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggle = useCallback(
    (
      id: string | number,
      isExpanded: boolean,
      parentId?: string | number | null,
    ) => {
      setExpandedIds((prev) => {
        const newExpanded = new Set(prev);

        if (isExpanded) {
          // Accordion: fecha siblings e seus descendentes
          const siblings = findSiblings(categories, id, parentId);
          for (const sibling of siblings) {
            for (const sibId of collectAllIds(sibling)) {
              newExpanded.delete(sibId);
            }
          }
          newExpanded.add(id);
        } else {
          // Fecha o nó e todos os seus descendentes
          const node = findNodeById(categories, id);
          if (node) {
            for (const descId of collectAllIds(node)) {
              newExpanded.delete(descId);
            }
          } else {
            newExpanded.delete(id);
          }
        }

        return newExpanded;
      });
    },
    [categories],
  );

  const isMutating = isCreating || isDeleting;

  const openCreateRootDialog = () => {
    setCreateName("");
    setCreateTarget({
      parentId: 0,
      parentName: "Raiz",
      parentLevel: 0,
    });
  };

  const openCreateDialog = (node: CategoryNode) => {
    if (node.level === 3) {
      toast.error("Não é possível adicionar subcategorias no nível 3.");
      return;
    }

    const parentLevel = node.level;

    setCreateName("");
    setCreateTarget({
      parentId: Number(node.id),
      parentName: node.name,
      parentLevel,
    });
  };

  const openDeleteDialog = (node: CategoryNode) => {
    setDeleteTarget(node);
  };

  const closeCreateDialog = (force = false) => {
    if (isCreating && !force) {
      return;
    }

    setCreateTarget(null);
    setCreateName("");
  };

  const closeDeleteDialog = (force = false) => {
    if (isDeleting && !force) {
      return;
    }

    setDeleteTarget(null);
  };

  const refreshTree = () => {
    router.refresh();
  };

  const handleCreateSubmit = async () => {
    if (!createTarget) {
      return;
    }

    setIsCreating(true);

    try {
      const result = await createCategoryFromMenuAction({
        name: createName,
        parentId: createTarget.parentId,
        parentLevel: createTarget.parentLevel,
      });

      if (result.success) {
        toast.success(result.message);
        closeCreateDialog(true);
        refreshTree();
        return;
      }

      toast.error(result.message);
    } catch {
      toast.error("Erro inesperado ao criar categoria.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteCategoryFromMenuAction({
        categoryId: Number(deleteTarget.id),
      });

      if (result.success) {
        toast.success(result.message);
        closeDeleteDialog(true);
        refreshTree();
        return;
      }

      toast.error(result.message);
    } catch {
      toast.error("Erro inesperado ao excluir categoria.");
    } finally {
      setIsDeleting(false);
    }
  };

  const createDialogDescription = createTarget
    ? createTarget.parentId === 0
      ? "Informe o nome da nova família que será exibida no nível raiz da árvore."
      : `A nova categoria será criada abaixo de ${createTarget.parentName}. Informe apenas o nome.`
    : "Informe o nome da nova categoria.";

  return (
    <TooltipProvider>
      <div className="space-y-3 py-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Adicione novas famílias, grupos e subgrupos diretamente pela árvore.
          </p>
          <Button
            type="button"
            onClick={openCreateRootDialog}
            disabled={isMutating}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Adicionar família
          </Button>
        </div>

        <div className="space-y-1">
          {categories.map((category) => (
            <CategoryTreeItem
              key={category.id}
              node={category}
              onToggle={handleToggle}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onAddChild={openCreateDialog}
              onDelete={openDeleteDialog}
              isMutating={isMutating}
              selectedId={selectedId}
            />
          ))}
        </div>

        <Dialog
          open={Boolean(createTarget)}
          onOpenChange={(open) => !open && closeCreateDialog()}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {createTarget?.parentId === 0
                  ? "Adicionar Família"
                  : "Adicionar Categoria"}
              </DialogTitle>
              <DialogDescription>{createDialogDescription}</DialogDescription>
            </DialogHeader>

            <Form
              id={createFormId}
              action={handleCreateSubmit}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="category-name">Nome da categoria</Label>
                <Input
                  id="category-name"
                  name="name"
                  value={createName}
                  onChange={(event) => setCreateName(event.target.value)}
                  placeholder="Ex: Notebooks"
                  maxLength={100}
                  minLength={2}
                  autoFocus
                  required
                />
              </div>

              {createTarget && createTarget.parentId > 0 ? (
                <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                  Categoria pai: <strong>{createTarget.parentName}</strong>
                </div>
              ) : (
                <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                  A categoria será criada como uma nova família no nível raiz.
                </div>
              )}
            </Form>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => closeCreateDialog()}
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button
                form={createFormId}
                type="submit"
                disabled={isCreating || createName.trim().length < 2}
              >
                {isCreating ? "Criando..." : "Criar categoria"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => !open && closeDeleteDialog()}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir categoria</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteTarget
                  ? `Confirma a exclusão da categoria ${deleteTarget.name}? A operação só será concluída se ela não possuir filhos nem produtos vinculados.`
                  : "Confirme a exclusão da categoria selecionada."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(event) => {
                  event.preventDefault();
                  handleDeleteSubmit();
                }}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Excluindo..." : "Excluir categoria"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
