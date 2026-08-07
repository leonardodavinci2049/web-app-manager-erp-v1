"use client";

import { Loader2, Save, ShieldAlert, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState } from "react";
import { toast } from "sonner";
import {
  updateCustomerAddressAction,
  updateCustomerBusinessAction,
  updateCustomerInternetAction,
  updateCustomerNotesAction,
  updateCustomerPersonalAction,
  updateCustomerRestrictionAction,
} from "@/app/dashboard/customer/_actions/customer-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { UICustomerDetail } from "@/services/api-main/customer-general";
import type { CustomerActionResult } from "./types/customer-dashboard-types";

type Section = "notes" | "person" | "address" | "internet" | "restriction";

interface DetailValues {
  imagePath: string;
  notes: string;
  cpf: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  cnpj: string;
  companyName: string;
  stateRegistration: string;
  municipalRegistration: string;
  responsibleName: string;
  mainActivity: string;
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
  addressSummary: ReactNode;
  customer: UICustomerDetail;
  deletionContent: ReactNode;
  imageContent: ReactNode;
}

function toValues(customer: UICustomerDetail): DetailValues {
  return {
    imagePath: customer.imagePath ?? "",
    notes: customer.notes,
    cpf: customer.cpf,
    firstName: customer.firstName ?? "",
    lastName: customer.lastName ?? "",
    birthDate: customer.birthDate?.slice(0, 10) ?? "",
    cnpj: customer.cnpj,
    companyName: customer.companyName,
    stateRegistration: customer.stateRegistration ?? "",
    municipalRegistration: customer.municipalRegistration ?? "",
    responsibleName: customer.responsibleName ?? "",
    mainActivity: customer.mainActivity ?? "",
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
  addressSummary,
  customer,
  deletionContent,
  imageContent,
}: CustomerDetailFormsProps) {
  const router = useRouter();
  const [values, setValues] = useState<DetailValues>(() => toValues(customer));
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );
  const [savingSection, setSavingSection] = useState<Section | null>(null);
  const isBusiness = Boolean(
    customer.cnpj ||
      customer.companyName ||
      customer.accountType.toLocaleUpperCase("pt-BR").includes("JUR"),
  );

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
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid h-auto w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
        <TabsTrigger value="notes">Anotações</TabsTrigger>
        <TabsTrigger value="person">
          {isBusiness ? "Empresa" : "Pessoa"}
        </TabsTrigger>
        <TabsTrigger value="internet">Internet</TabsTrigger>
        <TabsTrigger value="address">Endereço</TabsTrigger>
        <TabsTrigger value="restriction">Restrição</TabsTrigger>
        <TabsTrigger value="image">Imagem</TabsTrigger>
        <TabsTrigger value="deletion">Exclusão</TabsTrigger>
      </TabsList>

      <TabsContent value="notes">
        <form
          className="space-y-4 rounded-lg border p-4"
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
              rows={7}
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
          <SectionButton
            saving={savingSection === "notes"}
            label="Salvar anotações"
          />
        </form>
      </TabsContent>

      <TabsContent value="person">
        {isBusiness ? (
          <form
            className="space-y-4 rounded-lg border p-4"
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              runAction(
                "person",
                updateCustomerBusinessAction({
                  customerId: customer.id,
                  cnpj: values.cnpj,
                  companyName: values.companyName,
                  stateRegistration: values.stateRegistration,
                  municipalRegistration: values.municipalRegistration,
                  responsibleName: values.responsibleName,
                  mainActivity: values.mainActivity,
                }),
              );
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {field("cnpj", "CNPJ", { maxLength: 100, required: true })}
              {field("companyName", "Razão social", {
                maxLength: 300,
                required: true,
              })}
              {field("stateRegistration", "Inscrição estadual", {
                maxLength: 100,
              })}
              {field("municipalRegistration", "Inscrição municipal", {
                maxLength: 100,
              })}
              {field("responsibleName", "Responsável", {
                maxLength: 300,
              })}
              {field("mainActivity", "Atividade principal", {
                maxLength: 300,
              })}
            </div>
            <SectionButton
              saving={savingSection === "person"}
              label="Salvar dados empresariais"
            />
          </form>
        ) : (
          <form
            className="space-y-4 rounded-lg border p-4"
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              runAction(
                "person",
                updateCustomerPersonalAction({
                  customerId: customer.id,
                  cpf: values.cpf,
                  firstName: values.firstName,
                  lastName: values.lastName,
                  imagePath: values.imagePath,
                  birthDate: values.birthDate,
                }),
              );
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {field("cpf", "CPF", { maxLength: 100 })}
              {field("birthDate", "Data de nascimento", { type: "date" })}
              {field("firstName", "Primeiro nome", { maxLength: 300 })}
              {field("lastName", "Sobrenome", { maxLength: 100 })}
            </div>
            <SectionButton
              saving={savingSection === "person"}
              label="Salvar dados pessoais"
            />
          </form>
        )}
      </TabsContent>

      <TabsContent value="internet">
        <form
          className="space-y-4 rounded-lg border p-4"
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
          <div className="grid gap-4 sm:grid-cols-2">
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

      <TabsContent value="restriction">
        <div className="space-y-3 rounded-lg border p-4">
          <div>
            <h3 className="font-semibold">Restrição comercial</h3>
            <p className="text-muted-foreground text-xs">
              O detalhe não informa o estado atual. Escolha explicitamente o
              estado desejado; somente a flag de restrição será enviada.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="destructive"
              disabled={savingSection !== null}
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
            >
              {savingSection === "restriction" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ShieldAlert className="size-4" />
              )}
              Marcar com restrição
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={savingSection !== null}
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
            >
              <ShieldCheck className="size-4" />
              Remover restrição
            </Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="address" className="space-y-4">
        <form
          className="space-y-4 rounded-lg border p-4"
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
          <div className="grid gap-4 sm:grid-cols-2">
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
        {addressSummary}
      </TabsContent>

      <TabsContent value="image">{imageContent}</TabsContent>

      <TabsContent value="deletion">{deletionContent}</TabsContent>
    </Tabs>
  );
}
