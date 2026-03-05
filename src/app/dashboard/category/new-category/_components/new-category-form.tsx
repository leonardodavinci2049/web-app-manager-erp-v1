"use client";

/**
 * Componente de formulário modernizado para criação de nova categoria
 * Implementação otimizada seguindo Next.js 15 e diretrizes do projeto
 */

import Form from "next/form";
import { useState } from "react";
import { toast } from "sonner";
import { createCategoryAction } from "@/app/actions/action-categories";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UITaxonomyMenuItem } from "@/services/api-main/taxonomy-base/transformers/transformers";
import { SubmitButton } from "./submit-button";

interface NewCategoryFormProps {
  categories: UITaxonomyMenuItem[];
}

/**
 * Componente do formulário de criação de categoria modernizado
 * Usa Next.js Form component com Server Actions
 */
export function NewCategoryForm({ categories }: NewCategoryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    parentId: "0",
  });
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({ ...prev, name }));
  };

  // Atualizar categoria pai selecionada
  const handleParentChange = (parentId: string) => {
    setFormData((prev) => ({ ...prev, parentId }));
  };

  // Handler para ação de cancelar
  function handleCancel() {
    window.location.href = "/dashboard/category/category-list";
  }

  // Handler para erros do Server Action
  async function handleFormAction(formData: FormData) {
    try {
      await createCategoryAction(formData);
      // Se chegou aqui, houve erro (o sucesso redireciona automaticamente)
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro inesperado";
      toast.error(errorMessage);
    }
  }

  return (
    <Form action={handleFormAction} className="space-y-6">
      {/* Seção: Informações Básicas */}
      <Card>
        <CardContent className="space-y-4">
          {/* Nome da Categoria */}
          <div className="space-y-4">
            <Label htmlFor="name">Nome da Categoria</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex: Eletrônicos"
              required
              minLength={2}
              maxLength={100}
            />
          </div>

          {/* Categoria Pai */}
          <div className="space-y-6">
            <Label htmlFor="parentId">Categoria Pai</Label>
            <select
              id="parentId"
              name="parentId"
              value={formData.parentId}
              onChange={(e) => handleParentChange(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="0">Categoria Raiz</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.level &&
                    category.level > 1 &&
                    "— ".repeat(category.level - 1)}
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>
      {/* Ações do Formulário */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <SubmitButton pendingText="Criando...">
              Criar Categoria
            </SubmitButton>
          </div>
        </CardContent>
      </Card>
    </Form>
  );
}
