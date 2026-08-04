"use client";

import {
  ArrowLeft,
  Building2,
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

interface SupplierDetailsProps {
  supplier: UISupplier;
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

function resolvePersonTypeLabel(supplier: UISupplier): string {
  if (supplier.typePerson) return supplier.typePerson;
  if (supplier.legalPhysicalType === "J") return "Pessoa jurídica";
  if (supplier.legalPhysicalType === "F") return "Pessoa física";
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
      <div className="grid gap-6 lg:grid-cols-[minmax(280px,500px)_minmax(0,1fr)]">
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

        <aside className="lg:row-span-4 lg:row-start-2 lg:self-start lg:sticky lg:top-6">
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
              <Badge variant={supplier.inactive ? "destructive" : "secondary"}>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5" />
              Conta e identificação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <DetailField label="ID do fornecedor" value={supplier.id} />
              <DetailField
                label="Tipo de pessoa"
                value={resolvePersonTypeLabel(supplier)}
              />
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
                label="Data de cadastro"
                value={formatDate(supplier.createdAt)}
              />
              <DetailField
                label="Última compra"
                value={formatDate(supplier.lastPurchaseAt)}
              />
              <DetailField
                label="Status"
                value={supplier.inactive ? "Inativo" : "Ativo"}
              />
            </dl>
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
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
                  <DetailField label="Telefone" value={supplier.phone} />
                  <DetailField label="WhatsApp" value={supplier.whatsapp} />
                  <DetailField label="Contato" value={supplier.contact} />
                  <DetailField label="Setor" value={supplier.sector} />
                  <DetailField label="E-mail" value={supplier.email} />
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
                  <DetailField label="Website" value={supplier.website} />
                  <DetailField label="Facebook" value={supplier.facebook} />
                  <DetailField label="Twitter" value={supplier.twitter} />
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
                  <DetailField label="CEP" value={supplier.zipCode} />
                  <DetailField label="Logradouro" value={supplier.address} />
                  <DetailField label="Número" value={supplier.addressNumber} />
                  <DetailField
                    label="Complemento"
                    value={supplier.complement}
                  />
                  <DetailField label="Bairro" value={supplier.neighborhood} />
                  <DetailField label="Cidade" value={supplier.city} />
                  <DetailField label="UF" value={supplier.state} />
                  <DetailField label="Região" value={supplier.countryRegion} />
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
                    value={supplier.legalName}
                  />
                  <DetailField label="CNPJ" value={supplier.cnpj} />
                  <DetailField
                    label="Data do CNPJ"
                    value={formatDate(supplier.cnpjDate)}
                  />
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
                  <DetailField label="CPF" value={supplier.cpf} />
                  <DetailField label="RG" value={supplier.rg} />
                  <DetailField
                    label="Responsável"
                    value={supplier.responsibleName}
                  />
                  <DetailField
                    label="Cargo do responsável"
                    value={supplier.responsibleRole}
                  />
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Editar dados do fornecedor</CardTitle>
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
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cadastro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DetailField
                  label="Data de cadastro"
                  value={formatDate(supplier.createdAt)}
                />
                <DetailField
                  label="Última compra"
                  value={formatDate(supplier.lastPurchaseAt)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-base">Status do cadastro</CardTitle>
                <Badge
                  variant={supplier.inactive ? "destructive" : "secondary"}
                >
                  {supplier.inactive ? "Inativo" : "Ativo"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-xs">
                  Confirme a operação para definir explicitamente o status deste
                  fornecedor.
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
          <TabsList className="grid h-auto w-full grid-cols-2">
            <TabsTrigger value="image">Imagem</TabsTrigger>
            <TabsTrigger value="deletion">Exclusão</TabsTrigger>
          </TabsList>

          <TabsContent value="image">{imageContent}</TabsContent>

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
