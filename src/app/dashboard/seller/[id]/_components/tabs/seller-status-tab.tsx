"use client";

import {
  Gift,
  Loader2,
  MailCheck,
  MailX,
  Power,
  PowerOff,
  Truck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UISellerDetail } from "@/services/api-main/seller";
import {
  updateSellerEmailMarketingAction,
  updateSellerFreeShippingAction,
  updateSellerInactiveAction,
} from "../../_actions/seller-actions";
import type { SellerActionResult } from "../types/seller-detail-types";

type StatusSection = "emailMarketing" | "registrationStatus" | "shippingType";

interface SellerStatusTabProps {
  seller: UISellerDetail;
}

export function SellerStatusTab({ seller }: SellerStatusTabProps) {
  const router = useRouter();
  const [savingSection, setSavingSection] = useState<StatusSection | null>(
    null,
  );
  const freeShipping = seller.freeShipping ?? false;
  const inactive = seller.inactive ?? false;
  const emailMarketingEnabled = seller.emailMarketingEnabled ?? false;

  const runAction = async (
    section: StatusSection,
    action: Promise<SellerActionResult>,
  ) => {
    setSavingSection(section);
    try {
      const result = await action;
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    } catch {
      toast.error("Não foi possível concluir a comunicação com o servidor.");
    } finally {
      setSavingSection(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
      <div className="space-y-3 rounded-lg border p-3 sm:p-4">
        <div>
          <h3 className="font-semibold">Tipo de frete</h3>
        </div>
        <fieldset
          className="grid grid-cols-1 gap-2 sm:grid-cols-2"
          aria-label="Tipo de frete do vendedor"
        >
          <Button
            type="button"
            variant={freeShipping ? "outline" : "default"}
            aria-pressed={!freeShipping}
            disabled={savingSection !== null || !freeShipping}
            onClick={() => {
              if (
                !window.confirm(
                  "Alterar o tipo de frete deste vendedor para Frete Padrão?",
                )
              )
                return;
              runAction(
                "shippingType",
                updateSellerFreeShippingAction({
                  sellerId: seller.id,
                  enabled: false,
                }),
              );
            }}
            className="justify-between"
          >
            <span className="flex items-center gap-2">
              {savingSection === "shippingType" && freeShipping ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Truck className="size-4" />
              )}
              Frete Padrão
            </span>
            {!freeShipping && <Badge variant="secondary">Atual</Badge>}
          </Button>
          <Button
            type="button"
            variant={freeShipping ? "default" : "outline"}
            aria-pressed={freeShipping}
            disabled={savingSection !== null || freeShipping}
            onClick={() => {
              if (!window.confirm("Ativar o Frete Grátis para este vendedor?"))
                return;
              runAction(
                "shippingType",
                updateSellerFreeShippingAction({
                  sellerId: seller.id,
                  enabled: true,
                }),
              );
            }}
            className="justify-between"
          >
            <span className="flex items-center gap-2">
              {savingSection === "shippingType" && !freeShipping ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Gift className="size-4" />
              )}
              Frete Grátis
            </span>
            {freeShipping && <Badge variant="secondary">Atual</Badge>}
          </Button>
        </fieldset>
      </div>

      <div className="space-y-3 rounded-lg border p-3 sm:p-4">
        <div>
          <h3 className="font-semibold">Status do cadastro</h3>
        </div>
        <fieldset
          className="grid grid-cols-1 gap-2 sm:grid-cols-2"
          aria-label="Status do cadastro do vendedor"
        >
          <Button
            type="button"
            variant={inactive ? "outline" : "default"}
            aria-pressed={!inactive}
            disabled={savingSection !== null || !inactive}
            onClick={() => {
              if (!window.confirm("Ativar este vendedor?")) return;
              runAction(
                "registrationStatus",
                updateSellerInactiveAction({
                  sellerId: seller.id,
                  inactive: false,
                }),
              );
            }}
            className="justify-between"
          >
            <span className="flex items-center gap-2">
              {savingSection === "registrationStatus" && inactive ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Power className="size-4" />
              )}
              Ativo
            </span>
            {!inactive && <Badge variant="secondary">Atual</Badge>}
          </Button>
          <Button
            type="button"
            variant={inactive ? "destructive" : "outline"}
            aria-pressed={inactive}
            disabled={savingSection !== null || inactive}
            onClick={() => {
              if (!window.confirm("Inativar este vendedor?")) return;
              runAction(
                "registrationStatus",
                updateSellerInactiveAction({
                  sellerId: seller.id,
                  inactive: true,
                }),
              );
            }}
            className="justify-between"
          >
            <span className="flex items-center gap-2">
              {savingSection === "registrationStatus" && !inactive ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <PowerOff className="size-4" />
              )}
              Inativo
            </span>
            {inactive && <Badge variant="secondary">Atual</Badge>}
          </Button>
        </fieldset>
      </div>

      <div className="space-y-3 rounded-lg border p-3 sm:p-4">
        <div>
          <h3 className="font-semibold">Publicidade por e-mail</h3>
        </div>
        <fieldset
          className="grid grid-cols-1 gap-2 sm:grid-cols-2"
          aria-label="Envio de publicidade por e-mail para o vendedor"
        >
          <Button
            type="button"
            variant={emailMarketingEnabled ? "outline" : "default"}
            aria-pressed={!emailMarketingEnabled}
            disabled={savingSection !== null || !emailMarketingEnabled}
            onClick={() => {
              if (
                !window.confirm(
                  "Desativar o envio de publicidade por e-mail para este vendedor?",
                )
              )
                return;
              runAction(
                "emailMarketing",
                updateSellerEmailMarketingAction({
                  sellerId: seller.id,
                  enabled: false,
                }),
              );
            }}
            className="justify-between"
          >
            <span className="flex items-center gap-2">
              {savingSection === "emailMarketing" && emailMarketingEnabled ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <MailX className="size-4" />
              )}
              Não enviar
            </span>
            {!emailMarketingEnabled && <Badge variant="secondary">Atual</Badge>}
          </Button>
          <Button
            type="button"
            variant={emailMarketingEnabled ? "default" : "outline"}
            aria-pressed={emailMarketingEnabled}
            disabled={savingSection !== null || emailMarketingEnabled}
            onClick={() => {
              if (
                !window.confirm(
                  "Ativar o envio de publicidade por e-mail para este vendedor?",
                )
              )
                return;
              runAction(
                "emailMarketing",
                updateSellerEmailMarketingAction({
                  sellerId: seller.id,
                  enabled: true,
                }),
              );
            }}
            className="justify-between"
          >
            <span className="flex items-center gap-2">
              {savingSection === "emailMarketing" && !emailMarketingEnabled ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <MailCheck className="size-4" />
              )}
              Enviar
            </span>
            {emailMarketingEnabled && <Badge variant="secondary">Atual</Badge>}
          </Button>
        </fieldset>
      </div>
    </div>
  );
}
