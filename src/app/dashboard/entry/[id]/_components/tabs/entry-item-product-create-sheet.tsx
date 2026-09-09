"use client";

import {
  Check,
  ChevronsUpDown,
  CircleDollarSign,
  FolderTree,
  Package,
  PackagePlus,
  Tags,
  TriangleAlert,
  Warehouse,
  X,
} from "lucide-react";
import { type ComponentProps, type FormEvent, useState } from "react";
import { toast } from "sonner";
import { createProductFromForm } from "@/app/actions/action-products";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

export interface EntryItemBrandOption {
  id: number;
  name: string;
  inactive: boolean;
}

export interface EntryItemTypeOption {
  id: number;
  name: string;
}

export interface EntryItemTaxonomyOption {
  id: number;
  parentId: number;
  name: string;
  level: number;
}

export interface EntryItemProductFormOptions {
  brands: EntryItemBrandOption[];
  ptypes: EntryItemTypeOption[];
  taxonomyOptions: EntryItemTaxonomyOption[];
  isTaxonomyAvailable: boolean;
}

interface SelectOption {
  value: string;
  label: string;
}

type ValidationErrors = Partial<
  Record<
    | "name"
    | "wholesalePrice"
    | "retailPrice"
    | "corporatePrice"
    | "stock"
    | "brandId"
    | "typeId",
    string
  >
>;

interface EntryItemProductCreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productFormOptions: EntryItemProductFormOptions;
  onCreated: (productId: number) => void;
}

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR");
}

function readNumber(formData: FormData, key: string): number {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== ""
    ? Number(value)
    : Number.NaN;
}

function validateForm(formData: FormData): ValidationErrors {
  const errors: ValidationErrors = {};
  const name = formData.get("name");
  const normalizedName = typeof name === "string" ? name.trim() : "";
  const wholesalePrice = readNumber(formData, "wholesalePrice");
  const retailPrice = readNumber(formData, "retailPrice");
  const corporatePrice = readNumber(formData, "corporatePrice");
  const stockValue = readNumber(formData, "stock");
  const stock = Number.isNaN(stockValue) ? 0 : stockValue;
  const brandId = readNumber(formData, "brandId");
  const typeId = readNumber(formData, "typeId");

  if (normalizedName.length === 0) {
    errors.name = "Informe o nome do produto.";
  } else if (normalizedName.length < 6) {
    errors.name = "O nome deve ter pelo menos 6 caracteres.";
  }

  const validatePrice = (
    value: number,
    field: "wholesalePrice" | "retailPrice" | "corporatePrice",
    label: string,
  ) => {
    if (!Number.isFinite(value) || value <= 0) {
      errors[field] = `${label} deve ser maior que zero.`;
    } else if (value > 2000000) {
      errors[field] = `${label} não pode exceder R$ 2.000.000,00.`;
    }
  };

  validatePrice(wholesalePrice, "wholesalePrice", "O preço de atacado");
  validatePrice(retailPrice, "retailPrice", "O preço de varejo");
  validatePrice(corporatePrice, "corporatePrice", "O preço corporativo");

  if (
    Number.isFinite(wholesalePrice) &&
    Number.isFinite(retailPrice) &&
    wholesalePrice > retailPrice
  ) {
    errors.wholesalePrice =
      "O preço de atacado não pode ser maior que o preço de varejo.";
  }

  if (!Number.isInteger(stock) || stock < 0 || stock > 1000000) {
    errors.stock = "O estoque deve ser um inteiro entre 0 e 1.000.000.";
  }

  if (!Number.isSafeInteger(brandId) || brandId < 0) {
    errors.brandId = "A marca selecionada é inválida.";
  }

  if (!Number.isSafeInteger(typeId) || typeId < 0) {
    errors.typeId = "O tipo de produto selecionado é inválido.";
  }

  return errors;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-destructive text-sm">
      {message}
    </p>
  );
}

function FormInput(props: ComponentProps<typeof Input>) {
  return <Input {...props} />;
}

function FormTextarea(props: ComponentProps<typeof Textarea>) {
  return <Textarea {...props} />;
}

function CurrencyInput({
  name,
  defaultValue = "0",
  maxDecimals = 4,
  maxValue = 2000000,
  ...props
}: Omit<
  ComponentProps<typeof Input>,
  "defaultValue" | "name" | "onChange" | "type" | "value"
> & {
  name: string;
  defaultValue?: string;
  maxDecimals?: number;
  maxValue?: number;
}) {
  const [displayValue, setDisplayValue] = useState(
    defaultValue.replace(".", ","),
  );
  const normalizedValue = displayValue.replace(",", ".");

  return (
    <>
      <Input
        {...props}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={(event) => {
          let nextValue = event.target.value.replace(/[^0-9,]/g, "");
          const [integerPart = "", ...decimalParts] = nextValue.split(",");

          if (decimalParts.length > 0) {
            nextValue = `${integerPart},${decimalParts.join("").slice(0, maxDecimals)}`;
          }

          const numericValue = Number(nextValue.replace(",", "."));
          if (
            nextValue !== "" &&
            Number.isFinite(numericValue) &&
            numericValue > maxValue
          ) {
            return;
          }

          setDisplayValue(nextValue);
        }}
      />
      <input type="hidden" name={name} value={normalizedValue} />
    </>
  );
}

function IntegerInput({
  defaultValue = "0",
  maxValue = 1000000,
  ...props
}: Omit<
  ComponentProps<typeof Input>,
  "defaultValue" | "onChange" | "type" | "value"
> & {
  defaultValue?: string;
  maxValue?: number;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={value}
      onChange={(event) => {
        const nextValue = event.target.value.replace(/\D/g, "");
        const numericValue = Number(nextValue);

        if (
          nextValue !== "" &&
          Number.isFinite(numericValue) &&
          numericValue > maxValue
        ) {
          return;
        }

        setValue(nextValue);
      }}
    />
  );
}

function FormSelect({
  id,
  name,
  value,
  placeholder,
  options,
  ariaLabel,
  ariaInvalid,
  disabled,
  onValueChange,
}: {
  id: string;
  name: string;
  value: string;
  placeholder: string;
  options: SelectOption[];
  ariaLabel: string;
  ariaInvalid?: boolean;
  disabled?: boolean;
  onValueChange: (value: string) => void;
}) {
  return (
    <>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || options.length === 0}
      >
        <SelectTrigger
          id={id}
          className="w-full"
          aria-label={ariaLabel}
          aria-invalid={ariaInvalid}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input type="hidden" name={name} value={value} />
    </>
  );
}

function SearchableSelect({
  id,
  name,
  value,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  options,
  ariaLabel,
  disabled,
  onValueChange,
}: {
  id: string;
  name: string;
  value: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  options: SelectOption[];
  ariaLabel: string;
  disabled?: boolean;
  onValueChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selectedOption = options.find((option) => option.value === value);
  const normalizedQuery = normalizeSearch(search.trim());
  const filteredOptions = normalizedQuery
    ? options.filter((option) =>
        normalizeSearch(option.label).includes(normalizedQuery),
      )
    : options;
  const isDisabled = disabled || options.length === 0;

  return (
    <>
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) setSearch("");
        }}
      >
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-label={ariaLabel}
            aria-expanded={open}
            disabled={isDisabled}
            className="w-full justify-between font-normal"
          >
            <span className="truncate">
              {selectedOption?.label ?? placeholder}
            </span>
            <ChevronsUpDown
              className="ml-2 size-4 shrink-0 opacity-50"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) p-1"
        >
          <div className="relative border-b p-1">
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="border-0 pl-8 shadow-none focus-visible:ring-0"
            />
          </div>
          <div
            className="max-h-56 overflow-y-auto p-1"
            role="listbox"
            aria-label={ariaLabel}
          >
            {value !== "0" && (
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground w-full justify-start"
                onClick={() => {
                  onValueChange("0");
                  setOpen(false);
                }}
              >
                <X className="size-4" aria-hidden="true" />
                Limpar seleção
              </Button>
            )}
            {filteredOptions.length === 0 ? (
              <p className="text-muted-foreground px-2 py-6 text-center text-sm">
                {emptyMessage}
              </p>
            ) : (
              filteredOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant="ghost"
                  role="option"
                  aria-selected={option.value === value}
                  className="w-full justify-start"
                  onClick={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={
                      option.value === value ? "size-4" : "size-4 opacity-0"
                    }
                    aria-hidden="true"
                  />
                  <span className="truncate">{option.label}</span>
                </Button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
      <input type="hidden" name={name} value={value} />
    </>
  );
}

export function EntryItemProductCreateSheet({
  open,
  onOpenChange,
  productFormOptions,
  onCreated,
}: EntryItemProductCreateSheetProps) {
  const [isDirty, setIsDirty] = useState(false);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );
  const [brandId, setBrandId] = useState("0");
  const [typeId, setTypeId] = useState("0");
  const [familyId, setFamilyId] = useState("0");
  const [groupId, setGroupId] = useState("0");
  const [subgroupId, setSubgroupId] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetAndClose = () => {
    setIsDirty(false);
    setValidationErrors({});
    setBrandId("0");
    setTypeId("0");
    setFamilyId("0");
    setGroupId("0");
    setSubgroupId("0");
    setFormKey((current) => current + 1);
    onOpenChange(false);
  };

  const requestOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isDirty) {
      setIsDiscardDialogOpen(true);
      return;
    }
    if (nextOpen) {
      onOpenChange(true);
      return;
    }
    resetAndClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const errors = validateForm(formData);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Revise os campos destacados antes de criar o produto.");
      const firstField = Object.keys(errors)[0];
      document.getElementById(firstField)?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createProductFromForm(formData);

      if (!result.success || !result.productId) {
        toast.error(
          result.error ?? "Não foi possível criar o produto. Tente novamente.",
        );
        return;
      }

      setIsDirty(false);
      toast.success(result.message ?? "Produto criado com sucesso!");
      resetAndClose();
      onCreated(result.productId);
    } catch {
      toast.error(
        "Não foi possível concluir a comunicação com o servidor. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const { brands, ptypes, taxonomyOptions, isTaxonomyAvailable } =
    productFormOptions;
  const brandOptions: SelectOption[] = [
    { value: "0", label: "Sem marca" },
    ...brands.map((brand) => ({
      value: brand.id.toString(),
      label: `${brand.name}${brand.inactive ? " (inativa)" : ""}`,
    })),
  ];
  const ptypeOptions: SelectOption[] = [
    { value: "0", label: "Sem tipo de produto" },
    ...ptypes.map((ptype) => ({
      value: ptype.id.toString(),
      label: ptype.name,
    })),
  ];
  const familyOptions = taxonomyOptions
    .filter((category) => category.level === 1 && category.parentId === 0)
    .map((category) => ({
      value: category.id.toString(),
      label: category.name,
    }));
  const groupOptions = taxonomyOptions
    .filter(
      (category) =>
        category.level === 2 && category.parentId === Number(familyId),
    )
    .map((category) => ({
      value: category.id.toString(),
      label: category.name,
    }));
  const subgroupOptions = taxonomyOptions
    .filter(
      (category) =>
        category.level === 3 && category.parentId === Number(groupId),
    )
    .map((category) => ({
      value: category.id.toString(),
      label: category.name,
    }));

  return (
    <>
      <Sheet open={open} onOpenChange={requestOpenChange}>
        <SheetContent
          side="right"
          className="flex w-[90vw] max-w-[90vw] flex-col gap-0 p-0 sm:w-[90vw] sm:max-w-3xl"
        >
          <SheetHeader className="shrink-0 border-b p-4 pr-12 sm:p-6 sm:pr-14">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <PackagePlus className="text-primary size-5" aria-hidden="true" />
              Cadastrar produto
            </SheetTitle>
          </SheetHeader>

          <form
            key={formKey}
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
            onChangeCapture={() => setIsDirty(true)}
          >
            <fieldset
              disabled={isSubmitting}
              className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-6"
            >
              <section className="space-y-3 rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Package className="text-primary size-4" aria-hidden="true" />
                  <h3 className="font-medium">Informações básicas</h3>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="entry-item-product-name"
                    className="font-semibold"
                  >
                    Nome do produto
                    <span className="text-destructive" aria-hidden="true">
                      *
                    </span>
                    <span className="sr-only"> obrigatório</span>
                  </Label>
                  <FormInput
                    id="entry-item-product-name"
                    name="name"
                    placeholder="Digite o nome do produto"
                    required
                    minLength={6}
                    maxLength={300}
                    autoComplete="off"
                    aria-invalid={Boolean(validationErrors.name)}
                    aria-describedby={
                      validationErrors.name
                        ? "entry-item-product-name-error"
                        : undefined
                    }
                  />
                  <FieldError
                    id="entry-item-product-name-error"
                    message={validationErrors.name}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="min-w-0 space-y-1.5">
                    <Label htmlFor="entry-item-product-reference">
                      Referência
                    </Label>
                    <FormInput
                      id="entry-item-product-reference"
                      name="reference"
                      placeholder="Ex.: REF001"
                      maxLength={100}
                      autoComplete="off"
                    />
                  </div>
                  <div className="min-w-0 space-y-1.5">
                    <Label htmlFor="entry-item-product-model">Modelo</Label>
                    <FormInput
                      id="entry-item-product-model"
                      name="model"
                      placeholder="Ex.: XPTO 100"
                      maxLength={100}
                      autoComplete="off"
                    />
                  </div>
                  <div className="col-span-2 min-w-0 space-y-1.5 sm:col-span-1">
                    <Label htmlFor="entry-item-product-label">Etiqueta</Label>
                    <FormInput
                      id="entry-item-product-label"
                      name="label"
                      placeholder="Ex.: Linha premium"
                      maxLength={100}
                      autoComplete="off"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-3 rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <CircleDollarSign
                    className="text-primary size-4"
                    aria-hidden="true"
                  />
                  <h3 className="font-medium">Preços</h3>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
                  <div className="min-w-0 space-y-1.5">
                    <Label
                      htmlFor="entry-item-wholesale-price"
                      className="font-semibold"
                    >
                      Atacado
                      <span className="text-destructive" aria-hidden="true">
                        *
                      </span>
                      <span className="sr-only"> obrigatório</span>
                    </Label>
                    <CurrencyInput
                      id="entry-item-wholesale-price"
                      name="wholesalePrice"
                      defaultValue="0"
                      placeholder="0,0000"
                      required
                      aria-invalid={Boolean(validationErrors.wholesalePrice)}
                      aria-describedby={
                        validationErrors.wholesalePrice
                          ? "entry-item-wholesale-price-error"
                          : undefined
                      }
                    />
                    <FieldError
                      id="entry-item-wholesale-price-error"
                      message={validationErrors.wholesalePrice}
                    />
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <Label
                      htmlFor="entry-item-retail-price"
                      className="font-semibold"
                    >
                      Varejo
                      <span className="text-destructive" aria-hidden="true">
                        *
                      </span>
                      <span className="sr-only"> obrigatório</span>
                    </Label>
                    <CurrencyInput
                      id="entry-item-retail-price"
                      name="retailPrice"
                      defaultValue="0"
                      placeholder="0,0000"
                      required
                      aria-invalid={Boolean(validationErrors.retailPrice)}
                      aria-describedby={
                        validationErrors.retailPrice
                          ? "entry-item-retail-price-error"
                          : undefined
                      }
                    />
                    <FieldError
                      id="entry-item-retail-price-error"
                      message={validationErrors.retailPrice}
                    />
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <Label
                      htmlFor="entry-item-corporate-price"
                      className="font-semibold"
                    >
                      Corporativo
                      <span className="text-destructive" aria-hidden="true">
                        *
                      </span>
                      <span className="sr-only"> obrigatório</span>
                    </Label>
                    <CurrencyInput
                      id="entry-item-corporate-price"
                      name="corporatePrice"
                      defaultValue="0"
                      placeholder="0,0000"
                      required
                      aria-invalid={Boolean(validationErrors.corporatePrice)}
                      aria-describedby={
                        validationErrors.corporatePrice
                          ? "entry-item-corporate-price-error"
                          : undefined
                      }
                    />
                    <FieldError
                      id="entry-item-corporate-price-error"
                      message={validationErrors.corporatePrice}
                    />
                  </div>
                  <div className="col-span-3 min-w-0 space-y-1.5 sm:col-span-1">
                    <Label
                      htmlFor="entry-item-product-stock"
                      className="flex items-center gap-1.5"
                    >
                      <Warehouse className="size-3.5" aria-hidden="true" />
                      Estoque
                    </Label>
                    <IntegerInput
                      id="entry-item-product-stock"
                      name="stock"
                      defaultValue="0"
                      placeholder="0"
                      aria-invalid={Boolean(validationErrors.stock)}
                      aria-describedby={
                        validationErrors.stock
                          ? "entry-item-product-stock-error"
                          : undefined
                      }
                    />
                    <FieldError
                      id="entry-item-product-stock-error"
                      message={validationErrors.stock}
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-3 rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <FolderTree
                    className="text-primary size-4"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-medium">Categorias</h3>
                    <p className="text-muted-foreground text-xs">
                      Seleção opcional em ordem hierárquica
                    </p>
                  </div>
                </div>

                {!isTaxonomyAvailable && (
                  <p className="text-muted-foreground text-sm">
                    A hierarquia não pôde ser carregada. O produto pode ser
                    criado sem categorias.
                  </p>
                )}

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="min-w-0 space-y-1.5">
                    <Label htmlFor="entry-item-product-family">Família</Label>
                    <SearchableSelect
                      id="entry-item-product-family"
                      name="familyId"
                      value={familyId}
                      placeholder="Sem família"
                      searchPlaceholder="Pesquisar família"
                      emptyMessage="Nenhuma família encontrada."
                      options={familyOptions}
                      ariaLabel="Família"
                      disabled={isSubmitting || !isTaxonomyAvailable}
                      onValueChange={(value) => {
                        setFamilyId(value);
                        setGroupId("0");
                        setSubgroupId("0");
                        setIsDirty(true);
                      }}
                    />
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <Label htmlFor="entry-item-product-group">Grupo</Label>
                    <SearchableSelect
                      id="entry-item-product-group"
                      name="groupId"
                      value={groupId}
                      placeholder={
                        familyId === "0" ? "Selecione a família" : "Sem grupo"
                      }
                      searchPlaceholder="Pesquisar grupo"
                      emptyMessage="Nenhum grupo encontrado."
                      options={groupOptions}
                      ariaLabel="Grupo"
                      disabled={
                        isSubmitting || !isTaxonomyAvailable || familyId === "0"
                      }
                      onValueChange={(value) => {
                        setGroupId(value);
                        setSubgroupId("0");
                        setIsDirty(true);
                      }}
                    />
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <Label htmlFor="entry-item-product-subgroup">
                      Subgrupo
                    </Label>
                    <SearchableSelect
                      id="entry-item-product-subgroup"
                      name="subgroupId"
                      value={subgroupId}
                      placeholder={
                        groupId === "0" ? "Selecione o grupo" : "Sem subgrupo"
                      }
                      searchPlaceholder="Pesquisar subgrupo"
                      emptyMessage="Nenhum subgrupo encontrado."
                      options={subgroupOptions}
                      ariaLabel="Subgrupo"
                      disabled={
                        isSubmitting || !isTaxonomyAvailable || groupId === "0"
                      }
                      onValueChange={(value) => {
                        setSubgroupId(value);
                        setIsDirty(true);
                      }}
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-3 rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Tags className="text-primary size-4" aria-hidden="true" />
                  <h3 className="font-medium">Classificação</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="min-w-0 space-y-1.5">
                    <Label htmlFor="entry-item-product-brand">Marca</Label>
                    <FormSelect
                      id="entry-item-product-brand"
                      name="brandId"
                      value={brandId}
                      placeholder="Sem marca"
                      options={brandOptions}
                      ariaLabel="Marca"
                      ariaInvalid={Boolean(validationErrors.brandId)}
                      disabled={isSubmitting}
                      onValueChange={(value) => {
                        setBrandId(value);
                        setIsDirty(true);
                        setValidationErrors((current) => ({
                          ...current,
                          brandId: undefined,
                        }));
                      }}
                    />
                    <FieldError
                      id="entry-item-product-brand-error"
                      message={validationErrors.brandId}
                    />
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <Label htmlFor="entry-item-product-type">
                      Tipo de produto
                    </Label>
                    <FormSelect
                      id="entry-item-product-type"
                      name="typeId"
                      value={typeId}
                      placeholder="Sem tipo de produto"
                      options={ptypeOptions}
                      ariaLabel="Tipo de produto"
                      ariaInvalid={Boolean(validationErrors.typeId)}
                      disabled={isSubmitting}
                      onValueChange={(value) => {
                        setTypeId(value);
                        setIsDirty(true);
                        setValidationErrors((current) => ({
                          ...current,
                          typeId: undefined,
                        }));
                      }}
                    />
                    <FieldError
                      id="entry-item-product-type-error"
                      message={validationErrors.typeId}
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-2 rounded-lg border p-3">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-medium">Informações adicionais</h3>
                  <p className="text-muted-foreground hidden text-xs sm:block">
                    Observações internas do cadastro
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="entry-item-product-additional-info">
                    Observações
                  </Label>
                  <FormTextarea
                    id="entry-item-product-additional-info"
                    name="additionalInfo"
                    placeholder="Informações extras sobre o produto..."
                    rows={2}
                    maxLength={5000}
                  />
                </div>
              </section>

              <p className="text-muted-foreground text-xs">
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>{" "}
                Campos obrigatórios. Após a criação, o produto será incluído na
                entrada.
              </p>
            </fieldset>

            <SheetFooter className="supports-[backdrop-filter]:bg-background/80 shrink-0 border-t bg-background/95 p-4 backdrop-blur sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => requestOpenChange(false)}
                className="w-full sm:w-auto"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={isSubmitting}
                aria-disabled={isSubmitting}
              >
                {isSubmitting ? "Criando produto..." : "Criar e incluir"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={isDiscardDialogOpen}
        onOpenChange={setIsDiscardDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <TriangleAlert aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>Descartar produto não salvo?</AlertDialogTitle>
            <AlertDialogDescription>
              Os dados digitados serão perdidos se você fechar este painel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar preenchendo</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setIsDiscardDialogOpen(false);
                resetAndClose();
              }}
            >
              Descartar dados
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
