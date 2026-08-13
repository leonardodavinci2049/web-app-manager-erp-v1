"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateProductFlags } from "@/app/actions/action-products";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ProductFlagsCardProps {
  productId: number;
  controleFisico: number;
  controlarEstoque: number;
  consignado: number;
  destaque: number;
  promocao: number;
  servico: number;
  websiteOff: number;
  inativo: number;
  importado: number;
}

export function ProductFlagsCard({
  productId,
  controleFisico,
  controlarEstoque,
  consignado,
  destaque,
  promocao,
  servico,
  websiteOff,
  inativo,
  importado,
}: ProductFlagsCardProps) {
  // Estado otimista - inicia com valores do servidor
  // REGRA: valor = 1 → Switch ON (true/LIGADO), valor ≠ 1 → Switch OFF (false/DESLIGADO)
  const [flags, setFlags] = useState({
    controleFisico: controleFisico === 1,
    controlarEstoque: controlarEstoque === 1,
    consignado: consignado === 1,
    destaque: destaque === 1,
    promocao: promocao === 1,
    servico: servico === 1,
    websiteOff: websiteOff === 1,
    inativo: inativo === 1,
    importado: importado === 1,
  });

  const [isSaving, setIsSaving] = useState(false);

  /**
   * Handle flag change with optimistic update
   * REGRA DE CONVERSÃO:
   * - Switch ON (true/LIGADO) → envia 1 para API
   * - Switch OFF (false/DESLIGADO) → envia 0 para API
   */
  const handleFlagChange = async (
    flagName: keyof typeof flags,
    newValue: boolean,
  ) => {
    // 1. Store previous state for rollback
    const previousFlags = { ...flags };

    // 2. Optimistic update - UI responds immediately
    setFlags((prev) => ({
      ...prev,
      [flagName]: newValue,
    }));

    // 3. Prepare all flags for API (convert boolean to number)
    // Switch ON (true) → 1, Switch OFF (false) → 0
    const apiFlags = {
      controleFisico: flags.controleFisico ? 1 : 0,
      controlarEstoque: flags.controlarEstoque ? 1 : 0,
      consignado: flags.consignado ? 1 : 0,
      destaque: flags.destaque ? 1 : 0,
      promocao: flags.promocao ? 1 : 0,
      servico: flags.servico ? 1 : 0,
      websiteOff: flags.websiteOff ? 1 : 0,
      inativo: flags.inativo ? 1 : 0,
      importado: flags.importado ? 1 : 0,
      // Apply the new value for the changed flag
      [flagName]: newValue ? 1 : 0,
    };

    // 4. Send to API
    setIsSaving(true);
    try {
      const result = await updateProductFlags({
        productId,
        ...apiFlags,
      });

      if (result.success) {
        // Success - keep optimistic state
        toast.success("Flag atualizada com sucesso!");
      } else {
        // Error - rollback optimistic update
        setFlags(previousFlags);
        toast.error(result.error || "Erro ao atualizar flag");
      }
    } catch (error) {
      // Error - rollback optimistic update
      setFlags(previousFlags);
      console.error("Error updating flag:", error);
      toast.error("Erro ao atualizar flag");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flags e Controles</CardTitle>
        <CardDescription>
          Indicadores de status e configurações do produto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3">
          {/* Controle Físico */}
          <Label
            htmlFor="controle-fisico"
            className="text-muted-foreground font-medium cursor-pointer"
          >
            Controle Físico:
          </Label>
          <Switch
            id="controle-fisico"
            checked={flags.controleFisico}
            onCheckedChange={(checked) =>
              handleFlagChange("controleFisico", checked)
            }
            disabled={isSaving}
          />

          {/* Controlar Estoque */}
          <Label
            htmlFor="controlar-estoque"
            className="text-muted-foreground font-medium cursor-pointer"
          >
            Controlar Estoque:
          </Label>
          <Switch
            id="controlar-estoque"
            checked={flags.controlarEstoque}
            onCheckedChange={(checked) =>
              handleFlagChange("controlarEstoque", checked)
            }
            disabled={isSaving}
          />

          {/* Consignado */}
          <Label
            htmlFor="consignado"
            className="text-muted-foreground font-medium cursor-pointer"
          >
            Consignado:
          </Label>
          <Switch
            id="consignado"
            checked={flags.consignado}
            onCheckedChange={(checked) =>
              handleFlagChange("consignado", checked)
            }
            disabled={isSaving}
          />

          {/* Destaque */}
          <Label
            htmlFor="destaque"
            className="text-muted-foreground font-medium cursor-pointer"
          >
            Destaque:
          </Label>
          <Switch
            id="destaque"
            checked={flags.destaque}
            onCheckedChange={(checked) => handleFlagChange("destaque", checked)}
            disabled={isSaving}
          />

          {/* Promoção */}
          <Label
            htmlFor="promocao"
            className="text-muted-foreground font-medium cursor-pointer"
          >
            Promoção:
          </Label>
          <Switch
            id="promocao"
            checked={flags.promocao}
            onCheckedChange={(checked) => handleFlagChange("promocao", checked)}
            disabled={isSaving}
          />

          {/* Serviço */}
          <Label
            htmlFor="servico"
            className="text-muted-foreground font-medium cursor-pointer"
          >
            Serviço:
          </Label>
          <Switch
            id="servico"
            checked={flags.servico}
            onCheckedChange={(checked) => handleFlagChange("servico", checked)}
            disabled={isSaving}
          />

          {/* Website Off */}
          <Label
            htmlFor="website-off"
            className="text-muted-foreground font-medium cursor-pointer"
          >
            Website Off:
          </Label>
          <Switch
            id="website-off"
            checked={flags.websiteOff}
            onCheckedChange={(checked) =>
              handleFlagChange("websiteOff", checked)
            }
            disabled={isSaving}
          />

          {/* Inativo */}
          <Label
            htmlFor="inativo"
            className="text-muted-foreground font-medium cursor-pointer"
          >
            Inativo:
          </Label>
          <Switch
            id="inativo"
            checked={flags.inativo}
            onCheckedChange={(checked) => handleFlagChange("inativo", checked)}
            disabled={isSaving}
          />

          {/* Importado */}
          <Label
            htmlFor="importado"
            className="text-muted-foreground font-medium cursor-pointer"
          >
            Importado:
          </Label>
          <Switch
            id="importado"
            checked={flags.importado}
            onCheckedChange={(checked) =>
              handleFlagChange("importado", checked)
            }
            disabled={isSaving}
          />
        </div>
      </CardContent>
    </Card>
  );
}
