"use client";

import {
  CircleDollarSign,
  FolderTree,
  Package,
  Tags,
  Warehouse,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { createProductFromForm } from "@/app/actions/action-products";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SheetFooter } from "@/components/ui/sheet";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import type { UIPtype } from "@/services/api-main/ptype/transformers/transformers";
import type { NewProductTaxonomyOption } from "../types/catalog-types";
import {
  NewProductCurrencyInput,
  NewProductFormInput,
  NewProductFormSelect,
  NewProductFormTextarea,
  NewProductIntegerInput,
  NewProductSearchableSelect,
  NewProductSubmitButton,
} from "./new-product-form-fields";

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

interface NewProductFormProps {
  brands: UIBrand[];
  ptypes: UIPtype[];
  taxonomyOptions: NewProductTaxonomyOption[];
  isTaxonomyAvailable: boolean;
  onCancel: () => void;
  onCreated: (productId: number) => void;
  onDirtyChange: (isDirty: boolean) => void;
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
  const stock = readNumber(formData, "stock");
  const brandId = readNumber(formData, "brandId");
  const typeId = readNumber(formData, "typeId");

  if (normalizedName.length === 0) {
    errors.name = "Informe o nome do produto.";
  } else if (normalizedName.length < 3) {
    errors.name = "O nome deve ter pelo menos 3 caracteres.";
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

  if (!Number.isSafeInteger(brandId) || brandId <= 0) {
    errors.brandId = "Selecione uma marca.";
  }

  if (!Number.isSafeInteger(typeId) || typeId <= 0) {
    errors.typeId = "Selecione um tipo de produto.";
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

export function NewProductForm({
  brands,
  ptypes,
  taxonomyOptions,
  isTaxonomyAvailable,
  onCancel,
  onCreated,
  onDirtyChange,
}: NewProductFormProps) {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );
  const [brandId, setBrandId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [familyId, setFamilyId] = useState("0");
  const [groupId, setGroupId] = useState("0");
  const [subgroupId, setSubgroupId] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      onDirtyChange(false);
      toast.success(result.message ?? "Produto criado com sucesso!");
      onCreated(result.productId);
    } catch {
      toast.error(
        "Não foi possível concluir a comunicação com o servidor. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const brandOptions = brands.map((brand) => ({
    value: brand.id.toString(),
    label: `${brand.name}${brand.inactive ? " (inativa)" : ""}`,
  }));
  const ptypeOptions = ptypes.map((ptype) => ({
    value: ptype.id.toString(),
    label: ptype.name,
  }));
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
    <form
      onSubmit={handleSubmit}
      className="flex min-h-0 flex-1 flex-col"
      onChangeCapture={() => onDirtyChange(true)}
    >
      <fieldset
        disabled={isSubmitting}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4"
      >
        <section className="space-y-3 rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Package className="text-primary size-4" aria-hidden="true" />
            <h3 className="font-medium">Informações básicas</h3>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Nome do produto</Label>
            <NewProductFormInput
              id="name"
              name="name"
              placeholder="Digite o nome do produto"
              maxLength={300}
              autoComplete="off"
              aria-invalid={Boolean(validationErrors.name)}
              aria-describedby={
                validationErrors.name ? "name-error" : undefined
              }
            />
            <FieldError id="name-error" message={validationErrors.name} />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="reference">Referência</Label>
              <NewProductFormInput
                id="reference"
                name="reference"
                placeholder="Ex.: REF001"
                maxLength={100}
                autoComplete="off"
              />
            </div>
            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="model">Modelo</Label>
              <NewProductFormInput
                id="model"
                name="model"
                placeholder="Ex.: XPTO 100"
                maxLength={100}
                autoComplete="off"
              />
            </div>
            <div className="col-span-2 min-w-0 space-y-1.5 sm:col-span-1">
              <Label htmlFor="label">Etiqueta</Label>
              <NewProductFormInput
                id="label"
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
              <Label htmlFor="wholesalePrice">Atacado</Label>
              <NewProductCurrencyInput
                id="wholesalePrice"
                name="wholesalePrice"
                defaultValue="0"
                placeholder="0,0000"
                aria-invalid={Boolean(validationErrors.wholesalePrice)}
                aria-describedby={
                  validationErrors.wholesalePrice
                    ? "wholesale-price-error"
                    : undefined
                }
              />
              <FieldError
                id="wholesale-price-error"
                message={validationErrors.wholesalePrice}
              />
            </div>

            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="retailPrice">Varejo</Label>
              <NewProductCurrencyInput
                id="retailPrice"
                name="retailPrice"
                defaultValue="0"
                placeholder="0,0000"
                aria-invalid={Boolean(validationErrors.retailPrice)}
                aria-describedby={
                  validationErrors.retailPrice
                    ? "retail-price-error"
                    : undefined
                }
              />
              <FieldError
                id="retail-price-error"
                message={validationErrors.retailPrice}
              />
            </div>

            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="corporatePrice">Corporativo</Label>
              <NewProductCurrencyInput
                id="corporatePrice"
                name="corporatePrice"
                defaultValue="0"
                placeholder="0,0000"
                aria-invalid={Boolean(validationErrors.corporatePrice)}
                aria-describedby={
                  validationErrors.corporatePrice
                    ? "corporate-price-error"
                    : undefined
                }
              />
              <FieldError
                id="corporate-price-error"
                message={validationErrors.corporatePrice}
              />
            </div>
            <div className="col-span-3 min-w-0 space-y-1.5 sm:col-span-1">
              <Label htmlFor="stock" className="flex items-center gap-1.5">
                <Warehouse className="size-3.5" aria-hidden="true" />
                Estoque
              </Label>
              <NewProductIntegerInput
                id="stock"
                name="stock"
                defaultValue="0"
                placeholder="0"
                aria-invalid={Boolean(validationErrors.stock)}
                aria-describedby={
                  validationErrors.stock ? "stock-error" : undefined
                }
              />
              <FieldError id="stock-error" message={validationErrors.stock} />
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <FolderTree className="text-primary size-4" aria-hidden="true" />
            <div>
              <h3 className="font-medium">Categorias</h3>
              <p className="text-muted-foreground text-xs">
                Seleção opcional em ordem hierárquica
              </p>
            </div>
          </div>

          {!isTaxonomyAvailable && (
            <p className="text-muted-foreground text-sm">
              A hierarquia não pôde ser carregada. O produto pode ser criado sem
              categorias.
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="familyId">Família</Label>
              <NewProductSearchableSelect
                id="familyId"
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
                  onDirtyChange(true);
                }}
              />
            </div>

            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="groupId">Grupo</Label>
              <NewProductSearchableSelect
                id="groupId"
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
                  onDirtyChange(true);
                }}
              />
            </div>

            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="subgroupId">Subgrupo</Label>
              <NewProductSearchableSelect
                id="subgroupId"
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
                  onDirtyChange(true);
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
              <Label htmlFor="brandId">Marca</Label>
              <NewProductFormSelect
                id="brandId"
                name="brandId"
                value={brandId}
                placeholder={
                  brandOptions.length > 0
                    ? "Selecione uma marca"
                    : "Nenhuma marca disponível"
                }
                options={brandOptions}
                ariaLabel="Marca"
                ariaInvalid={Boolean(validationErrors.brandId)}
                disabled={isSubmitting}
                onValueChange={(value) => {
                  setBrandId(value);
                  onDirtyChange(true);
                  setValidationErrors((current) => ({
                    ...current,
                    brandId: undefined,
                  }));
                }}
              />
              <FieldError id="brand-error" message={validationErrors.brandId} />
            </div>

            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="typeId">Tipo de produto</Label>
              <NewProductFormSelect
                id="typeId"
                name="typeId"
                value={typeId}
                placeholder={
                  ptypeOptions.length > 0
                    ? "Selecione um tipo"
                    : "Nenhum tipo disponível"
                }
                options={ptypeOptions}
                ariaLabel="Tipo de produto"
                ariaInvalid={Boolean(validationErrors.typeId)}
                disabled={isSubmitting}
                onValueChange={(value) => {
                  setTypeId(value);
                  onDirtyChange(true);
                  setValidationErrors((current) => ({
                    ...current,
                    typeId: undefined,
                  }));
                }}
              />
              <FieldError id="type-error" message={validationErrors.typeId} />
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
            <Label htmlFor="additionalInfo">Observações</Label>
            <NewProductFormTextarea
              id="additionalInfo"
              name="additionalInfo"
              placeholder="Informações extras sobre o produto..."
              rows={2}
              maxLength={5000}
            />
          </div>
        </section>
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
        <NewProductSubmitButton
          pending={isSubmitting}
          pendingText="Criando produto..."
          className="w-full sm:w-auto"
          disabled={brandOptions.length === 0 || ptypeOptions.length === 0}
        >
          Criar produto
        </NewProductSubmitButton>
      </SheetFooter>
    </form>
  );
}
