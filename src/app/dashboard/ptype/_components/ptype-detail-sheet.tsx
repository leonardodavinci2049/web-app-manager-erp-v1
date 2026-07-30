"use client";

import {
  CalendarDays,
  CheckCircle2,
  CircleOff,
  FileText,
  Loader2,
  PackageSearch,
  Save,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  deletePtypeAction,
  setPtypeStatusAction,
  updatePtypeAction,
} from "@/app/dashboard/ptype/_actions/ptype-actions";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { buildPtypeUrl } from "./lib/search-params";
import type {
  PtypeDetailData,
  PtypeSearchParams,
} from "./types/ptype-dashboard-types";

type Confirmation = "activate" | "deactivate" | "delete";

interface PtypeDetailSheetProps {
  detail: PtypeDetailData | undefined;
  searchState: PtypeSearchParams;
  currentPageItemCount: number;
}

function formatDate(value?: string): string {
  if (!value) return "Não informada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
  }).format(date);
}

export function PtypeDetailSheet({
  detail,
  searchState,
  currentPageItemCount,
}: PtypeDetailSheetProps) {
  const router = useRouter();
  const item = detail?.item;
  const [name, setName] = useState(item?.name ?? "");
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation>();
  const [isMutating, setIsMutating] = useState(false);

  useEffect(() => {
    setName(item?.name ?? "");
    setNotes(item?.notes ?? "");
    setFieldErrors({});
  }, [item]);

  const closeSheet = () => {
    router.replace(buildPtypeUrl({ ...searchState, ptypeId: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!item) return;

    setIsSaving(true);
    setFieldErrors({});
    try {
      const result = await updatePtypeAction({
        ptypeId: item.id,
        name,
        notes,
      });
      if (!result.success) {
        setFieldErrors(result.fieldErrors ?? {});
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    } catch {
      toast.error("Não foi possível concluir a comunicação com o servidor.");
    } finally {
      setIsSaving(false);
    }
  };

  const executeConfirmation = async () => {
    if (!item || !confirmation) return;
    setIsMutating(true);

    try {
      const result =
        confirmation === "delete"
          ? await deletePtypeAction(item.id)
          : await setPtypeStatusAction({
              ptypeId: item.id,
              inactive: confirmation === "deactivate",
            });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      if (confirmation === "delete") {
        const previousPage =
          currentPageItemCount <= 1 && searchState.page > 0
            ? searchState.page - 1
            : searchState.page;
        router.replace(
          buildPtypeUrl({
            ...searchState,
            page: previousPage,
            ptypeId: undefined,
          }),
        );
      }
      router.refresh();
      setConfirmation(undefined);
    } catch {
      toast.error("Não foi possível concluir a comunicação com o servidor.");
    } finally {
      setIsMutating(false);
    }
  };

  const confirmationCopy =
    confirmation === "delete"
      ? {
          title: "Excluir tipo de produto?",
          description: `A API validará se “${item?.name ?? "este tipo"}” pode ser excluído. Esta ação não pode ser desfeita.`,
          action: "Excluir definitivamente",
        }
      : confirmation === "deactivate"
        ? {
            title: "Marcar como inativo?",
            description:
              "Confirme que deseja definir explicitamente este tipo como inativo.",
            action: "Marcar como inativo",
          }
        : {
            title: "Marcar como ativo?",
            description:
              "Confirme que deseja definir explicitamente este tipo como ativo.",
            action: "Marcar como ativo",
          };

  return (
    <>
      <Sheet
        open={Boolean(searchState.ptypeId)}
        onOpenChange={(open) => {
          if (!open) closeSheet();
        }}
      >
        <SheetContent
          side="right"
          className="flex w-[94vw] max-w-xl flex-col gap-0 p-0 sm:max-w-xl"
        >
          <SheetHeader className="shrink-0 border-b p-5 pr-12">
            <SheetTitle>Detalhes do tipo de produto</SheetTitle>
            <SheetDescription>
              Consulte o cadastro e execute apenas alterações explícitas.
            </SheetDescription>
          </SheetHeader>

          {detail?.state === "ready" && item ? (
            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5">
                <section className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground text-xs">ID</p>
                    <p className="font-medium tabular-nums">{item.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1 text-xs">
                      <CalendarDays className="size-3.5" />
                      Data de cadastro
                    </p>
                    <p className="text-sm font-medium">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ptype-detail-name">Nome</Label>
                    <Input
                      id="ptype-detail-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      maxLength={100}
                      disabled={isSaving || isMutating}
                      aria-invalid={Boolean(fieldErrors.name?.length)}
                    />
                    {fieldErrors.name?.[0] && (
                      <p className="text-destructive text-sm">
                        {fieldErrors.name[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor="ptype-detail-notes">Observações</Label>
                      <span className="text-muted-foreground text-xs tabular-nums">
                        {notes.length}/2.000
                      </span>
                    </div>
                    <Textarea
                      id="ptype-detail-notes"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      maxLength={2000}
                      rows={7}
                      disabled={isSaving || isMutating}
                      aria-invalid={Boolean(fieldErrors.notes?.length)}
                      placeholder="Informações administrativas sobre este tipo..."
                    />
                    {fieldErrors.notes?.[0] && (
                      <p className="text-destructive text-sm">
                        {fieldErrors.notes[0]}
                      </p>
                    )}
                  </div>
                </section>

                <section className="space-y-3 rounded-xl border p-4">
                  <div>
                    <h3 className="font-semibold">Status do cadastro</h3>
                    <p className="text-muted-foreground mt-1 text-xs">
                      A API não informa o status atual neste detalhe. Escolha o
                      estado desejado e confirme a operação.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setConfirmation("activate")}
                      disabled={isSaving || isMutating}
                    >
                      <CheckCircle2 className="size-4" />
                      Marcar como ativo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setConfirmation("deactivate")}
                      disabled={isSaving || isMutating}
                    >
                      <CircleOff className="size-4" />
                      Marcar como inativo
                    </Button>
                  </div>
                </section>

                <section className="border-destructive/40 bg-destructive/5 space-y-3 rounded-xl border p-4">
                  <div>
                    <h3 className="text-destructive font-semibold">
                      Zona de exclusão
                    </h3>
                    <p className="text-muted-foreground mt-1 text-xs">
                      A API verificará vínculos existentes e informará quando a
                      exclusão não for permitida.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setConfirmation("delete")}
                    disabled={isSaving || isMutating}
                  >
                    <Trash2 className="size-4" />
                    Excluir tipo de produto
                  </Button>
                </section>
              </div>

              <SheetFooter className="shrink-0 border-t p-4 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={closeSheet}>
                  Fechar
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSaving ||
                    isMutating ||
                    name.trim() === "" ||
                    notes.length > 2000
                  }
                >
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  {isSaving ? "Salvando..." : "Salvar alterações"}
                </Button>
              </SheetFooter>
            </form>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              {detail?.state === "not-found" ? (
                <PackageSearch className="text-muted-foreground mb-4 size-14" />
              ) : detail?.state === "error" ? (
                <TriangleAlert className="text-destructive mb-4 size-14" />
              ) : (
                <FileText className="text-muted-foreground mb-4 size-14" />
              )}
              <h2 className="font-semibold">
                {detail?.state === "not-found"
                  ? "Tipo de produto não encontrado"
                  : "Não foi possível carregar o detalhe"}
              </h2>
              <p className="text-muted-foreground mt-2 max-w-sm text-sm">
                {detail?.state === "not-found"
                  ? "O registro não existe ou não está acessível para a organização atual."
                  : "Feche o painel e tente abrir o registro novamente."}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-5"
                onClick={closeSheet}
              >
                Fechar painel
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={Boolean(confirmation)}
        onOpenChange={(open) => {
          if (!open && !isMutating) setConfirmation(undefined);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              {confirmation === "delete" ? (
                <Trash2 className="text-destructive" />
              ) : (
                <TriangleAlert />
              )}
            </AlertDialogMedia>
            <AlertDialogTitle>{confirmationCopy.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationCopy.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMutating}>
              Cancelar
            </AlertDialogCancel>
            <Button
              type="button"
              variant={confirmation === "delete" ? "destructive" : "default"}
              onClick={executeConfirmation}
              disabled={isMutating}
            >
              {isMutating && <Loader2 className="size-4 animate-spin" />}
              {confirmationCopy.action}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
