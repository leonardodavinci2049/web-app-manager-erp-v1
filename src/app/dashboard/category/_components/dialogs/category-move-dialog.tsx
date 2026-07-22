"use client";

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
import { cn } from "@/lib/utils";
import { moveCategoryAction } from "../../_actions/category-actions";
import { LEVEL_LABELS } from "../category-constants";
import type { CategoryDetailDto, CategoryNodeDto } from "../category-types";

export function CategoryMoveDialog({
  detail,
  categories,
}: {
  detail: CategoryDetailDto;
  categories: CategoryNodeDto[];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const candidates =
    detail.level === 1
      ? []
      : categories.filter(
          (item) => item.level === detail.level - 1 && item.id !== detail.id,
        );
  const [parentId, setParentId] = useState(detail.parentId);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={detail.level === 1}
        onClick={() => setOpen(true)}
      >
        Mover categoria
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mover categoria</DialogTitle>
            <DialogDescription>
              Escolha uma nova categoria pai compatível com o nível{" "}
              {LEVEL_LABELS[detail.level]}.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-72 space-y-1 overflow-y-auto rounded-md border p-1">
            {candidates.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setParentId(item.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm hover:bg-muted",
                  parentId === item.id && "bg-muted font-medium",
                )}
              >
                <span>{item.name}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  #{item.id}
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Novo caminho:{" "}
            {categories.find((item) => item.id === parentId)?.name ??
              "Selecione um destino"}{" "}
            › {detail.name}
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              disabled={pending || parentId === detail.parentId}
              onClick={() =>
                startTransition(async () => {
                  const result = await moveCategoryAction({
                    categoryId: detail.id,
                    parentId,
                  });
                  result.success
                    ? toast.success(result.message)
                    : toast.error(result.message);
                  if (result.success) {
                    setOpen(false);
                    router.refresh();
                  }
                })
              }
            >
              Mover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
