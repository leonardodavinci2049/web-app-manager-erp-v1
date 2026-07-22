"use client";

import type { VariantProps } from "class-variance-authority";
import { useRouter } from "next/navigation";
import { type ReactNode, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button, type buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCategoryAction } from "../../_actions/category-actions";
import { useCategoryQueryNavigation } from "../_hooks/use-category-query-navigation";
import type { CategoryDetailDto } from "../category-types";

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
type ButtonSize = VariantProps<typeof buttonVariants>["size"];

export function CategoryCreateTrigger({
  parent,
  children,
  variant = "default",
  size,
  className,
}: {
  parent?: CategoryDetailDto;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        {children}
      </Button>
      <CategoryCreateDialog
        open={open}
        onOpenChange={setOpen}
        parent={parent}
      />
    </>
  );
}

export function CategoryCreateDialog({
  open,
  onOpenChange,
  parent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parent?: CategoryDetailDto;
}) {
  const router = useRouter();
  const navigate = useCategoryQueryNavigation();
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();
  const parentId = parent && parent.level < 3 ? parent.id : 0;
  const label =
    parentId === 0 ? "família" : parent?.level === 1 ? "grupo" : "subgrupo";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova {label}</DialogTitle>
          <DialogDescription>
            {parentId
              ? `Será criada dentro de ${parent?.name}.`
              : "Será criada no primeiro nível da hierarquia."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="new-category-name">Nome</Label>
          <Input
            id="new-category-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            disabled={pending || name.trim().length < 2}
            onClick={() =>
              startTransition(async () => {
                const result = await createCategoryAction({ name, parentId });
                result.success
                  ? toast.success(result.message)
                  : toast.error(result.message);
                if (result.success) {
                  onOpenChange(false);
                  setName("");
                  navigate({
                    categoryId: result.categoryId
                      ? String(result.categoryId)
                      : undefined,
                  });
                  router.refresh();
                }
              })
            }
          >
            Criar {label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
