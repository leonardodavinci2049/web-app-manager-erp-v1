"use client";

import {
  BadgeCheck,
  Clock3,
  Copy,
  Gift,
  Loader2,
  MailCheck,
  MailX,
  Power,
  PowerOff,
  Save,
  ShieldAlert,
  ShieldCheck,
  Truck,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState } from "react";
import { toast } from "sonner";
import {
  updateCustomerAddressAction,
  updateCustomerApprovalAction,
  updateCustomerEmailMarketingAction,
  updateCustomerFreeShippingAction,
  updateCustomerInactiveAction,
  updateCustomerInternetAction,
  updateCustomerNotesAction,
  updateCustomerRestrictionAction,
} from "@/app/dashboard/customer/_actions/customer-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { UICustomerDetail } from "@/services/api-main/customer-general";
import type { CustomerActionResult } from "../../_components/types/customer-dashboard-types";

type Section =
  | "notes"
  | "address"
  | "internet"
  | "approval"
  | "restriction"
  | "registrationStatus"
  | "shippingType"
  | "emailMarketing";

const TAB_TRIGGER_CLASS_NAME =
  "h-8 min-w-max flex-none snap-start px-3 text-xs sm:h-9 sm:text-sm lg:min-w-0 lg:px-2";

interface DetailValues {
  notes: string;
  zipCode: string;
  address: string;
  addressNumber: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  cityCode: string;
  stateCode: string;
  website: string;
  facebook: string;
  twitter: string;
  linkedin: string;
  instagram: string;
  tiktok: string;
  telegram: string;
}

interface CustomerDetailFormsProps {
  customer: UICustomerDetail;
  deletionContent: ReactNode;
  imageContent: ReactNode;
  mobileImageGallery: ReactNode;
  miscellaneousContent: ReactNode;
  productsContent: ReactNode;
}

function buildAddressSummary(values: DetailValues, customerName: string) {
  const normalize = (value: string) => value.trim();
  const normalizedCustomerName = normalize(customerName);
  const address = normalize(values.address);
  const addressNumber = normalize(values.addressNumber);
  const complement = normalize(values.complement);
  const neighborhood = normalize(values.neighborhood);
  const city = normalize(values.city);
  const state = normalize(values.state);
  const zipCode = normalize(values.zipCode);
  const cityCode = normalize(values.cityCode);
  const stateCode = normalize(values.stateCode);

  const primaryLine = [
    [address, addressNumber ? `nº ${addressNumber}` : ""]
      .filter(Boolean)
      .join(", "),
    complement ? `Complemento: ${complement}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const localityLine = [
    neighborhood ? `Bairro: ${neighborhood}` : "",
    [city, state].filter(Boolean).join(" / "),
  ]
    .filter(Boolean)
    .join(" · ");
  const referenceLine = [
    zipCode ? `CEP: ${zipCode}` : "",
    cityCode ? `Código do município: ${cityCode}` : "",
    stateCode ? `Código da UF: ${stateCode}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const addressLines = [primaryLine, localityLine, referenceLine].filter(
    Boolean,
  );
  const titleLine = normalizedCustomerName
    ? `Endereço de ${normalizedCustomerName}.`
    : "Endereço do cliente.";

  return {
    clipboardText: [titleLine, ...addressLines].join("\n"),
    hasAddressData: addressLines.length > 0,
    localityLine,
    primaryLine,
    referenceLine,
    titleLine,
  };
}

function toValues(customer: UICustomerDetail): DetailValues {
  return {
    notes: customer.notes,
    zipCode: customer.zipCode,
    address: customer.address,
    addressNumber: customer.addressNumber,
    complement: customer.complement,
    neighborhood: customer.neighborhood,
    city: customer.city,
    state: customer.state,
    cityCode: customer.cityCode ? String(customer.cityCode) : "",
    stateCode: customer.stateCode ? String(customer.stateCode) : "",
    website: customer.website ?? "",
    facebook: customer.facebook ?? "",
    twitter: customer.twitter ?? "",
    linkedin: customer.linkedin ?? "",
    instagram: customer.instagram ?? "",
    tiktok: customer.tiktok ?? "",
    telegram: customer.telegram ?? "",
  };
}

function SectionButton({ saving, label }: { saving: boolean; label: string }) {
  return (
    <Button type="submit" disabled={saving}>
      {saving ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Save className="size-4" />
      )}
      {saving ? "Salvando..." : label}
    </Button>
  );
}

export function CustomerDetailForms({
  customer,
  deletionContent,
  imageContent,
  mobileImageGallery,
  miscellaneousContent,
  productsContent,
}: CustomerDetailFormsProps) {
  const router = useRouter();
  const [values, setValues] = useState<DetailValues>(() => toValues(customer));
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );
  const [savingSection, setSavingSection] = useState<Section | null>(null);
  const addressSummary = buildAddressSummary(values, customer.name);

  const setField = <Key extends keyof DetailValues>(
    field: Key,
    value: DetailValues[Key],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const runAction = async (
    section: Section,
    action: Promise<CustomerActionResult>,
  ) => {
    setSavingSection(section);
    setErrors({});
    try {
      const result = await action;
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
      setSavingSection(null);
    }
  };

  const copyNotesToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(values.notes);
      toast.success("Anotações copiadas para a área de transferência.");
    } catch {
      toast.error("Não foi possível copiar as anotações.");
    }
  };

  const copyAddressToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(addressSummary.clipboardText);
      toast.success("Endereço copiado para a área de transferência.");
    } catch {
      toast.error("Não foi possível copiar o endereço.");
    }
  };

  const field = (
    name: keyof DetailValues,
    label: string,
    options: {
      type?: string;
      maxLength?: number;
      required?: boolean;
    } = {},
  ) => (
    <div className="space-y-1">
      <Label htmlFor={`customer-detail-${name}`}>
        {label}
        {options.required ? " *" : ""}
      </Label>
      <Input
        id={`customer-detail-${name}`}
        type={options.type}
        value={values[name]}
        maxLength={options.maxLength}
        required={options.required}
        disabled={savingSection !== null}
        aria-invalid={Boolean(errors[name]?.[0])}
        onChange={(event) => setField(name, event.target.value)}
      />
      {errors[name]?.[0] && (
        <p className="text-destructive text-xs">{errors[name]?.[0]}</p>
      )}
    </div>
  );

  return (
    <Tabs defaultValue="notes" className="w-full gap-3 sm:gap-4">
      <TabsList
        className="h-auto w-full snap-x justify-start gap-1 overflow-x-auto p-1 lg:grid lg:grid-cols-8 lg:overflow-visible"
        aria-label="Seções do cadastro do cliente"
      >
        <TabsTrigger value="notes" className={TAB_TRIGGER_CLASS_NAME}>
          Anotações
        </TabsTrigger>
        <TabsTrigger value="address" className={TAB_TRIGGER_CLASS_NAME}>
          Endereço
        </TabsTrigger>
        <TabsTrigger value="status" className={TAB_TRIGGER_CLASS_NAME}>
          Status
        </TabsTrigger>

        <TabsTrigger value="image" className={TAB_TRIGGER_CLASS_NAME}>
          Imagem
        </TabsTrigger>

        <TabsTrigger value="products" className={TAB_TRIGGER_CLASS_NAME}>
          Compras
        </TabsTrigger>

        <TabsTrigger value="internet" className={TAB_TRIGGER_CLASS_NAME}>
          Internet
        </TabsTrigger>

        <TabsTrigger value="miscellaneous" className={TAB_TRIGGER_CLASS_NAME}>
          Diversos
        </TabsTrigger>

        <TabsTrigger value="deletion" className={TAB_TRIGGER_CLASS_NAME}>
          Exclusão
        </TabsTrigger>
      </TabsList>

      <TabsContent value="notes">
        <form
          className="space-y-3 rounded-lg border p-3 sm:space-y-4 sm:p-4"
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            runAction(
              "notes",
              updateCustomerNotesAction({
                customerId: customer.id,
                notes: values.notes,
              }),
            );
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="customer-detail-notes">Anotações</Label>
            <Textarea
              id="customer-detail-notes"
              value={values.notes}
              maxLength={2000}
              rows={5}
              disabled={savingSection !== null}
              aria-invalid={Boolean(errors.notes?.[0])}
              onChange={(event) => setField("notes", event.target.value)}
            />
            {errors.notes?.[0] && (
              <p className="text-destructive text-xs">{errors.notes[0]}</p>
            )}
            <p className="text-muted-foreground text-right text-xs">
              {values.notes.length}/2000
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SectionButton
              saving={savingSection === "notes"}
              label="Salvar anotações"
            />
            <Button
              type="button"
              variant="outline"
              disabled={values.notes.length === 0}
              onClick={copyNotesToClipboard}
            >
              <Copy className="size-4" />
              Copiar anotações
            </Button>
          </div>
        </form>
      </TabsContent>

      <TabsContent value="internet">
        <form
          className="space-y-3 rounded-lg border p-3 sm:space-y-4 sm:p-4"
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            runAction(
              "internet",
              updateCustomerInternetAction({
                customerId: customer.id,
                website: values.website,
                facebook: values.facebook,
                twitter: values.twitter,
                linkedin: values.linkedin,
                instagram: values.instagram,
                tiktok: values.tiktok,
                telegram: values.telegram,
              }),
            );
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="sm:col-span-2">
              {field("website", "Website", { maxLength: 500 })}
            </div>
            {field("facebook", "Facebook", { maxLength: 500 })}
            {field("twitter", "X/Twitter", { maxLength: 500 })}
            {field("linkedin", "LinkedIn", { maxLength: 500 })}
            {field("instagram", "Instagram", { maxLength: 500 })}
            {field("tiktok", "TikTok", { maxLength: 500 })}
            {field("telegram", "Telegram", { maxLength: 500 })}
          </div>
          <SectionButton
            saving={savingSection === "internet"}
            label="Salvar presença digital"
          />
        </form>
      </TabsContent>

      <TabsContent value="address" className="space-y-3 sm:space-y-4">
        <form
          className="space-y-3 rounded-lg border p-3 sm:space-y-4 sm:p-4"
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            runAction(
              "address",
              updateCustomerAddressAction({
                customerId: customer.id,
                zipCode: values.zipCode,
                address: values.address,
                addressNumber: values.addressNumber,
                complement: values.complement,
                neighborhood: values.neighborhood,
                city: values.city,
                state: values.state,
                cityCode: values.cityCode,
                stateCode: values.stateCode,
              }),
            );
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {field("zipCode", "CEP", { maxLength: 100 })}
            {field("state", "UF", { maxLength: 100 })}
            <div className="sm:col-span-2">
              {field("address", "Endereço", { maxLength: 300 })}
            </div>
            {field("addressNumber", "Número", { maxLength: 100 })}
            {field("complement", "Complemento", { maxLength: 100 })}
            {field("neighborhood", "Bairro", { maxLength: 300 })}
            {field("city", "Cidade", { maxLength: 300 })}
            {field("cityCode", "Código do município", { maxLength: 100 })}
            {field("stateCode", "Código da UF", { maxLength: 100 })}
          </div>
          <SectionButton
            saving={savingSection === "address"}
            label="Salvar endereço"
          />
        </form>
        <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRound className="size-4" />
              Localização resumida
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 sm:px-6">
            <div className="space-y-1">
              <p className="text-sm font-medium">{addressSummary.titleLine}</p>
              <p className="text-sm">
                {addressSummary.primaryLine || "Endereço não informado"}
              </p>
              <p className="text-muted-foreground text-xs">
                {addressSummary.localityLine || "Localidade não informada"}
              </p>
              {addressSummary.referenceLine && (
                <p className="text-muted-foreground text-xs">
                  {addressSummary.referenceLine}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={!addressSummary.hasAddressData}
              onClick={copyAddressToClipboard}
            >
              <Copy className="size-4" />
              Copiar endereço
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="image" className="space-y-3 sm:space-y-4">
        <div className="mx-auto w-full max-w-[500px] lg:hidden">
          {mobileImageGallery}
        </div>
        {imageContent}
      </TabsContent>

      <TabsContent value="products">{productsContent}</TabsContent>

      <TabsContent value="miscellaneous">{miscellaneousContent}</TabsContent>

      <TabsContent
        value="status"
        className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2"
      >
        <div className="space-y-3 rounded-lg border p-3 sm:p-4">
          <div>
            <h3 className="font-semibold">Aprovação do cliente</h3>
          </div>
          <fieldset
            className="grid grid-cols-1 gap-2 sm:grid-cols-2"
            aria-label="Situação da aprovação do cliente"
          >
            <Button
              type="button"
              variant={customer.approved ? "default" : "outline"}
              aria-pressed={customer.approved}
              disabled={savingSection !== null || customer.approved}
              onClick={() => {
                if (!window.confirm("Aprovar este cliente?")) return;
                runAction(
                  "approval",
                  updateCustomerApprovalAction({
                    customerId: customer.id,
                    approved: true,
                  }),
                );
              }}
              className="justify-between"
            >
              <span className="flex items-center gap-2">
                {savingSection === "approval" && !customer.approved ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <BadgeCheck className="size-4" />
                )}
                APROVADO
              </span>
              {customer.approved && <Badge variant="secondary">Atual</Badge>}
            </Button>
            <Button
              type="button"
              variant={customer.approved ? "outline" : "default"}
              aria-pressed={!customer.approved}
              disabled={savingSection !== null || !customer.approved}
              onClick={() => {
                if (!window.confirm("Marcar este cliente como pendente?"))
                  return;
                runAction(
                  "approval",
                  updateCustomerApprovalAction({
                    customerId: customer.id,
                    approved: false,
                  }),
                );
              }}
              className="justify-between"
            >
              <span className="flex items-center gap-2">
                {savingSection === "approval" && customer.approved ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Clock3 className="size-4" />
                )}
                PENDENTE
              </span>
              {!customer.approved && <Badge variant="secondary">Atual</Badge>}
            </Button>
          </fieldset>
        </div>

        <div className="space-y-3 rounded-lg border p-3 sm:p-4">
          <div>
            <h3 className="font-semibold">Restrição comercial</h3>
          </div>
          <fieldset
            className="grid grid-cols-1 gap-2 sm:grid-cols-2"
            aria-label="Situação da restrição comercial"
          >
            <Button
              type="button"
              variant={customer.restricted ? "outline" : "default"}
              aria-pressed={!customer.restricted}
              disabled={savingSection !== null || !customer.restricted}
              onClick={() => {
                if (!window.confirm("Remover a restrição deste cliente?"))
                  return;
                runAction(
                  "restriction",
                  updateCustomerRestrictionAction({
                    customerId: customer.id,
                    restricted: false,
                  }),
                );
              }}
              className="justify-between"
            >
              <span className="flex items-center gap-2">
                {savingSection === "restriction" && customer.restricted ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ShieldCheck className="size-4" />
                )}
                Sem restrição
              </span>
              {!customer.restricted && <Badge variant="secondary">Atual</Badge>}
            </Button>
            <Button
              type="button"
              variant={customer.restricted ? "destructive" : "outline"}
              aria-pressed={customer.restricted}
              disabled={savingSection !== null || customer.restricted}
              onClick={() => {
                if (!window.confirm("Marcar este cliente com restrição?"))
                  return;
                runAction(
                  "restriction",
                  updateCustomerRestrictionAction({
                    customerId: customer.id,
                    restricted: true,
                  }),
                );
              }}
              className="justify-between"
            >
              <span className="flex items-center gap-2">
                {savingSection === "restriction" && !customer.restricted ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ShieldAlert className="size-4" />
                )}
                Com restrição
              </span>
              {customer.restricted && <Badge variant="secondary">Atual</Badge>}
            </Button>
          </fieldset>
        </div>

        <div className="space-y-3 rounded-lg border p-3 sm:p-4">
          <div>
            <h3 className="font-semibold">Tipo de frete</h3>
          </div>
          <fieldset
            className="grid grid-cols-1 gap-2 sm:grid-cols-2"
            aria-label="Tipo de frete do cliente"
          >
            <Button
              type="button"
              variant={customer.freeShipping ? "outline" : "default"}
              aria-pressed={!customer.freeShipping}
              disabled={savingSection !== null || !customer.freeShipping}
              onClick={() => {
                if (
                  !window.confirm(
                    "Alterar o tipo de frete deste cliente para Frete Padrão?",
                  )
                )
                  return;
                runAction(
                  "shippingType",
                  updateCustomerFreeShippingAction({
                    customerId: customer.id,
                    enabled: false,
                  }),
                );
              }}
              className="justify-between"
            >
              <span className="flex items-center gap-2">
                {savingSection === "shippingType" && customer.freeShipping ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Truck className="size-4" />
                )}
                Frete Padrão
              </span>
              {!customer.freeShipping && (
                <Badge variant="secondary">Atual</Badge>
              )}
            </Button>
            <Button
              type="button"
              variant={customer.freeShipping ? "default" : "outline"}
              aria-pressed={customer.freeShipping}
              disabled={savingSection !== null || customer.freeShipping}
              onClick={() => {
                if (!window.confirm("Ativar o Frete Grátis para este cliente?"))
                  return;
                runAction(
                  "shippingType",
                  updateCustomerFreeShippingAction({
                    customerId: customer.id,
                    enabled: true,
                  }),
                );
              }}
              className="justify-between"
            >
              <span className="flex items-center gap-2">
                {savingSection === "shippingType" && !customer.freeShipping ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Gift className="size-4" />
                )}
                Frete Grátis
              </span>
              {customer.freeShipping && (
                <Badge variant="secondary">Atual</Badge>
              )}
            </Button>
          </fieldset>
        </div>

        <div className="space-y-3 rounded-lg border p-3 sm:p-4">
          <div>
            <h3 className="font-semibold">Status do cadastro</h3>
          </div>
          <fieldset
            className="grid grid-cols-1 gap-2 sm:grid-cols-2"
            aria-label="Status do cadastro"
          >
            <Button
              type="button"
              variant={customer.inactive ? "outline" : "default"}
              aria-pressed={!customer.inactive}
              disabled={savingSection !== null || !customer.inactive}
              onClick={() => {
                if (!window.confirm("Ativar este cliente?")) return;
                runAction(
                  "registrationStatus",
                  updateCustomerInactiveAction({
                    customerId: customer.id,
                    inactive: false,
                  }),
                );
              }}
              className="justify-between"
            >
              <span className="flex items-center gap-2">
                {savingSection === "registrationStatus" && customer.inactive ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Power className="size-4" />
                )}
                Ativo
              </span>
              {!customer.inactive && <Badge variant="secondary">Atual</Badge>}
            </Button>
            <Button
              type="button"
              variant={customer.inactive ? "destructive" : "outline"}
              aria-pressed={customer.inactive}
              disabled={savingSection !== null || customer.inactive}
              onClick={() => {
                if (!window.confirm("Inativar este cliente?")) return;
                runAction(
                  "registrationStatus",
                  updateCustomerInactiveAction({
                    customerId: customer.id,
                    inactive: true,
                  }),
                );
              }}
              className="justify-between"
            >
              <span className="flex items-center gap-2">
                {savingSection === "registrationStatus" &&
                !customer.inactive ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <PowerOff className="size-4" />
                )}
                Inativo
              </span>
              {customer.inactive && <Badge variant="secondary">Atual</Badge>}
            </Button>
          </fieldset>
        </div>

        <div className="space-y-3 rounded-lg border p-3 sm:p-4">
          <div>
            <h3 className="font-semibold">Publicidade por e-mail</h3>
          </div>
          <fieldset
            className="grid grid-cols-1 gap-2 sm:grid-cols-2"
            aria-label="Envio de publicidade por e-mail"
          >
            <Button
              type="button"
              variant={customer.emailMarketingEnabled ? "outline" : "default"}
              aria-pressed={!customer.emailMarketingEnabled}
              disabled={
                savingSection !== null || !customer.emailMarketingEnabled
              }
              onClick={() => {
                if (
                  !window.confirm(
                    "Desativar o envio de publicidade por e-mail para este cliente?",
                  )
                )
                  return;
                runAction(
                  "emailMarketing",
                  updateCustomerEmailMarketingAction({
                    customerId: customer.id,
                    enabled: false,
                  }),
                );
              }}
              className="justify-between"
            >
              <span className="flex items-center gap-2">
                {savingSection === "emailMarketing" &&
                customer.emailMarketingEnabled ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <MailX className="size-4" />
                )}
                Não enviar
              </span>
              {!customer.emailMarketingEnabled && (
                <Badge variant="secondary">Atual</Badge>
              )}
            </Button>
            <Button
              type="button"
              variant={customer.emailMarketingEnabled ? "default" : "outline"}
              aria-pressed={customer.emailMarketingEnabled}
              disabled={
                savingSection !== null || customer.emailMarketingEnabled
              }
              onClick={() => {
                if (
                  !window.confirm(
                    "Ativar o envio de publicidade por e-mail para este cliente?",
                  )
                )
                  return;
                runAction(
                  "emailMarketing",
                  updateCustomerEmailMarketingAction({
                    customerId: customer.id,
                    enabled: true,
                  }),
                );
              }}
              className="justify-between"
            >
              <span className="flex items-center gap-2">
                {savingSection === "emailMarketing" &&
                !customer.emailMarketingEnabled ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <MailCheck className="size-4" />
                )}
                Enviar
              </span>
              {customer.emailMarketingEnabled && (
                <Badge variant="secondary">Atual</Badge>
              )}
            </Button>
          </fieldset>
        </div>
      </TabsContent>

      <TabsContent value="deletion">{deletionContent}</TabsContent>
    </Tabs>
  );
}
