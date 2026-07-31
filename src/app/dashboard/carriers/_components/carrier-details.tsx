"use client";

import { ArrowLeft, CalendarDays, Loader2, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import {
  deleteCarrierAction,
  updateCarrierAction,
} from "@/app/dashboard/carriers/_actions/carrier-actions";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UICarrier } from "@/services/api-main/carrier";
import { CarrierFormFields } from "./carrier-form-fields";
import { CarrierImage } from "./carrier-image";
import type { CarrierFormValues } from "./types/carrier-dashboard-types";

interface CarrierDetailsProps {
  carrier: UICarrier;
  returnTo: string;
}

function formatDate(value?: string): string {
  if (!value) return "Não informada";
  const timestamp = Date.parse(value.replace(" ", "T"));
  if (Number.isNaN(timestamp)) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
  }).format(timestamp);
}

function toFormValues(carrier: UICarrier): CarrierFormValues {
  return {
    typePersonId: carrier.typePersonId || 0,
    name: carrier.name,
    phone: carrier.phone ?? "",
    whatsapp: carrier.whatsapp ?? "",
    email: carrier.email ?? "",
    website: carrier.website ?? "",
    cnpj: carrier.cnpj ?? "",
    companyName: carrier.companyName ?? "",
    responsibleName: carrier.responsibleName ?? "",
    cpf: carrier.cpf ?? "",
    imagePath: carrier.imagePath ?? "",
    notes: "",
  };
}

export function CarrierDetails({ carrier, returnTo }: CarrierDetailsProps) {
  const router = useRouter();
  const [values, setValues] = useState<CarrierFormValues>(() =>
    toFormValues(carrier),
  );
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const setField = <Key extends keyof CarrierFormValues>(
    field: Key,
    value: CarrierFormValues[Key],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setErrors({});
    try {
      const result = await updateCarrierAction({
        carrierId: carrier.id,
        ...values,
      });
      if (!result.success) {
        setErrors(result.fieldErrors ?? {});
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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteCarrierAction(carrier.id);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setIsDeleteOpen(false);
      router.replace(returnTo);
    } catch {
      toast.error("Não foi possível concluir a comunicação com o servidor.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <CarrierImage
              key={carrier.imagePath}
              name={carrier.name}
              imagePath={carrier.imagePath}
              viewMode="list"
            />
            <div className="min-w-0">
              <h1 className="break-words text-2xl font-bold">{carrier.name}</h1>
              <p className="text-muted-foreground text-sm tabular-nums">
                Transportadora ID {carrier.id}
              </p>
              <p className="text-muted-foreground text-sm">
                {carrier.typePerson || "Tipo de pessoa não informado"}
              </p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href={returnTo}>
              <ArrowLeft className="size-4" />
              Voltar às transportadoras
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle>Dados da transportadora</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <CarrierFormFields
                  values={values}
                  errors={errors}
                  disabled={isSaving || isDeleting}
                  idPrefix="carrier-detail"
                  notesAreWriteOnly
                  onChange={setField}
                />
                <Button
                  type="submit"
                  disabled={
                    isSaving ||
                    isDeleting ||
                    values.name.trim() === "" ||
                    values.notes.length > 2000
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
                <CardTitle className="text-base">Cadastro</CardTitle>
              </CardHeader>
              <CardContent className="flex items-start gap-2">
                <CalendarDays className="text-muted-foreground mt-0.5 size-4" />
                <div>
                  <p className="text-muted-foreground text-xs">
                    Data de cadastro
                  </p>
                  <p className="text-sm font-medium">
                    {formatDate(carrier.createdAt)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-base">Status do cadastro</CardTitle>
                <Badge variant="secondary">Pendente de API</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-xs">
                  A listagem aceita filtro de status, mas o endpoint de
                  atualização não permite ativar ou inativar transportadoras.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled
                >
                  Alterar status — Pendente de API
                </Button>
              </CardContent>
            </Card>

            <Card className="border-destructive/40 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive text-base">
                  Zona de exclusão
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-xs">
                  A API validará eventuais vínculos antes de aceitar a exclusão.
                </p>
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full"
                  disabled={isSaving || isDeleting}
                  onClick={() => setIsDeleteOpen(true)}
                >
                  <Trash2 className="size-4" />
                  Excluir transportadora
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir “{carrier.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A API verificará se o cadastro
              pode ser removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
            >
              {isDeleting && <Loader2 className="size-4 animate-spin" />}
              {isDeleting ? "Excluindo..." : "Excluir definitivamente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
