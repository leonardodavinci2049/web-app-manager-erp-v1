"use client";

import { Check, Pencil, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { updateProductTaxValues } from "@/app/actions/action-products";
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

interface ProductTaxValuesCardProps {
  productId: number;
  cfop?: string;
  cst?: string;
  ean?: string;
  ncm?: number;
  nbm?: string;
  ppb?: number;
  temp?: string;
}

export function ProductTaxValuesCard({
  productId,
  cfop = "",
  cst = "",
  ean = "",
  ncm = 0,
  nbm = "",
  ppb = 0,
  temp = "",
}: ProductTaxValuesCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    cfop: cfop || "",
    cst: cst || "",
    ean: ean || "",
    ncm: (ncm ?? 0).toString(),
    nbm: nbm || "",
    ppb: (ppb ?? 0).toString(),
    temp: temp || "",
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset to original values
    setFormData({
      cfop: cfop || "",
      cst: cst || "",
      ean: ean || "",
      ncm: (ncm ?? 0).toString(),
      nbm: nbm || "",
      ppb: (ppb ?? 0).toString(),
      temp: temp || "",
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateProductTaxValues({
        productId,
        cfop: formData.cfop,
        cst: formData.cst,
        ean: formData.ean,
        ncm: Number(formData.ncm),
        nbm: formData.nbm,
        ppb: Number(formData.ppb),
        temp: formData.temp,
      });

      if (result.success) {
        toast.success("Informações fiscais atualizadas com sucesso!");
        setIsEditing(false);
      } else {
        toast.error(result.error || "Erro ao atualizar informações fiscais");
      }
    } catch (error) {
      console.error("Error updating tax values:", error);
      toast.error("Erro ao atualizar informações fiscais");
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
            <CardTitle>Informações Fiscais</CardTitle>
            <CardDescription>
              Dados tributários e fiscais do produto
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
            <span className="text-muted-foreground font-medium">CFOP:</span>
            <span className="font-mono text-sm">{cfop || "—"}</span>

            <span className="text-muted-foreground font-medium">CST:</span>
            <span className="font-mono text-sm">{cst || "—"}</span>

            <span className="text-muted-foreground font-medium">EAN:</span>
            <span className="font-mono text-sm">{ean || "—"}</span>

            <span className="text-muted-foreground font-medium">NCM:</span>
            <span className="font-mono text-sm">
              {ncm && ncm > 0 ? ncm : "—"}
            </span>

            <span className="text-muted-foreground font-medium">NBM:</span>
            <span className="font-mono text-sm">{nbm || "—"}</span>

            <span className="text-muted-foreground font-medium">PPB:</span>
            <span>{ppb && ppb > 0 ? `${ppb}%` : "—"}</span>

            <span className="text-muted-foreground font-medium">TEMP:</span>
            <span>{temp || "—"}</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cfop">CFOP</Label>
              <Input
                id="cfop"
                value={formData.cfop}
                onChange={(e) =>
                  setFormData({ ...formData, cfop: e.target.value })
                }
                onKeyDown={handleKeyDown}
                placeholder="Digite o CFOP"
                disabled={isSaving}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cst">CST</Label>
              <Input
                id="cst"
                value={formData.cst}
                onChange={(e) =>
                  setFormData({ ...formData, cst: e.target.value })
                }
                onKeyDown={handleKeyDown}
                placeholder="Digite o CST"
                disabled={isSaving}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ean">EAN</Label>
              <Input
                id="ean"
                value={formData.ean}
                onChange={(e) =>
                  setFormData({ ...formData, ean: e.target.value })
                }
                onKeyDown={handleKeyDown}
                placeholder="Digite o EAN"
                disabled={isSaving}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ncm">NCM</Label>
              <Input
                id="ncm"
                type="number"
                min="0"
                step="1"
                value={formData.ncm}
                onChange={(e) =>
                  setFormData({ ...formData, ncm: e.target.value })
                }
                onKeyDown={handleKeyDown}
                placeholder="0"
                disabled={isSaving}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nbm">NBM</Label>
              <Input
                id="nbm"
                value={formData.nbm}
                onChange={(e) =>
                  setFormData({ ...formData, nbm: e.target.value })
                }
                onKeyDown={handleKeyDown}
                placeholder="Digite o NBM"
                disabled={isSaving}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ppb">PPB (%)</Label>
              <Input
                id="ppb"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.ppb}
                onChange={(e) =>
                  setFormData({ ...formData, ppb: e.target.value })
                }
                onKeyDown={handleKeyDown}
                placeholder="0"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temp">TEMP</Label>
              <Input
                id="temp"
                value={formData.temp}
                onChange={(e) =>
                  setFormData({ ...formData, temp: e.target.value })
                }
                onKeyDown={handleKeyDown}
                placeholder="Digite o TEMP"
                disabled={isSaving}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
