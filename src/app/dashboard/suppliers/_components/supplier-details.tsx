"use client";

import {
  ArrowLeft,
  CheckCircle2,
  CircleOff,
  Clock3,
  Loader2,
  Save,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import {
  deleteSupplierAction,
  setSupplierStatusAction,
  updateSupplierAction,
} from "@/app/dashboard/suppliers/_actions/supplier-actions";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { UISupplier } from "@/services/api-main/supplier";
import { SupplierImage } from "./supplier-image";

type Confirmation = "activate" | "deactivate" | "delete";

interface SupplierDetailsProps {
  supplier: UISupplier;
  returnTo: string;
}

function formatDate(value?: string): string {
  if (!value) return "Não informada";
  const timestamp = Date.parse(value.replace(" ", "T"));
  if (Number.isNaN(timestamp)) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(timestamp);
}

export function SupplierDetails({ supplier, returnTo }: SupplierDetailsProps) {
  const router = useRouter();
  const [name, setName] = useState(supplier.name);
  const [notes, setNotes] = useState(supplier.notes ?? "");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<"name" | "notes", string[]>>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation>();
  const [isMutating, setIsMutating] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFieldErrors({});

    try {
      const result = await updateSupplierAction({
        supplierId: supplier.id,
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
    if (!confirmation) return;
    setIsMutating(true);

    try {
      const result =
        confirmation === "delete"
          ? await deleteSupplierAction(supplier.id)
          : await setSupplierStatusAction({
              supplierId: supplier.id,
              inactive: confirmation === "deactivate",
            });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setConfirmation(undefined);
      if (confirmation === "delete") {
        router.replace(returnTo);
      } else {
        router.refresh();
      }
    } catch {
      toast.error("Não foi possível concluir a comunicação com o servidor.");
    } finally {
      setIsMutating(false);
    }
  };

  const confirmationCopy =
    confirmation === "delete"
      ? {
          title: `Excluir “${supplier.name}”?`,
          description:
            "A API validará possíveis vínculos antes da exclusão. Esta ação não pode ser desfeita.",
          action: "Excluir definitivamente",
        }
      : confirmation === "deactivate"
        ? {
            title: "Marcar fornecedor como inativo?",
            description:
              "Confirme que deseja definir explicitamente este fornecedor como inativo.",
            action: "Marcar como inativo",
          }
        : {
            title: "Marcar fornecedor como ativo?",
            description:
              "Confirme que deseja definir explicitamente este fornecedor como ativo.",
            action: "Marcar como ativo",
          };

  return (
    <>
      <div className="space-y-6">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
        >
          <Link href={returnTo}>
            <ArrowLeft className="size-4" />
            Voltar aos fornecedores
          </Link>
        </Button>

        <div className="flex min-w-0 items-start gap-3">
          <SupplierImage name={supplier.name} viewMode="list" />
          <div className="min-w-0">
            <h1 className="break-words text-2xl font-bold">{supplier.name}</h1>
            <p className="text-muted-foreground text-sm tabular-nums">
              Fornecedor ID {supplier.id}
            </p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle>Dados do cadastro</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="supplier-detail-name">
                    Nome
                    <span className="text-destructive" aria-hidden="true">
                      *
                    </span>
                  </Label>
                  <Input
                    id="supplier-detail-name"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setFieldErrors((current) => ({
                        ...current,
                        name: undefined,
                      }));
                    }}
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
                    <Label htmlFor="supplier-detail-notes">Observações</Label>
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {notes.length}/2.000
                    </span>
                  </div>
                  <Textarea
                    id="supplier-detail-notes"
                    value={notes}
                    onChange={(event) => {
                      setNotes(event.target.value);
                      setFieldErrors((current) => ({
                        ...current,
                        notes: undefined,
                      }));
                    }}
                    rows={9}
                    maxLength={2000}
                    disabled={isSaving || isMutating}
                    placeholder="Informações administrativas sobre este fornecedor..."
                    aria-invalid={Boolean(fieldErrors.notes?.length)}
                  />
                  {fieldErrors.notes?.[0] && (
                    <p className="text-destructive text-sm">
                      {fieldErrors.notes[0]}
                    </p>
                  )}
                </div>

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
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Atualização</CardTitle>
              </CardHeader>
              <CardContent className="flex items-start gap-2 text-sm">
                <Clock3 className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs">
                    Última atualização informada pela API
                  </p>
                  <p className="font-medium">
                    {formatDate(supplier.updatedAt)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status do cadastro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-xs">
                  O detalhe da API não informa o status atual. Escolha o estado
                  desejado e confirme.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isSaving || isMutating}
                  onClick={() => setConfirmation("activate")}
                >
                  <CheckCircle2 className="size-4" />
                  Marcar como ativo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isSaving || isMutating}
                  onClick={() => setConfirmation("deactivate")}
                >
                  <CircleOff className="size-4" />
                  Marcar como inativo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="deletion" className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-1">
            <TabsTrigger value="deletion">Exclusão</TabsTrigger>
          </TabsList>

          <TabsContent value="deletion">
            <Card className="border-destructive/40 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive text-base">
                  Zona de exclusão
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  A API validará relações existentes antes de aceitar a
                  exclusão.
                </p>
                <Separator />
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isSaving || isMutating}
                  onClick={() => setConfirmation("delete")}
                >
                  <Trash2 className="size-4" />
                  Excluir fornecedor
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

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
              disabled={isMutating}
              onClick={executeConfirmation}
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
