"use client";

import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { createEntryAction } from "@/app/dashboard/entry/_actions/entry-actions";
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
import type { EntryCreateOptionDto } from "../types/entry-dashboard-types";

interface EntryCreateFormProps {
  supplierOptions: EntryCreateOptionDto[];
  carrierOptions: EntryCreateOptionDto[];
  categoryOptions: EntryCreateOptionDto[];
  onCancel: () => void;
  onCreated: (entryId: number) => void;
  onDirtyChange: (isDirty: boolean) => void;
}

const SELECT_TRIGGER_CLASS =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

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
  categoryOptions,
  onCancel,
  onCreated,
  onDirtyChange,
}: EntryCreateFormProps) {
  const [supplierId, setSupplierId] = useState<string>("");
  const [carrierId, setCarrierId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [model, setModel] = useState("");
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

    if (!supplierId || !carrierId || !categoryId) {
      const message = "Selecione fornecedor, transportadora e categoria.";
      setError(message);
      toast.error(message);
      return;
    }
    if (!invoiceNumber.trim() || !model.trim()) {
      const message = "Informe o número da nota e o modelo da entrada.";
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
        supplierId: Number(supplierId),
        carrierId: Number(carrierId),
        categoryId: Number(categoryId),
        invoiceNumber: invoiceNumber.trim(),
        model: model.trim(),
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
        className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4 sm:p-6"
      >
        {error && (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Vínculos</h3>
          <div className="space-y-2">
            <Label htmlFor="entry-supplier" className="font-semibold">
              Fornecedor
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
              <span className="sr-only"> obrigatório</span>
            </Label>
            <Select
              value={supplierId}
              onValueChange={(value) => {
                setSupplierId(value);
                setError(undefined);
              }}
            >
              <SelectTrigger
                id="entry-supplier"
                className={SELECT_TRIGGER_CLASS}
              >
                <SelectValue placeholder="Selecione o fornecedor" />
              </SelectTrigger>
              <SelectContent>
                {supplierOptions.map((option) => (
                  <SelectItem key={option.id} value={String(option.id)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {supplierOptions.length === 0 && (
              <p className="text-muted-foreground text-xs">
                Nenhum fornecedor disponível no momento.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="entry-carrier" className="font-semibold">
              Transportadora
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
              <span className="sr-only"> obrigatório</span>
            </Label>
            <Select
              value={carrierId}
              onValueChange={(value) => {
                setCarrierId(value);
                setError(undefined);
              }}
            >
              <SelectTrigger
                id="entry-carrier"
                className={SELECT_TRIGGER_CLASS}
              >
                <SelectValue placeholder="Selecione a transportadora" />
              </SelectTrigger>
              <SelectContent>
                {carrierOptions.map((option) => (
                  <SelectItem key={option.id} value={String(option.id)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {carrierOptions.length === 0 && (
              <p className="text-muted-foreground text-xs">
                Nenhuma transportadora disponível no momento.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="entry-category" className="font-semibold">
              Categoria
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
              <span className="sr-only"> obrigatório</span>
            </Label>
            <Select
              value={categoryId}
              onValueChange={(value) => {
                setCategoryId(value);
                setError(undefined);
              }}
            >
              <SelectTrigger
                id="entry-category"
                className={SELECT_TRIGGER_CLASS}
              >
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.id} value={String(option.id)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {categoryOptions.length === 0 && (
              <p className="text-muted-foreground text-xs">
                Nenhuma categoria disponível no momento.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Nota</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="entry-invoice-number" className="font-semibold">
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
              <Label htmlFor="entry-model" className="font-semibold">
                Modelo
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
                <span className="sr-only"> obrigatório</span>
              </Label>
              <Input
                id="entry-model"
                name="model"
                value={model}
                onChange={(e) => {
                  setModel(e.target.value);
                  if (error) setError(undefined);
                }}
                placeholder="Ex.: IMPORTADO"
                maxLength={100}
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Valores</h3>
          <div className="grid grid-cols-2 gap-3">
            {DECIMAL_FIELDS.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label
                  htmlFor={`entry-${field.name}`}
                  className="font-semibold"
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
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Tributos</h3>
          <div className="grid grid-cols-2 gap-3">
            {TAX_FIELDS.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label
                  htmlFor={`entry-${field.name}`}
                  className="font-semibold"
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="entry-notes" className="font-semibold">
            Anotações
          </Label>
          <Textarea
            id="entry-notes"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observações da entrada"
            maxLength={2000}
            rows={4}
          />
          <p className="text-muted-foreground text-xs">
            As flags de estoque, inventário físico e etiqueta são definidas
            internamente pela API.
          </p>
        </div>
      </fieldset>

      <SheetFooter className="supports-[backdrop-filter]:bg-background/80 shrink-0 border-t bg-background/95 p-4 backdrop-blur sm:flex-row sm:justify-end">
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
