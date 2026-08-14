"use client";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  Globe,
  Loader2,
  MapPin,
  Phone,
  Save,
  Trash2,
  UserRound,
  Users,
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

type PersonTypeId = 1 | 2;

const TAB_TRIGGER_CLASS_NAME =
  "h-8 min-w-max flex-none snap-start px-3 text-xs sm:h-9 sm:text-sm lg:min-w-0 lg:px-2";

const PERSON_TYPES = [
  { id: 1, label: "Pessoa Física" },
  { id: 2, label: "Pessoa Jurídica" },
] as const;

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
      <dd className="mt-1 whitespace-pre-wrap break-words text-sm font-medium">
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

function resolvePersonTypeLabel(carrier: UICarrier): string {
  if (carrier.typePerson) return carrier.typePerson;
  if (carrier.typePersonId === 1) return "Pessoa Física";
  if (carrier.typePersonId === 2) return "Pessoa Jurídica";
  return "Tipo de pessoa não informado";
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
  const currentPersonTypeId =
    carrier.typePersonId === 1 || carrier.typePersonId === 2
      ? carrier.typePersonId
      : undefined;
  const [selectedPersonTypeId, setSelectedPersonTypeId] = useState<
    PersonTypeId | undefined
  >(() => currentPersonTypeId);

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
      <div className="space-y-4 sm:space-y-6">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(280px,500px)_minmax(0,1fr)]">
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

          <aside className="hidden lg:sticky lg:top-6 lg:row-span-2 lg:row-start-2 lg:block lg:self-start">
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
                {resolvePersonTypeLabel(carrier)}
              </p>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Phone className="size-4" />
                  Geral
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <DetailField label="Nome" value={carrier.name} />
                  </div>
                  <DetailField label="Telefone" value={carrier.phone} />
                  <DetailField label="WhatsApp" value={carrier.whatsapp} />
                  <DetailField label="Contato" value={carrier.contact} />
                  <div className="sm:col-span-2">
                    <DetailField label="E-mail" value={carrier.email} />
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="size-4" />
                  Tipo de pessoa
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {PERSON_TYPES.map((option) => {
                    const selected = option.id === selectedPersonTypeId;
                    const current = option.id === currentPersonTypeId;

                    return (
                      <Button
                        key={option.id}
                        type="button"
                        variant={selected ? "default" : "outline"}
                        aria-pressed={selected}
                        disabled={selected}
                        onClick={() => setSelectedPersonTypeId(option.id)}
                        className="justify-between"
                      >
                        <span className="flex items-center gap-2">
                          {selected && <Check className="size-4" />}
                          {option.label}
                        </span>
                        {current ? (
                          <Badge variant="secondary">Atual</Badge>
                        ) : selected ? (
                          <Badge variant="secondary">Visualizando</Badge>
                        ) : null}
                      </Button>
                    );
                  })}
                </div>
                <p className="text-muted-foreground mt-3 text-xs">
                  Selecione o tipo para visualizar os campos correspondentes. A
                  seleção não altera o cadastro.
                </p>
              </CardContent>
            </Card>

            {selectedPersonTypeId === 1 && (
              <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <UserRound className="size-4" />
                    Pessoa Física
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <DetailField label="CPF" value={carrier.cpf} />
                    <DetailField label="RG" value={carrier.rg} />
                    <DetailField
                      label="Data de nascimento"
                      value={formatDate(carrier.birthDate)}
                    />
                  </dl>
                </CardContent>
              </Card>
            )}

            {selectedPersonTypeId === 2 && (
              <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="size-4" />
                    Pessoa Jurídica
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <DetailField
                      label="Razão social"
                      value={carrier.companyName}
                    />
                    <DetailField label="CNPJ" value={carrier.cnpj} />
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
                    <DetailField
                      label="Data do CNPJ"
                      value={formatDate(carrier.cnpjDate)}
                    />
                  </dl>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-0.5 sm:space-y-1">
          <h2 className="text-base font-semibold sm:text-lg">
            Seções da transportadora
          </h2>
          <p className="text-muted-foreground hidden text-sm sm:block">
            Consulte os dados complementares e acesse as ações da
            transportadora.
          </p>
        </div>

        <Tabs defaultValue="notes" className="w-full gap-3 sm:gap-4">
          <TabsList
            className="h-auto w-full snap-x justify-start gap-1 overflow-x-auto p-1 lg:grid lg:grid-cols-8 lg:overflow-visible"
            aria-label="Seções do detalhe da transportadora"
          >
            <TabsTrigger value="notes" className={TAB_TRIGGER_CLASS_NAME}>
              Anotações
            </TabsTrigger>
            <TabsTrigger value="image" className={TAB_TRIGGER_CLASS_NAME}>
              Imagem
            </TabsTrigger>
            <TabsTrigger value="address" className={TAB_TRIGGER_CLASS_NAME}>
              Endereço
            </TabsTrigger>
            <TabsTrigger value="internet" className={TAB_TRIGGER_CLASS_NAME}>
              Internet
            </TabsTrigger>
            <TabsTrigger value="status" className={TAB_TRIGGER_CLASS_NAME}>
              Status
            </TabsTrigger>
            <TabsTrigger
              value="miscellaneous"
              className={TAB_TRIGGER_CLASS_NAME}
            >
              Diversos
            </TabsTrigger>
            <TabsTrigger value="editing" className={TAB_TRIGGER_CLASS_NAME}>
              Edição
            </TabsTrigger>
            <TabsTrigger value="deletion" className={TAB_TRIGGER_CLASS_NAME}>
              Exclusão
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes">
            <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base">Anotações</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <dl>
                  <DetailField label="Anotações" value={carrier.notes} />
                </dl>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="image" className="space-y-3 sm:space-y-4">
            <div className="mx-auto w-full max-w-[500px] lg:hidden">
              {imageGallery}
            </div>
            {imageContent}
          </TabsContent>

          <TabsContent value="address">
            <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="size-4" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailField label="CEP" value={carrier.zipCode} />
                  <DetailField label="Endereço" value={carrier.address} />
                  <DetailField label="Número" value={carrier.addressNumber} />
                  <DetailField label="Complemento" value={carrier.complement} />
                  <DetailField label="Bairro" value={carrier.neighborhood} />
                  <DetailField label="Cidade" value={carrier.city} />
                  <DetailField label="UF" value={carrier.state} />
                  <DetailField label="País" value={carrier.country} />
                  <DetailField
                    label="Código do município"
                    value={carrier.cityCode}
                  />
                  <DetailField label="Código da UF" value={carrier.stateCode} />
                </dl>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="internet">
            <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe className="size-4" />
                  Internet
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailField label="Website" value={carrier.website} />
                  <DetailField label="Facebook" value={carrier.facebook} />
                  <DetailField label="Twitter" value={carrier.twitter} />
                </dl>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="status">
            <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
              <CardHeader className="flex-row items-center justify-between px-4 sm:px-6">
                <CardTitle className="text-base">Status</CardTitle>
                <Badge variant={carrier.inactive ? "destructive" : "secondary"}>
                  {carrier.inactive ? "Inativo" : "Ativo"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 px-4 sm:px-6">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <DetailField
                    label="Fretador"
                    value={
                      carrier.freightForwarder === undefined
                        ? undefined
                        : carrier.freightForwarder
                          ? "Sim"
                          : "Não"
                    }
                  />
                  <DetailField
                    label="Status do cadastro"
                    value={carrier.inactive ? "Inativo" : "Ativo"}
                  />
                </dl>
                <p className="text-muted-foreground text-xs">
                  A listagem aceita filtro de status, mas o endpoint de
                  atualização não permite ativar ou inativar transportadoras.
                </p>
                <Button type="button" variant="outline" disabled>
                  Alterar status — Pendente de API
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="miscellaneous">
            <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarDays className="size-4" />
                  Diversos
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <DetailField
                    label="Data de cadastro"
                    value={formatDate(carrier.createdAt)}
                  />
                  <DetailField
                    label="Data de atualização"
                    value={formatDate(carrier.updatedAt)}
                  />
                </dl>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="editing">
            <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base">
                  Editar dados da transportadora
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
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
