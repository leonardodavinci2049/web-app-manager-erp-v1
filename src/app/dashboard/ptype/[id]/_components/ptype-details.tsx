"use client";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleOff,
  Loader2,
  Percent,
  Save,
  Tag,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { UIPtype } from "@/services/api-main/ptype";
import {
  deletePtypeAction,
  setPtypeStatusAction,
  updatePtypeAction,
} from "../_actions/ptype-detail-actions";

type Confirmation = "activate" | "deactivate" | "delete";

interface PtypeDetailsProps {
  item: UIPtype;
  returnTo: string;
}

function formatDate(value?: string): string {
  if (!value) return "Não informada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(date);
}

function formatPercent(value?: number): string {
  if (value === undefined) return "Não informada";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(value);
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium">
        {value === undefined || value === "" ? "Não informado" : value}
      </dd>
    </div>
  );
}

export function PtypeDetails({ item, returnTo }: PtypeDetailsProps) {
  const router = useRouter();
  const [name, setName] = useState(item.name);
  const [notes, setNotes] = useState(item.notes ?? "");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation>();
  const [isMutating, setIsMutating] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
    if (!confirmation) return;
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
      setConfirmation(undefined);
      if (confirmation === "delete") {
        router.replace(returnTo);
        return;
      }
      router.refresh();
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
          description: `A API validará se “${item.name}” pode ser excluído. Esta ação não pode ser desfeita.`,
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
      <div className="space-y-6">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
        >
          <Link href={returnTo}>
            <ArrowLeft className="size-4" />
            Voltar aos tipos
          </Link>
        </Button>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="break-words text-2xl font-bold">{item.name}</h1>
            <Badge variant={item.inactive ? "destructive" : "secondary"}>
              {item.inactive ? "Inativo" : "Ativo"}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm tabular-nums">
            Tipo de produto ID {item.id}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="size-5" />
              Detalhes do tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <DetailField
                label="Status"
                value={item.inactive ? "Inativo" : "Ativo"}
              />
              <DetailField
                label="Cadastro de produto"
                value={
                  item.productRegistrationFlag === undefined
                    ? undefined
                    : item.productRegistrationFlag
                      ? "Habilitado"
                      : "Não habilitado"
                }
              />
              <DetailField
                label="Data de cadastro"
                value={formatDate(item.createdAt)}
              />
              <div className="min-w-0">
                <dt className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Percent className="size-3" />
                  Comissão varejo
                </dt>
                <dd className="mt-1 text-sm font-medium tabular-nums">
                  {item.retailCommissionRate === undefined
                    ? "Não informada"
                    : `${formatPercent(item.retailCommissionRate)}%`}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Percent className="size-3" />
                  Comissão atacado
                </dt>
                <dd className="mt-1 text-sm font-medium tabular-nums">
                  {item.wholesaleCommissionRate === undefined
                    ? "Não informada"
                    : `${formatPercent(item.wholesaleCommissionRate)}%`}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]"
        >
          <Card>
            <CardHeader>
              <CardTitle>Dados do cadastro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  rows={8}
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
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarDays className="size-4" />
                  Cadastro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-xs">
                  Data de cadastro
                </p>
                <p className="mt-1 text-sm font-medium">
                  {formatDate(item.createdAt)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-base">Status do cadastro</CardTitle>
                <Badge variant={item.inactive ? "destructive" : "secondary"}>
                  {item.inactive ? "Inativo" : "Ativo"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-xs">
                  Confirme a operação para definir explicitamente o status deste
                  tipo de produto.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setConfirmation("activate")}
                  disabled={isSaving || isMutating}
                >
                  <CheckCircle2 className="size-4" />
                  Marcar como ativo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setConfirmation("deactivate")}
                  disabled={isSaving || isMutating}
                >
                  <CircleOff className="size-4" />
                  Marcar como inativo
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>

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
                  A API verificará vínculos existentes e informará quando a
                  exclusão não for permitida.
                </p>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setConfirmation("delete")}
                  disabled={isSaving || isMutating}
                >
                  <Trash2 className="size-4" />
                  Excluir tipo de produto
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
