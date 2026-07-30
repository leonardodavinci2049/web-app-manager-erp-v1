"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CarrierFormValues } from "./types/carrier-dashboard-types";

interface CarrierFormFieldsProps {
  values: CarrierFormValues;
  errors: Record<string, string[] | undefined>;
  disabled: boolean;
  idPrefix: string;
  notesAreWriteOnly?: boolean;
  onChange: <Key extends keyof CarrierFormValues>(
    field: Key,
    value: CarrierFormValues[Key],
  ) => void;
}

function FieldError({
  errors,
  field,
}: {
  errors: Record<string, string[] | undefined>;
  field: string;
}) {
  const message = errors[field]?.[0];
  return message ? <p className="text-destructive text-sm">{message}</p> : null;
}

export function CarrierFormFields({
  values,
  errors,
  disabled,
  idPrefix,
  notesAreWriteOnly = false,
  onChange,
}: CarrierFormFieldsProps) {
  const id = (field: string) => `${idPrefix}-${field}`;

  return (
    <div className="space-y-7">
      <section className="space-y-4">
        <div>
          <h3 className="font-semibold">Identificação</h3>
          <p className="text-muted-foreground text-xs">
            Dados principais usados para reconhecer a transportadora.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={id("name")}>
              Nome
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            </Label>
            <Input
              id={id("name")}
              value={values.name}
              onChange={(event) => onChange("name", event.target.value)}
              maxLength={300}
              disabled={disabled}
              aria-invalid={Boolean(errors.name?.length)}
              placeholder="Ex.: Transportes Acme"
            />
            <FieldError errors={errors} field="name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor={id("type-person")}>Tipo de pessoa</Label>
            <select
              id={id("type-person")}
              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              value={values.typePersonId}
              onChange={(event) =>
                onChange("typePersonId", Number(event.target.value))
              }
              disabled={disabled}
            >
              <option value={0}>Não informado</option>
              <option value={1}>Pessoa física</option>
              <option value={2}>Pessoa jurídica</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={id("responsible-name")}>Responsável</Label>
            <Input
              id={id("responsible-name")}
              value={values.responsibleName}
              onChange={(event) =>
                onChange("responsibleName", event.target.value)
              }
              maxLength={300}
              disabled={disabled}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-semibold">Documentos e empresa</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={id("company-name")}>Razão social</Label>
            <Input
              id={id("company-name")}
              value={values.companyName}
              onChange={(event) => onChange("companyName", event.target.value)}
              maxLength={300}
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={id("cpf")}>CPF</Label>
            <Input
              id={id("cpf")}
              value={values.cpf}
              onChange={(event) => onChange("cpf", event.target.value)}
              maxLength={100}
              disabled={disabled}
              inputMode="numeric"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={id("cnpj")}>CNPJ</Label>
            <Input
              id={id("cnpj")}
              value={values.cnpj}
              onChange={(event) => onChange("cnpj", event.target.value)}
              maxLength={100}
              disabled={disabled}
              inputMode="numeric"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-semibold">Contatos e presença digital</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={id("phone")}>Telefone</Label>
            <Input
              id={id("phone")}
              value={values.phone}
              onChange={(event) => onChange("phone", event.target.value)}
              maxLength={100}
              disabled={disabled}
              inputMode="tel"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={id("whatsapp")}>WhatsApp</Label>
            <Input
              id={id("whatsapp")}
              value={values.whatsapp}
              onChange={(event) => onChange("whatsapp", event.target.value)}
              maxLength={100}
              disabled={disabled}
              inputMode="tel"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={id("email")}>E-mail</Label>
            <Input
              id={id("email")}
              type="email"
              value={values.email}
              onChange={(event) => onChange("email", event.target.value)}
              maxLength={100}
              disabled={disabled}
              aria-invalid={Boolean(errors.email?.length)}
            />
            <FieldError errors={errors} field="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor={id("website")}>Site</Label>
            <Input
              id={id("website")}
              value={values.website}
              onChange={(event) => onChange("website", event.target.value)}
              maxLength={300}
              disabled={disabled}
              placeholder="https://..."
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-semibold">Imagem e observações</h3>
        <div className="space-y-2">
          <Label htmlFor={id("image-path")}>Caminho da imagem</Label>
          <Input
            id={id("image-path")}
            value={values.imagePath}
            onChange={(event) => onChange("imagePath", event.target.value)}
            maxLength={300}
            disabled={disabled}
            placeholder="https://... ou /images/..."
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor={id("notes")}>Observações</Label>
            <span className="text-muted-foreground text-xs tabular-nums">
              {values.notes.length}/2.000
            </span>
          </div>
          <Textarea
            id={id("notes")}
            value={values.notes}
            onChange={(event) => onChange("notes", event.target.value)}
            maxLength={2000}
            rows={5}
            disabled={disabled}
            placeholder="Informações administrativas..."
          />
          {notesAreWriteOnly && (
            <p className="text-muted-foreground text-xs">
              A API não retorna as observações atuais. Preencha somente se
              desejar substituí-las; deixe vazio para preservá-las.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
