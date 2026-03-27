"use client";

/**
 * Componente de formulário para criação de novo produto
 * Migrado para usar Form component do Next.js 15 com Server Actions
 */

import Form from "next/form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { createProductFromForm } from "@/app/actions/action-products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  FormButton,
  FormCurrencyInput,
  FormInput,
  FormIntegerInput,
  FormPositiveIntegerInput,
  FormTextarea,
} from "./forms/form-inputs";
import { SubmitButton } from "./forms/submit-button";

/**
 * Componente do formulário de criação de produto
 * Usa useActionState para gerenciar resposta e useFormStatus nos inputs para loading
 */
export function NewProductForm() {
  const router = useRouter();
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Função de validação customizada
  const validateForm = (formData: FormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Validar Nome do Produto
    const name = formData.get("name") as string;
    if (!name || name.trim().length === 0) {
      errors.name = "O nome do produto é obrigatório e não pode estar vazio.";
    } else if (name.trim().length < 3) {
      errors.name =
        "O nome do produto deve ter pelo menos 3 caracteres para ser identificado adequadamente.";
    }

    // Validar Preço Atacado
    const wholesalePrice = parseFloat(formData.get("wholesalePrice") as string);
    if (Number.isNaN(wholesalePrice) || wholesalePrice < 0) {
      errors.wholesalePrice =
        "O preço de atacado é obrigatório e deve ser um valor numérico válido (maior ou igual a zero).";
    } else if (wholesalePrice === 0) {
      errors.wholesalePrice =
        "O preço de atacado não pode ser zero. Por favor, defina um valor adequado para vendas no atacado.";
    } else if (wholesalePrice > 2000000) {
      errors.wholesalePrice =
        "O preço de atacado não pode ser maior que R$ 2.000.000,00.";
    }

    // Validar Preço Varejo
    const retailPrice = parseFloat(formData.get("retailPrice") as string);
    if (Number.isNaN(retailPrice) || retailPrice < 0) {
      errors.retailPrice =
        "O preço de varejo é obrigatório e deve ser um valor numérico válido (maior ou igual a zero).";
    } else if (retailPrice === 0) {
      errors.retailPrice =
        "O preço de varejo não pode ser zero. Por favor, defina um valor adequado para vendas no varejo.";
    } else if (retailPrice > 2000000) {
      errors.retailPrice =
        "O preço de varejo não pode ser maior que R$ 2.000.000,00.";
    }

    // Validar Preço Corporativo
    const corporatePrice = parseFloat(formData.get("corporatePrice") as string);
    if (Number.isNaN(corporatePrice) || corporatePrice < 0) {
      errors.corporatePrice =
        "O preço corporativo é obrigatório e deve ser um valor numérico válido (maior ou igual a zero).";
    } else if (corporatePrice === 0) {
      errors.corporatePrice =
        "O preço corporativo não pode ser zero. Por favor, defina um valor adequado para vendas corporativas.";
    } else if (corporatePrice > 2000000) {
      errors.corporatePrice =
        "O preço corporativo não pode ser maior que R$ 2.000.000,00.";
    }

    // Validar Estoque (opcional)
    const stock = parseInt(formData.get("stock") as string, 10);
    if (!Number.isNaN(stock) && stock < 0) {
      errors.stock =
        "O estoque deve ser um número inteiro válido (maior ou igual a zero).";
    } else if (!Number.isNaN(stock) && stock > 1000000) {
      errors.stock = "O estoque não pode ser maior que 1.000.000 unidades.";
    }

    // Validar ID da Marca (opcional)
    const brandId = parseInt(formData.get("brandId") as string, 10);
    if (Number.isNaN(brandId) || brandId <= 0) {
      errors.brandId =
        "O ID da marca deve ser um número inteiro positivo maior que zero.";
    }

    // Validar ID do Tipo (opcional)
    const typeId = parseInt(formData.get("typeId") as string, 10);
    if (Number.isNaN(typeId) || typeId <= 0) {
      errors.typeId =
        "O ID do tipo deve ser um número inteiro positivo maior que zero.";
    }

    // Validações de consistência entre preços
    if (
      !Number.isNaN(wholesalePrice) &&
      !Number.isNaN(retailPrice) &&
      wholesalePrice > retailPrice
    ) {
      errors.wholesalePrice =
        "O preço de atacado não deve ser maior que o preço de varejo. Verifique os valores informados.";
    }

    return errors;
  };

  // Função para lidar com o envio do formulário com validação
  const handleFormSubmit = async (formData: FormData) => {
    // Limpar erros anteriores
    setValidationErrors({});

    // Validar formulário
    const errors = validateForm(formData);

    if (Object.keys(errors).length > 0) {
      // Mostrar erros de validação
      setValidationErrors(errors);

      // Mostrar toast com resumo dos erros
      const errorCount = Object.keys(errors).length;
      toast.error(
        `Encontrados ${errorCount} erro${errorCount > 1 ? "s" : ""} de validação. Por favor, corrija os campos destacados.`,
        {
          duration: 5000,
        },
      ); // Focar no primeiro campo com erro
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      return;
    }

    // Se não há erros, prosseguir com o envio
    const result = await createProductFromForm(formData);

    if (result.success && result.productId) {
      toast.success("Produto criado com sucesso!");
      router.refresh();
      router.push("/dashboard/product/catalog");
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  // Cancelar e voltar para lista
  const handleCancel = () => {
    router.push("/dashboard/product/catalog");
  };

  return (
    <Form action={handleFormSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nome do Produto */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto</Label>
            <FormInput
              id="name"
              name="name"
              placeholder="Digite o nome do produto"
              className={
                validationErrors.name
                  ? "border-red-500 focus:border-red-500"
                  : ""
              }
            />
            {validationErrors.name && (
              <p className="text-sm text-red-600 mt-1">
                {validationErrors.name}
              </p>
            )}
          </div>

          {/* Referência */}
          <div className="space-y-2">
            <Label htmlFor="reference">Referência/Código</Label>
            <FormInput id="reference" name="reference" placeholder="REF001" />
          </div>
        </CardContent>
      </Card>

      {/* Preços */}
      <Card>
        <CardHeader>
          <CardTitle>Preços</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preço Atacado */}
          <div className="space-y-2">
            <Label htmlFor="wholesalePrice">Preço Atacado</Label>
            <FormCurrencyInput
              id="wholesalePrice"
              name="wholesalePrice"
              maxDecimals={4}
              maxValue={2000000}
              defaultValue="0"
              placeholder="0,0000"
              className={
                validationErrors.wholesalePrice
                  ? "border-red-500 focus:border-red-500"
                  : ""
              }
            />
            {validationErrors.wholesalePrice && (
              <p className="text-sm text-red-600 mt-1">
                {validationErrors.wholesalePrice}
              </p>
            )}
          </div>

          {/* Preço Varejo */}
          <div className="space-y-2">
            <Label htmlFor="retailPrice">Preço Varejo</Label>
            <FormCurrencyInput
              id="retailPrice"
              name="retailPrice"
              maxDecimals={4}
              maxValue={2000000}
              defaultValue="0"
              placeholder="0,0000"
              className={
                validationErrors.retailPrice
                  ? "border-red-500 focus:border-red-500"
                  : ""
              }
            />
            {validationErrors.retailPrice && (
              <p className="text-sm text-red-600 mt-1">
                {validationErrors.retailPrice}
              </p>
            )}
          </div>

          {/* Preço Corporativo */}
          <div className="space-y-2">
            <Label htmlFor="corporatePrice">Preço Corporativo</Label>
            <FormCurrencyInput
              id="corporatePrice"
              name="corporatePrice"
              maxDecimals={4}
              maxValue={2000000}
              defaultValue="0"
              placeholder="0,0000"
              className={
                validationErrors.corporatePrice
                  ? "border-red-500 focus:border-red-500"
                  : ""
              }
            />
            {validationErrors.corporatePrice && (
              <p className="text-sm text-red-600 mt-1">
                {validationErrors.corporatePrice}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estoque */}
      <Card>
        <CardHeader>
          <CardTitle>Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Estoque */}
          <div className="space-y-2">
            <Label htmlFor="stock">Estoque Inicial</Label>
            <FormIntegerInput
              id="stock"
              name="stock"
              maxValue={1000000}
              defaultValue="0"
              placeholder="0"
              className={
                validationErrors.stock
                  ? "border-red-500 focus:border-red-500"
                  : ""
              }
            />
            {validationErrors.stock && (
              <p className="text-sm text-red-600 mt-1">
                {validationErrors.stock}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Marca e Tipo */}
      <Card>
        <CardHeader>
          <CardTitle>Marca e Tipo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ID da Marca */}
          <div className="space-y-2">
            <Label htmlFor="brandId">ID da Marca</Label>
            <FormPositiveIntegerInput
              id="brandId"
              name="brandId"
              maxValue={1000000}
              defaultValue="1"
              placeholder="1"
              className={
                validationErrors.brandId
                  ? "border-red-500 focus:border-red-500"
                  : ""
              }
            />
            {validationErrors.brandId && (
              <p className="text-sm text-red-600 mt-1">
                {validationErrors.brandId}
              </p>
            )}
          </div>

          {/* ID do Tipo */}
          <div className="space-y-2">
            <Label htmlFor="typeId">ID do Tipo</Label>
            <FormPositiveIntegerInput
              id="typeId"
              name="typeId"
              maxValue={1000000}
              defaultValue="1"
              placeholder="1"
              className={
                validationErrors.typeId
                  ? "border-red-500 focus:border-red-500"
                  : ""
              }
            />
            {validationErrors.typeId && (
              <p className="text-sm text-red-600 mt-1">
                {validationErrors.typeId}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Adicionais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Informações Adicionais */}
          <div className="space-y-2">
            <Label htmlFor="additionalInfo">Informações Adicionais</Label>
            <FormTextarea
              id="additionalInfo"
              name="additionalInfo"
              placeholder="Informações extras sobre o produto..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Campo oculto para businessType - valor vem das variáveis de ambiente */}
      <input type="hidden" name="businessType" value="1" />

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
        <FormButton
          type="button"
          variant="outline"
          onClick={handleCancel}
          className="w-full sm:w-auto"
        >
          Cancelar
        </FormButton>
        <SubmitButton
          className="w-full sm:w-auto"
          pendingText="Criando produto..."
        >
          Criar Produto
        </SubmitButton>
      </div>
    </Form>
  );
}
