"use client";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleOff,
  Globe,
  Loader2,
  MapPin,
  Phone,
  Save,
  Trash2,
  TriangleAlert,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
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
type PersonTypeId = 1 | 2;

interface SupplierDetailsProps {
  supplier: UISupplier;
  returnTo: string;
  imageGallery: ReactNode;
  imageContent: ReactNode;
}

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

function resolvePersonTypeId(supplier: UISupplier): PersonTypeId | undefined {
  if (supplier.typePersonId === 1 || supplier.typePersonId === 2) {
    return supplier.typePersonId;
  }

  const legacyType = supplier.legalPhysicalType?.trim().toUpperCase();
  if (legacyType === "F") return 1;
  if (legacyType === "J") return 2;
  return undefined;
}

function resolvePersonTypeLabel(supplier: UISupplier): string {
  if (supplier.typePerson) return supplier.typePerson;
  const personTypeId = resolvePersonTypeId(supplier);
  if (personTypeId === 1) return "Pessoa Física";
  if (personTypeId === 2) return "Pessoa Jurídica";
  return "Tipo de pessoa não informado";
}

export function SupplierDetails({
  supplier,
  returnTo,
  imageGallery,
  imageContent,
}: SupplierDetailsProps) {
  const router = useRouter();
  const [name, setName] = useState(supplier.name);
  const [notes, setNotes] = useState(supplier.notes ?? "");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<"name" | "notes", string[]>>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation>();
  const [isMutating, setIsMutating] = useState(false);
  const currentPersonTypeId = resolvePersonTypeId(supplier);
  const [selectedPersonTypeId, setSelectedPersonTypeId] = useState<
    PersonTypeId | undefined
  >(() => currentPersonTypeId);

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
              Voltar aos fornecedores
            </Link>
          </Button>

          <aside className="hidden lg:sticky lg:top-6 lg:row-span-2 lg:row-start-2 lg:block lg:self-start">
            {imageGallery}
          </aside>

          <div className="flex min-w-0 items-start gap-3">
            <SupplierImage
              name={supplier.name}
              imagePath={supplier.imagePath}
              viewMode="list"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="break-words text-2xl font-bold">
                  {supplier.name}
                </h1>
                <Badge
                  variant={supplier.inactive ? "destructive" : "secondary"}
                >
                  {supplier.inactive ? "Inativo" : "Ativo"}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm tabular-nums">
                Fornecedor ID {supplier.id}
              </p>
              <p className="text-muted-foreground text-sm">
                {resolvePersonTypeLabel(supplier)}
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
                    <DetailField label="Nome" value={supplier.name} />
                  </div>
                  <DetailField label="Telefone" value={supplier.phone} />
                  <DetailField label="WhatsApp" value={supplier.whatsapp} />
                  <DetailField label="Contato" value={supplier.contact} />
                  <DetailField label="Setor" value={supplier.sector} />
                  <div className="sm:col-span-2">
                    <DetailField label="E-mail" value={supplier.email} />
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
                    <DetailField label="CPF" value={supplier.cpf} />
                    <DetailField label="RG" value={supplier.rg} />
                    <DetailField
                      label="Data de nascimento"
                      value={formatDate(supplier.birthDate)}
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
                      value={supplier.legalName}
                    />
                    <DetailField label="CNPJ" value={supplier.cnpj} />
                    <DetailField
                      label="Inscrição estadual"
                      value={supplier.stateRegistration}
                    />
                    <DetailField
                      label="Inscrição municipal"
                      value={supplier.municipalRegistration}
                    />
                    <DetailField
                      label="Nome fantasia"
                      value={supplier.tradeName}
                    />
                    <DetailField
                      label="Data do CNPJ"
                      value={formatDate(supplier.cnpjDate)}
                    />
                  </dl>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-0.5 sm:space-y-1">
          <h2 className="text-base font-semibold sm:text-lg">
            Seções do fornecedor
          </h2>
          <p className="text-muted-foreground hidden text-sm sm:block">
            Consulte os dados complementares e acesse as ações do fornecedor.
          </p>
        </div>

        <Tabs defaultValue="notes" className="w-full gap-3 sm:gap-4">
          <TabsList
            className="h-auto w-full snap-x justify-start gap-1 overflow-x-auto p-1 lg:grid lg:grid-cols-8 lg:overflow-visible"
            aria-label="Seções do detalhe do fornecedor"
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
                  <DetailField label="Anotações" value={supplier.notes} />
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
                  <DetailField label="CEP" value={supplier.zipCode} />
                  <DetailField label="Endereço" value={supplier.address} />
                  <DetailField label="Número" value={supplier.addressNumber} />
                  <DetailField
                    label="Complemento"
                    value={supplier.complement}
                  />
                  <DetailField label="Bairro" value={supplier.neighborhood} />
                  <DetailField label="Cidade" value={supplier.city} />
                  <DetailField label="UF" value={supplier.state} />
                  <DetailField label="País" value={supplier.country} />
                  <DetailField
                    label="Código do município"
                    value={supplier.cityCode}
                  />
                  <DetailField
                    label="Código da UF"
                    value={supplier.stateCode}
                  />
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
                  <DetailField label="Website" value={supplier.website} />
                  <DetailField label="Facebook" value={supplier.facebook} />
                  <DetailField label="Twitter" value={supplier.twitter} />
                </dl>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="status">
            <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
              <CardHeader className="flex-row items-center justify-between px-4 sm:px-6">
                <CardTitle className="text-base">Status</CardTitle>
                <Badge
                  variant={supplier.inactive ? "destructive" : "secondary"}
                >
                  {supplier.inactive ? "Inativo" : "Ativo"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 px-4 sm:px-6">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <DetailField
                    label="Fretador"
                    value={
                      supplier.freightForwarder === undefined
                        ? undefined
                        : supplier.freightForwarder
                          ? "Sim"
                          : "Não"
                    }
                  />
                  <DetailField
                    label="Status do cadastro"
                    value={supplier.inactive ? "Inativo" : "Ativo"}
                  />
                </dl>
                <Separator />
                <p className="text-muted-foreground text-xs">
                  Confirme a operação para definir explicitamente o status deste
                  fornecedor.
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSaving || isMutating}
                    onClick={() => setConfirmation("activate")}
                  >
                    <CheckCircle2 className="size-4" />
                    Marcar como ativo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSaving || isMutating}
                    onClick={() => setConfirmation("deactivate")}
                  >
                    <CircleOff className="size-4" />
                    Marcar como inativo
                  </Button>
                </div>
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
                    value={formatDate(supplier.createdAt)}
                  />
                  <DetailField
                    label="Data de atualização"
                    value={formatDate(supplier.updatedAt)}
                  />
                </dl>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="editing">
            <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base">
                  Editar dados do fornecedor
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
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
