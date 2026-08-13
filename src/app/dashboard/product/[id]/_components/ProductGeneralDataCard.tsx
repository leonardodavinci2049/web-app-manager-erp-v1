"use client";

import { Check, Pencil, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { updateProductGeneral } from "@/app/actions/action-products";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProductGeneralDataCardProps {
  productId: number;
  productName: string;
  descriptionTab: string;
  label: string;
  reference: string;
  model: string;
}

export function ProductGeneralDataCard({
  productId,
  productName,
  descriptionTab,
  label,
  reference,
  model,
}: ProductGeneralDataCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    descricaoTab: descriptionTab || "",
    etiqueta: label || "",
    ref: reference || "",
    modelo: model || "",
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset to original values
    setFormData({
      descricaoTab: descriptionTab || "",
      etiqueta: label || "",
      ref: reference || "",
      modelo: model || "",
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateProductGeneral({
        productId,
        productName, // Send existing product name (required by API)
        descriptionTab: formData.descricaoTab,
        label: formData.etiqueta,
        reference: formData.ref,
        model: formData.modelo,
      });

      if (result.success) {
        toast.success("Dados gerais atualizados com sucesso!");
        setIsEditing(false);
      } else {
        toast.error(result.error || "Erro ao atualizar dados gerais");
      }
    } catch (error) {
      console.error("Error updating general data:", error);
      toast.error("Erro ao atualizar dados gerais");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSaving) {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Dados Gerais</CardTitle>
            <CardDescription>
              Informações básicas e identificação do produto
            </CardDescription>
          </div>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="h-8 w-8 p-0"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
            <span className="text-muted-foreground font-medium">
              Descrição Tab:
            </span>
            <span>{descriptionTab || "—"}</span>

            <span className="text-muted-foreground font-medium">Etiqueta:</span>
            <span>{label || "—"}</span>

            <span className="text-muted-foreground font-medium">
              Referência:
            </span>
            <span className="font-mono text-sm">{reference || "—"}</span>

            <span className="text-muted-foreground font-medium">Modelo:</span>
            <span>{model || "—"}</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="descricaoTab">Descrição Tab</Label>
              <Input
                id="descricaoTab"
                value={formData.descricaoTab}
                onChange={(e) =>
                  setFormData({ ...formData, descricaoTab: e.target.value })
                }
                onKeyDown={handleKeyDown}
                placeholder="Digite a descrição tab"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="etiqueta">Etiqueta</Label>
              <Input
                id="etiqueta"
                value={formData.etiqueta}
                onChange={(e) =>
                  setFormData({ ...formData, etiqueta: e.target.value })
                }
                onKeyDown={handleKeyDown}
                placeholder="Digite a etiqueta"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ref">Referência</Label>
              <Input
                id="ref"
                value={formData.ref}
                onChange={(e) =>
                  setFormData({ ...formData, ref: e.target.value })
                }
                onKeyDown={handleKeyDown}
                placeholder="Digite a referência"
                disabled={isSaving}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) =>
                  setFormData({ ...formData, modelo: e.target.value })
                }
                onKeyDown={handleKeyDown}
                placeholder="Digite o modelo"
                disabled={isSaving}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
