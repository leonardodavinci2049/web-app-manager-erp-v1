"use client";

import {
  CircleDollarSign,
  FileText,
  Landmark,
  NotebookPen,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { createEntryAction } from "@/app/dashboard/entry/_actions/entry-actions";
import {
  searchEntryFilterCarriers,
  searchEntryFilterSuppliers,
} from "@/app/dashboard/entry/_actions/entry-filter-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SheetFooter } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  ENTRY_CREATE_CATEGORY,
  ENTRY_CREATE_MODEL_DEFAULT,
  ENTRY_CREATE_MODEL_OPTIONS,
  type EntryCreateModel,
  type EntryCreateOptionDto,
} from "../types/entry-dashboard-types";
import { EntryCreateCombobox } from "./entry-create-combobox";

interface EntryCreateFormProps {
  supplierOptions: EntryCreateOptionDto[];
  carrierOptions: EntryCreateOptionDto[];
  onCancel: () => void;
  onCreated: (entryId: number) => void;
  onDirtyChange: (isDirty: boolean) => void;
}

const SELECT_TRIGGER_CLASS =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

const DECIMAL_FIELDS = [
  { name: "totalInvoiceValue", label: "Valor total da nota" },
  { name: "totalProductValue", label: "Valor total dos produtos" },
  { name: "freightValue", label: "Valor do frete" },
  { name: "freightRate", label: "Taxa do frete" },
  { name: "exchangeRate", label: "Câmbio" },
] as const;

const TAX_FIELDS = [
  { name: "icmsValue", label: "ICMS" },
  { name: "ipiValue", label: "IPI" },
  { name: "pisValue", label: "PIS" },
  { name: "cofinsValue", label: "COFINS" },
  { name: "ibsValue", label: "IBS" },
  { name: "cbsValue", label: "CBS" },
] as const;

type DecimalFieldName = (typeof DECIMAL_FIELDS)[number]["name"];
type TaxFieldName = (typeof TAX_FIELDS)[number]["name"];
type NumberFieldName = DecimalFieldName | TaxFieldName;

function parseDecimalInput(raw: string): number {
  const normalized = raw.trim().replace(/\./g, "").replace(",", ".");
  if (normalized === "") return 0;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

/**
 * Formulario de criacao de entrada (Client). Valida no cliente para feedback
 * imediato e novamente na Server Action. Campos monetarios aceitam virgula
 * decimal (padrao pt-BR).
 */
export function EntryCreateForm({
  supplierOptions,
  carrierOptions,
  onCancel,
  onCreated,
  onDirtyChange,
}: EntryCreateFormProps) {
  const [supplierId, setSupplierId] = useState(0);
  const [carrierId, setCarrierId] = useState(0);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [model, setModel] = useState<EntryCreateModel>(
    ENTRY_CREATE_MODEL_DEFAULT,
  );
  const [decimalValues, setDecimalValues] = useState<
    Record<DecimalFieldName, string>
  >({
    totalInvoiceValue: "",
    totalProductValue: "",
    freightValue: "",
    freightRate: "",
    exchangeRate: "",
  });
  const [taxValues, setTaxValues] = useState<Record<TaxFieldName, string>>({
    icmsValue: "",
    ipiValue: "",
    pisValue: "",
    cofinsValue: "",
    ibsValue: "",
    cbsValue: "",
  });
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (supplierId === 0 || carrierId === 0) {
      const message = "Selecione fornecedor e transportadora.";
      setError(message);
      toast.error(message);
      return;
    }
    if (!invoiceNumber.trim()) {
      const message = "Informe o número da nota.";
      setError(message);
      toast.error(message);
      return;
    }

    const parsedDecimals: Partial<Record<NumberFieldName, number>> = {};
    for (const field of DECIMAL_FIELDS) {
      const parsed = parseDecimalInput(decimalValues[field.name]);
      if (Number.isNaN(parsed)) {
        const message = `Informe um valor válido para ${field.label.toLowerCase()}.`;
        setError(message);
        toast.error(message);
        return;
      }
      parsedDecimals[field.name] = parsed;
    }
    for (const field of TAX_FIELDS) {
      const parsed = parseDecimalInput(taxValues[field.name]);
      if (Number.isNaN(parsed)) {
        const message = `Informe um valor válido para ${field.label}.`;
        setError(message);
        toast.error(message);
        return;
      }
      parsedDecimals[field.name] = parsed;
    }

    setIsSubmitting(true);
    try {
      const result = await createEntryAction({
        supplierId,
        carrierId,
        categoryId: ENTRY_CREATE_CATEGORY.id,
        invoiceNumber: invoiceNumber.trim(),
        model,
        totalInvoiceValue: parsedDecimals.totalInvoiceValue ?? 0,
        totalProductValue: parsedDecimals.totalProductValue ?? 0,
        freightValue: parsedDecimals.freightValue ?? 0,
        freightRate: parsedDecimals.freightRate ?? 0,
        exchangeRate: parsedDecimals.exchangeRate ?? 0,
        icmsValue: parsedDecimals.icmsValue ?? 0,
        ipiValue: parsedDecimals.ipiValue ?? 0,
        pisValue: parsedDecimals.pisValue ?? 0,
        cofinsValue: parsedDecimals.cofinsValue ?? 0,
        ibsValue: parsedDecimals.ibsValue ?? 0,
        cbsValue: parsedDecimals.cbsValue ?? 0,
        notes: notes.trim(),
      });

      if (!result.success || !result.entryId) {
        const fieldError = Object.values(result.fieldErrors ?? {})[0]?.[0];
        if (fieldError) setError(fieldError);
        toast.error(
          result.message ??
            "Não foi possível criar a entrada. Tente novamente.",
        );
        return;
      }

      onDirtyChange(false);
      toast.success(result.message ?? "Entrada criada com sucesso!");
      onCreated(result.entryId);
    } catch {
      toast.error(
        "Não foi possível concluir a comunicação com o servidor. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-h-0 flex-1 flex-col"
      onChangeCapture={() => onDirtyChange(true)}
    >
      <fieldset
        disabled={isSubmitting}
        className="m-0 min-h-0 flex-1 overflow-y-auto border-0 bg-muted/20 p-0"
      >
        <div className="grid content-start gap-6 p-4 sm:p-6 md:grid-cols-2 md:gap-6">
          {error && (
            <p
              className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-3 py-2 text-sm md:col-span-2"
              role="alert"
            >
              {error}
            </p>
          )}

          <section
            aria-labelledby="entry-main-data-title"
            className="overflow-hidden rounded-xl border bg-card shadow-xs md:col-span-2"
          >
            <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3 sm:px-5">
              <span className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-md">
                <FileText className="size-4" aria-hidden="true" />
              </span>
              <div>
                <h3
                  id="entry-main-data-title"
                  className="text-sm font-semibold"
                >
                  Dados da entrada
                </h3>
                <p className="text-muted-foreground text-xs">
                  Vínculos e identificação da nota
                </p>
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-5 sm:p-6">
              <div className="space-y-2 sm:col-span-2">
                <EntryCreateCombobox
                  id="entry-supplier"
                  label="Fornecedor"
                  required
                  value={supplierId}
                  options={supplierOptions}
                  placeholder="Selecione o fornecedor"
                  searchPlaceholder="Pesquisar fornecedor..."
                  emptyMessage="Nenhum fornecedor encontrado."
                  onValueChange={(value) => {
                    if (value !== supplierId) onDirtyChange(true);
                    setSupplierId(value);
                    setError(undefined);
                  }}
                  onSearch={searchEntryFilterSuppliers}
                />
              </div>

              <div className="space-y-2">
                <EntryCreateCombobox
                  id="entry-carrier"
                  label="Transportadora"
                  required
                  value={carrierId}
                  options={carrierOptions}
                  placeholder="Selecione a transportadora"
                  searchPlaceholder="Pesquisar transportadora..."
                  emptyMessage="Nenhuma transportadora encontrada."
                  onValueChange={(value) => {
                    if (value !== carrierId) onDirtyChange(true);
                    setCarrierId(value);
                    setError(undefined);
                  }}
                  onSearch={searchEntryFilterCarriers}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="entry-category" className="text-xs font-medium">
                  Categoria
                </Label>
                <Input
                  id="entry-category"
                  value={ENTRY_CREATE_CATEGORY.label}
                  readOnly
                  aria-readonly="true"
                  className="bg-muted/50 cursor-default text-muted-foreground"
                />
                <p className="text-muted-foreground text-xs">
                  Única categoria disponível.
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="entry-invoice-number"
                  className="text-xs font-medium"
                >
                  Número da nota
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                  <span className="sr-only"> obrigatório</span>
                </Label>
                <Input
                  id="entry-invoice-number"
                  name="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => {
                    setInvoiceNumber(e.target.value);
                    if (error) setError(undefined);
                  }}
                  placeholder="Ex.: 7685"
                  maxLength={100}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="entry-model" className="text-xs font-medium">
                  Modelo
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                  <span className="sr-only"> obrigatório</span>
                </Label>
                <Select
                  value={model}
                  onValueChange={(value: EntryCreateModel) => {
                    setModel(value);
                    if (error) setError(undefined);
                  }}
                >
                  <SelectTrigger
                    id="entry-model"
                    className={SELECT_TRIGGER_CLASS}
                  >
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {ENTRY_CREATE_MODEL_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="entry-values-title"
            className="overflow-hidden rounded-xl border bg-card shadow-xs"
          >
            <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3 sm:px-5">
              <span className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-md">
                <CircleDollarSign className="size-4" aria-hidden="true" />
              </span>
              <div>
                <h3 id="entry-values-title" className="text-sm font-semibold">
                  Valores
                </h3>
                <p className="text-muted-foreground text-xs">
                  Totais, frete e câmbio
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 p-5 sm:p-6">
              {DECIMAL_FIELDS.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label
                    htmlFor={`entry-${field.name}`}
                    className="text-xs font-medium"
                  >
                    {field.label}
                  </Label>
                  <Input
                    id={`entry-${field.name}`}
                    name={field.name}
                    inputMode="decimal"
                    value={decimalValues[field.name]}
                    onChange={(e) => {
                      setDecimalValues((current) => ({
                        ...current,
                        [field.name]: e.target.value,
                      }));
                      if (error) setError(undefined);
                    }}
                    placeholder="0,00"
                    autoComplete="off"
                  />
                </div>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="entry-taxes-title"
            className="overflow-hidden rounded-xl border bg-card shadow-xs"
          >
            <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3 sm:px-5">
              <span className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-md">
                <Landmark className="size-4" aria-hidden="true" />
              </span>
              <div>
                <h3 id="entry-taxes-title" className="text-sm font-semibold">
                  Tributos
                </h3>
                <p className="text-muted-foreground text-xs">
                  Impostos incidentes na nota
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3 sm:p-6">
              {TAX_FIELDS.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label
                    htmlFor={`entry-${field.name}`}
                    className="text-xs font-medium"
                  >
                    {field.label}
                  </Label>
                  <Input
                    id={`entry-${field.name}`}
                    name={field.name}
                    inputMode="decimal"
                    value={taxValues[field.name]}
                    onChange={(e) => {
                      setTaxValues((current) => ({
                        ...current,
                        [field.name]: e.target.value,
                      }));
                      if (error) setError(undefined);
                    }}
                    placeholder="0,00"
                    autoComplete="off"
                  />
                </div>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="entry-notes-title"
            className="overflow-hidden rounded-xl border bg-card shadow-xs md:col-span-2"
          >
            <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3 sm:px-5">
              <span className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-md">
                <NotebookPen className="size-4" aria-hidden="true" />
              </span>
              <div>
                <h3 id="entry-notes-title" className="text-sm font-semibold">
                  Anotações
                </h3>
                <p className="text-muted-foreground text-xs">
                  Observações gerais da nota
                </p>
              </div>
            </div>
            <div className="space-y-2 p-5 sm:p-6">
              <Label htmlFor="entry-notes" className="sr-only">
                Anotações
              </Label>
              <Textarea
                id="entry-notes"
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione observações relevantes sobre a entrada"
                maxLength={2000}
                rows={3}
                className="min-h-20 resize-none"
              />
            </div>
          </section>
        </div>
      </fieldset>

      <SheetFooter className="supports-backdrop-filter:bg-background/80 shrink-0 border-t bg-background/95 p-4 backdrop-blur sm:flex-row sm:justify-end sm:px-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-full sm:w-auto"
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="w-full sm:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Criando entrada..." : "Criar entrada"}
        </Button>
      </SheetFooter>
    </form>
  );
}
