"use client";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Globe,
  Loader2,
  MapPin,
  Phone,
  Save,
  Trash2,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UICarrier } from "@/services/api-main/carrier";
import { CarrierFormFields } from "./carrier-form-fields";
import { CarrierImage } from "./carrier-image";
import type { CarrierFormValues } from "./types/carrier-dashboard-types";

interface CarrierDetailsProps {
  carrier: UICarrier;
  returnTo: string;
  imageGallery: ReactNode;
  imageContent: ReactNode;
}

function formatDate(value?: string): string {
  if (!value) return "Não informada";
  const timestamp = Date.parse(value.replace(" ", "T"));
  if (Number.isNaN(timestamp)) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
  }).format(timestamp);
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
    notes: carrier.notes ?? "",
  };
}

export function CarrierDetails({
  carrier,
  returnTo,
  imageGallery,
  imageContent,
}: CarrierDetailsProps) {
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
        <div className="grid gap-6 lg:grid-cols-[minmax(280px,500px)_minmax(0,1fr)]">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm lg:col-span-2 lg:justify-self-start"
          >
            <Link href={returnTo}>
              <ArrowLeft className="size-4" />
              Voltar às transportadoras
            </Link>
          </Button>

          <aside className="hidden lg:block lg:row-span-3 lg:row-start-2 lg:self-start lg:sticky lg:top-6">
            {imageGallery}
          </aside>

          <div className="flex min-w-0 items-start gap-3">
            <CarrierImage
              key={carrier.imagePath}
              name={carrier.name}
              imagePath={carrier.imagePath}
              viewMode="list"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="break-words text-2xl font-bold">
                  {carrier.name}
                </h1>
                <Badge variant={carrier.inactive ? "destructive" : "secondary"}>
                  {carrier.inactive ? "Inativo" : "Ativo"}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm tabular-nums">
                Transportadora ID {carrier.id}
              </p>
              <p className="text-muted-foreground text-sm">
                {carrier.typePerson || "Tipo de pessoa não informado"}
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-5" />
                Conta e identificação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <DetailField label="ID da transportadora" value={carrier.id} />
                <DetailField
                  label="Tipo de pessoa"
                  value={carrier.typePerson}
                />
                <DetailField
                  label="Fretador"
                  value={carrier.freightForwarder ? "Sim" : "Não"}
                />
                <DetailField
                  label="Data de cadastro"
                  value={formatDate(carrier.createdAt)}
                />
                <DetailField
                  label="Última compra"
                  value={formatDate(carrier.lastPurchaseDate)}
                />
                <DetailField
                  label="Status"
                  value={carrier.inactive ? "Inativo" : "Ativo"}
                />
              </dl>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="size-5" />
                    Contato
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailField label="Telefone" value={carrier.phone} />
                    <DetailField label="WhatsApp" value={carrier.whatsapp} />
                    <DetailField label="Contato" value={carrier.contact} />
                    <DetailField label="E-mail" value={carrier.email} />
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="size-5" />
                    Presença digital
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailField label="Website" value={carrier.website} />
                    <DetailField label="Facebook" value={carrier.facebook} />
                    <DetailField label="Twitter" value={carrier.twitter} />
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="size-5" />
                    Endereço
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailField label="CEP" value={carrier.zipCode} />
                    <DetailField label="Logradouro" value={carrier.address} />
                    <DetailField label="Número" value={carrier.addressNumber} />
                    <DetailField
                      label="Complemento"
                      value={carrier.complement}
                    />
                    <DetailField label="Bairro" value={carrier.neighborhood} />
                    <DetailField label="Cidade" value={carrier.city} />
                    <DetailField label="UF" value={carrier.state} />
                    <DetailField label="Região" value={carrier.countryRegion} />
                    <DetailField label="País" value={carrier.country} />
                    <DetailField
                      label="Código do município"
                      value={carrier.cityCode}
                    />
                    <DetailField
                      label="Código da UF"
                      value={carrier.stateCode}
                    />
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="size-5" />
                    Pessoa jurídica
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailField
                      label="Razão social"
                      value={carrier.companyName}
                    />
                    <DetailField label="CNPJ" value={carrier.cnpj} />
                    <DetailField
                      label="Data do CNPJ"
                      value={formatDate(carrier.cnpjDate)}
                    />
                    <DetailField
                      label="Inscrição estadual"
                      value={carrier.stateRegistration}
                    />
                    <DetailField
                      label="Inscrição municipal"
                      value={carrier.municipalRegistration}
                    />
                    <DetailField
                      label="Nome fantasia"
                      value={carrier.tradeName}
                    />
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserRound className="size-5" />
                    Pessoa física
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailField label="CPF" value={carrier.cpf} />
                    <DetailField label="RG" value={carrier.rg} />
                    <DetailField
                      label="Responsável"
                      value={carrier.responsibleName}
                    />
                    <DetailField
                      label="Cargo do responsável"
                      value={carrier.responsibleRole}
                    />
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Editar dados da transportadora</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <CarrierFormFields
                      values={values}
                      errors={errors}
                      disabled={isSaving || isDeleting}
                      idPrefix="carrier-detail"
                      notesAreWriteOnly={false}
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
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CalendarDays className="size-4" />
                    Cadastro
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <DetailField
                    label="Data de cadastro"
                    value={formatDate(carrier.createdAt)}
                  />
                  <DetailField
                    label="Última compra"
                    value={formatDate(carrier.lastPurchaseDate)}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="text-base">
                    Status do cadastro
                  </CardTitle>
                  <Badge
                    variant={carrier.inactive ? "destructive" : "secondary"}
                  >
                    {carrier.inactive ? "Inativo" : "Ativo"}
                  </Badge>
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
            </div>
          </div>
        </div>

        <Tabs defaultValue="deletion" className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-2">
            <TabsTrigger value="image">Imagem</TabsTrigger>
            <TabsTrigger value="deletion">Exclusão</TabsTrigger>
          </TabsList>

          <TabsContent value="image" className="space-y-3 sm:space-y-4">
            <div className="mx-auto w-full max-w-[500px] lg:hidden">
              {imageGallery}
            </div>
            {imageContent}
          </TabsContent>

          <TabsContent value="deletion">
            <Card className="border-destructive/40 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive text-base">
                  Zona de exclusão
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  A API validará eventuais vínculos antes de aceitar a exclusão.
                </p>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isSaving || isDeleting}
                  onClick={() => setIsDeleteOpen(true)}
                >
                  <Trash2 className="size-4" />
                  Excluir transportadora
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
