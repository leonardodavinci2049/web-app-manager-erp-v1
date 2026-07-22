"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteCategoryAction } from "../../_actions/category-actions";
import { useCategoryQueryNavigation } from "../../_hooks/use-category-query-navigation";
import type { CategoryDetailDto } from "../category-types";

export function CategoryDeleteDialog({
  detail,
}: {
  detail: CategoryDetailDto;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const navigate = useCategoryQueryNavigation();
  const [pending, startTransition] = useTransition();
  const blocked = detail.childCount > 0 || detail.directProductCount > 0;

  return (
    <>
      <Button type="button" variant="destructive" onClick={() => setOpen(true)}>
        <Trash2 /> Excluir categoria
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir categoria</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          {blocked ? (
            <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm">
              <p className="font-medium text-destructive">
                Não é possível excluir.
              </p>
              {detail.childCount > 0 && (
                <p className="mt-1">
                  A categoria possui {detail.childCount} filha(s).
                </p>
              )}
              {detail.directProductCount > 0 && (
                <p className="mt-1">
                  A categoria possui {detail.directProductCount} produto(s)
                  vinculado(s).
                </p>
              )}
            </div>
          ) : (
            <p className="rounded-md border bg-muted/30 p-3 text-sm">
              <strong>{detail.name}</strong> (#{detail.id}) será removida
              permanentemente.
            </p>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={blocked || pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await deleteCategoryAction(detail.id);
                  result.success
                    ? toast.success(result.message)
                    : toast.error(result.message);
                  if (result.success) {
                    setOpen(false);
                    navigate({
                      categoryId: detail.parentId
                        ? String(detail.parentId)
                        : undefined,
                    });
                    router.refresh();
                  }
                })
              }
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
