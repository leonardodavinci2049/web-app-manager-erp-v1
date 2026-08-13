"use client";

import { Check, Pencil, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { updateProductCharacteristics } from "@/app/actions/action-products";
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

interface ProductCharacteristicsCardProps {
  productId: number;
  warrantyDays: number;
  weightGr: number;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  diameterMm: number;
}

export function ProductCharacteristicsCard({
  productId,
  warrantyDays,
  weightGr,
  lengthMm,
  widthMm,
  heightMm,
  diameterMm,
}: ProductCharacteristicsCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state - store as strings for input fields
  const [formData, setFormData] = useState({
    warrantyDays: warrantyDays.toString(),
    weightGr: weightGr.toString(),
    lengthMm: lengthMm.toString(),
    widthMm: widthMm.toString(),
    heightMm: heightMm.toString(),
    diameterMm: diameterMm.toString(),
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset to original values
    setFormData({
      warrantyDays: warrantyDays.toString(),
      weightGr: weightGr.toString(),
      lengthMm: lengthMm.toString(),
      widthMm: widthMm.toString(),
      heightMm: heightMm.toString(),
      diameterMm: diameterMm.toString(),
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Convert warranty days to months (required by API)
      const warrantyMonths = Math.floor(Number(formData.warrantyDays) / 30);

      const result = await updateProductCharacteristics({
        productId,
        weightGr: Number(formData.weightGr),
        lengthMm: Number(formData.lengthMm),
        widthMm: Number(formData.widthMm),
        heightMm: Number(formData.heightMm),
        diameterMm: Number(formData.diameterMm),
        warrantyDays: Number(formData.warrantyDays),
        warrantyMonths,
      });

      if (result.success) {
        toast.success("Características atualizadas com sucesso!");
        setIsEditing(false);
      } else {
        toast.error(result.error || "Erro ao atualizar características");
      }
    } catch (error) {
      console.error("Error updating characteristics:", error);
      toast.error("Erro ao atualizar características");
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

  // Format display values
  const formatWarranty = (days: number) => {
    if (days <= 0) return "—";
    const months = Math.floor(days / 30);
    return (
      <>
        {days} dias
        {months > 0 && (
          <span className="text-muted-foreground text-sm ml-1">
            ({months} {months === 1 ? "mês" : "meses"})
          </span>
        )}
      </>
    );
  };

  const formatWeight = (gr: number) => {
    if (gr <= 0) return "—";
    const kg = gr / 1000;
    return (
      <>
        {gr} g
        {gr >= 1000 && (
          <span className="text-muted-foreground text-sm ml-1">
            ({kg.toFixed(2)} kg)
          </span>
        )}
      </>
    );
  };

  const formatDimension = (mm: number) => {
    if (mm <= 0) return "—";
    const cm = mm / 10;
    return (
      <>
        {mm} mm
        {mm >= 10 && (
          <span className="text-muted-foreground text-sm ml-1">
            ({cm.toFixed(1)} cm)
          </span>
        )}
      </>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Características</CardTitle>
            <CardDescription>
              Dimensões e características físicas do produto
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
              Tempo de Garantia:
            </span>
            <span>{formatWarranty(warrantyDays)}</span>

            <span className="text-muted-foreground font-medium">Peso:</span>
            <span>{formatWeight(weightGr)}</span>

            <span className="text-muted-foreground font-medium">
              Comprimento:
            </span>
            <span>{formatDimension(lengthMm)}</span>

            <span className="text-muted-foreground font-medium">Largura:</span>
            <span>{formatDimension(widthMm)}</span>

            <span className="text-muted-foreground font-medium">Altura:</span>
            <span>{formatDimension(heightMm)}</span>

            <span className="text-muted-foreground font-medium">Diâmetro:</span>
            <span>{formatDimension(diameterMm)}</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="warrantyDays">Tempo de Garantia (dias)</Label>
              <Input
                id="warrantyDays"
                type="number"
                min="0"
                step="1"
                value={formData.warrantyDays}
                onChange={(e) =>
                  setFormData({ ...formData, warrantyDays: e.target.value })
                }
                onKeyDown={handleKeyDown}
                placeholder="0"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weightGr">Peso (gramas)</Label>
              <Input
                id="weightGr"
                type="number"
                min="0"
                step="1"
                value={formData.weightGr}
                onChange={(e) =>
                  setFormData({ ...formData, weightGr: e.target.value })
                }
                onKeyDown={handleKeyDown}
                placeholder="0"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lengthMm">Comprimento (mm)</Label>
              <Input
                id="lengthMm"
                type="number"
                min="0"
                step="1"
                value={formData.lengthMm}
                onChange={(e) =>
                  setFormData({ ...formData, lengthMm: e.target.value })
                }
                onKeyDown={handleKeyDown}
                placeholder="0"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="widthMm">Largura (mm)</Label>
              <Input
                id="widthMm"
                type="number"
                min="0"
                step="1"
                value={formData.widthMm}
                onChange={(e) =>
                  setFormData({ ...formData, widthMm: e.target.value })
                }
                onKeyDown={handleKeyDown}
                placeholder="0"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heightMm">Altura (mm)</Label>
              <Input
                id="heightMm"
                type="number"
                min="0"
                step="1"
                value={formData.heightMm}
                onChange={(e) =>
                  setFormData({ ...formData, heightMm: e.target.value })
                }
                onKeyDown={handleKeyDown}
                placeholder="0"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diameterMm">Diâmetro (mm)</Label>
              <Input
                id="diameterMm"
                type="number"
                min="0"
                step="1"
                value={formData.diameterMm}
                onChange={(e) =>
                  setFormData({ ...formData, diameterMm: e.target.value })
                }
                onKeyDown={handleKeyDown}
                placeholder="0"
                disabled={isSaving}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
