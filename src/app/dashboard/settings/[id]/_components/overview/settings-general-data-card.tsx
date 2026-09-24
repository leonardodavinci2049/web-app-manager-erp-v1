"use client";

import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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
import { Switch } from "@/components/ui/switch";
import { updateSettingsGeneralFieldAction } from "../../_actions/settings-actions";
import type { SettingsDetailData } from "../settings-detail-types";

type TextField = "APP_NAME" | "DOMINIO";
type FlagField = "FLAG_MAINTENANCE" | "IS_ACTIVE";

const FIELD_LABELS: Record<TextField | FlagField, string> = {
  APP_NAME: "nome do aplicativo",
  DOMINIO: "domínio",
  FLAG_MAINTENANCE: "modo de manutenção",
  IS_ACTIVE: "status da configuração",
};

interface SettingsGeneralDataCardProps {
  config: SettingsDetailData;
}

export function SettingsGeneralDataCard({
  config,
}: SettingsGeneralDataCardProps) {
  const router = useRouter();
  const [name, setName] = useState(config.name ?? "");
  const [domain, setDomain] = useState(config.domain ?? "");
  const [maintenance, setMaintenance] = useState(config.maintenance === 1);
  const [active, setActive] = useState(config.active === 1);
  const [savingField, setSavingField] = useState<TextField | FlagField | null>(
    null,
  );

  const saveField = async (
    field: TextField | FlagField,
    value: string | 0 | 1,
  ) => {
    setSavingField(field);
    try {
      const result = await updateSettingsGeneralFieldAction({
        configId: config.id,
        field,
        value,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    } catch {
      toast.error("Não foi possível concluir a comunicação com o servidor.");
    } finally {
      setSavingField(null);
    }
  };

  const renderSaveButton = (
    field: TextField | FlagField,
    value: string | 0 | 1,
    disabled = false,
  ) => (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={savingField !== null || disabled}
      onClick={() => void saveField(field, value)}
      aria-label={`Salvar ${FIELD_LABELS[field]}`}
    >
      {savingField === field ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Save className="size-4" aria-hidden="true" />
      )}
      Salvar
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados da configuração</CardTitle>
        <CardDescription>
          Edite cada campo de identificação ou status separadamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="settings-app-name">Nome do aplicativo</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="settings-app-name"
              value={name}
              maxLength={255}
              disabled={savingField !== null}
              onChange={(event) => setName(event.target.value)}
            />
            {renderSaveButton("APP_NAME", name.trim(), name.trim() === "")}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="settings-domain">Domínio</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="settings-domain"
              value={domain}
              maxLength={255}
              disabled={savingField !== null}
              onChange={(event) => setDomain(event.target.value)}
            />
            {renderSaveButton("DOMINIO", domain.trim(), domain.trim() === "")}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
          <div className="space-y-0.5">
            <Label htmlFor="settings-maintenance">Modo de manutenção</Label>
            <p className="text-muted-foreground text-xs">
              Indica se o aplicativo está em manutenção.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="settings-maintenance"
              checked={maintenance}
              disabled={savingField !== null}
              onCheckedChange={setMaintenance}
            />
            {renderSaveButton("FLAG_MAINTENANCE", maintenance ? 1 : 0)}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
          <div className="space-y-0.5">
            <Label htmlFor="settings-active">Configuração ativa</Label>
            <p className="text-muted-foreground text-xs">
              Controla a disponibilidade desta configuração.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="settings-active"
              checked={active}
              disabled={savingField !== null}
              onCheckedChange={setActive}
            />
            {renderSaveButton("IS_ACTIVE", active ? 1 : 0)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
