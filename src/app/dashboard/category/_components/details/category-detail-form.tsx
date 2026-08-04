"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  toggleCategoryStatusAction,
  updateCategoryAction,
} from "../../_actions/category-actions";
import type { CategoryDetailDto, CategoryNodeDto } from "../category-types";
import { CategoryDeleteDialog } from "../dialogs/category-delete-dialog";
import { CategoryMoveDialog } from "../dialogs/category-move-dialog";
import {
  type DetailFormValues,
  detailFormSchema,
} from "./category-detail-form-schema";

export function CategoryDetailForm({
  detail,
  flatCategories,
}: {
  detail: CategoryDetailDto;
  flatCategories: CategoryNodeDto[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<DetailFormValues>({
    resolver: zodResolver(detailFormSchema),
    defaultValues: {
      name: detail.name,
      slug: detail.slug,
      order: detail.order,
      metaTitle: detail.metaTitle,
      metaDescription: detail.metaDescription,
      notes: detail.notes,
    },
  });
  useEffect(
    () =>
      form.reset({
        name: detail.name,
        slug: detail.slug,
        order: detail.order,
        metaTitle: detail.metaTitle,
        metaDescription: detail.metaDescription,
        notes: detail.notes,
      }),
    [detail, form],
  );
  const parent = flatCategories.find((item) => item.id === detail.parentId);

  const submit = form.handleSubmit((values) =>
    startTransition(async () => {
      const result = await updateCategoryAction({
        ...values,
        id: detail.id,
        parentId: detail.parentId,
        imagePath: detail.imagePath ?? "",
        inactive: detail.status === "inactive",
      });
      result.success
        ? toast.success(result.message)
        : toast.error(result.message);
      if (result.success) router.refresh();
    }),
  );

  return (
    <form id="category-detail-form" onSubmit={submit} className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="category-name">Nome</Label>
          <Input
            id="category-name"
            {...form.register("name")}
            aria-invalid={Boolean(form.formState.errors.name)}
          />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="category-slug">Slug</Label>
          <Input id="category-slug" {...form.register("slug")} />
          {form.formState.errors.slug && (
            <p className="text-xs text-destructive">
              {form.formState.errors.slug.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="category-order">Ordem</Label>
          <Input
            id="category-order"
            type="number"
            min={1}
            {...form.register("order", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category-id">ID</Label>
          <Input
            id="category-id"
            value={detail.id}
            readOnly
            className="bg-muted font-mono"
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Input
            value={detail.status === "active" ? "Ativa" : "Inativa"}
            readOnly
            className="bg-muted"
          />
        </div>
      </section>
      <Separator />
      <section className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="meta-title">Meta título</Label>
          <Input id="meta-title" {...form.register("metaTitle")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="meta-description">Meta descrição</Label>
          <Textarea
            id="meta-description"
            rows={3}
            {...form.register("metaDescription")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Anotações internas</Label>
          <Textarea id="notes" rows={4} {...form.register("notes")} />
        </div>
      </section>
      <section className="rounded-md border bg-muted/20 p-4">
        <h3 className="text-sm font-semibold">Categoria pai</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Caminho atual: {parent?.name ?? "Raiz"}
        </p>
        <div className="mt-3">
          <CategoryMoveDialog detail={detail} categories={flatCategories} />
        </div>
      </section>
      <section className="rounded-md border border-destructive/20 bg-destructive/5 p-4">
        <h3 className="text-sm font-semibold text-destructive">
          Zona de perigo
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await toggleCategoryStatusAction(detail.id);
                result.success
                  ? toast.success(result.message)
                  : toast.error(result.message);
                if (result.success) router.refresh();
              })
            }
          >
            {detail.status === "active"
              ? "Inativar categoria"
              : "Ativar categoria"}
          </Button>
          <CategoryDeleteDialog detail={detail} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Categorias com filhos ou produtos vinculados não podem ser excluídas.
        </p>
      </section>
      <div aria-live="polite" className="sr-only">
        {pending ? "Salvando categoria" : ""}
      </div>
    </form>
  );
}
