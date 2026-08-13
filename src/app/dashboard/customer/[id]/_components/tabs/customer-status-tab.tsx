"use client";

import {
  BadgeCheck,
  Clock3,
  Gift,
  Loader2,
  MailCheck,
  MailX,
  Power,
  PowerOff,
  ShieldAlert,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  updateCustomerApprovalAction,
  updateCustomerEmailMarketingAction,
  updateCustomerFreeShippingAction,
  updateCustomerInactiveAction,
  updateCustomerRestrictionAction,
} from "@/app/dashboard/customer/_actions/customer-actions";
import type { CustomerActionResult } from "@/app/dashboard/customer/_components/types/customer-dashboard-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UICustomerDetail } from "@/services/api-main/customer-general";

type StatusSection =
  | "approval"
  | "emailMarketing"
  | "registrationStatus"
  | "restriction"
  | "shippingType";

interface CustomerStatusTabProps {
  customer: UICustomerDetail;
}

export function CustomerStatusTab({ customer }: CustomerStatusTabProps) {
  const router = useRouter();
  const [savingSection, setSavingSection] = useState<StatusSection | null>(
    null,
  );

  const runAction = async (
    section: StatusSection,
    action: Promise<CustomerActionResult>,
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
          <h3 className="font-semibold">Aprovação do cliente</h3>
        </div>
        <fieldset
          className="grid grid-cols-1 gap-2 sm:grid-cols-2"
          aria-label="Situação da aprovação do cliente"
        >
          <Button
            type="button"
            variant={customer.approved ? "default" : "outline"}
            aria-pressed={customer.approved}
            disabled={savingSection !== null || customer.approved}
            onClick={() => {
              if (!window.confirm("Aprovar este cliente?")) return;
              runAction(
                "approval",
                updateCustomerApprovalAction({
                  customerId: customer.id,
                  approved: true,
                }),
              );
            }}
            className="justify-between"
          >
            <span className="flex items-center gap-2">
              {savingSection === "approval" && !customer.approved ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <BadgeCheck className="size-4" />
              )}
              APROVADO
            </span>
            {customer.approved && <Badge variant="secondary">Atual</Badge>}
          </Button>
          <Button
            type="button"
            variant={customer.approved ? "outline" : "default"}
            aria-pressed={!customer.approved}
            disabled={savingSection !== null || !customer.approved}
            onClick={() => {
              if (!window.confirm("Marcar este cliente como pendente?")) return;
              runAction(
                "approval",
                updateCustomerApprovalAction({
                  customerId: customer.id,
                  approved: false,
                }),
              );
            }}
            className="justify-between"
          >
            <span className="flex items-center gap-2">
              {savingSection === "approval" && customer.approved ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Clock3 className="size-4" />
              )}
              PENDENTE
            </span>
            {!customer.approved && <Badge variant="secondary">Atual</Badge>}
          </Button>
        </fieldset>
      </div>

      <div className="space-y-3 rounded-lg border p-3 sm:p-4">
        <div>
          <h3 className="font-semibold">Restrição comercial</h3>
        </div>
        <fieldset
          className="grid grid-cols-1 gap-2 sm:grid-cols-2"
          aria-label="Situação da restrição comercial"
        >
          <Button
            type="button"
            variant={customer.restricted ? "outline" : "default"}
            aria-pressed={!customer.restricted}
            disabled={savingSection !== null || !customer.restricted}
            onClick={() => {
              if (!window.confirm("Remover a restrição deste cliente?")) return;
              runAction(
                "restriction",
                updateCustomerRestrictionAction({
                  customerId: customer.id,
                  restricted: false,
                }),
              );
            }}
            className="justify-between"
          >
            <span className="flex items-center gap-2">
              {savingSection === "restriction" && customer.restricted ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ShieldCheck className="size-4" />
              )}
              Sem restrição
            </span>
            {!customer.restricted && <Badge variant="secondary">Atual</Badge>}
          </Button>
          <Button
            type="button"
            variant={customer.restricted ? "destructive" : "outline"}
            aria-pressed={customer.restricted}
            disabled={savingSection !== null || customer.restricted}
            onClick={() => {
              if (!window.confirm("Marcar este cliente com restrição?")) return;
              runAction(
                "restriction",
                updateCustomerRestrictionAction({
                  customerId: customer.id,
                  restricted: true,
                }),
              );
            }}
            className="justify-between"
          >
            <span className="flex items-center gap-2">
              {savingSection === "restriction" && !customer.restricted ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ShieldAlert className="size-4" />
              )}
              Com restrição
            </span>
            {customer.restricted && <Badge variant="secondary">Atual</Badge>}
          </Button>
        </fieldset>
      </div>

      <div className="space-y-3 rounded-lg border p-3 sm:p-4">
        <div>
          <h3 className="font-semibold">Tipo de frete</h3>
        </div>
        <fieldset
          className="grid grid-cols-1 gap-2 sm:grid-cols-2"
          aria-label="Tipo de frete do cliente"
        >
          <Button
            type="button"
            variant={customer.freeShipping ? "outline" : "default"}
            aria-pressed={!customer.freeShipping}
            disabled={savingSection !== null || !customer.freeShipping}
            onClick={() => {
              if (
                !window.confirm(
                  "Alterar o tipo de frete deste cliente para Frete Padrão?",
                )
              )
                return;
              runAction(
                "shippingType",
                updateCustomerFreeShippingAction({
                  customerId: customer.id,
                  enabled: false,
                }),
              );
            }}
            className="justify-between"
          >
            <span className="flex items-center gap-2">
              {savingSection === "shippingType" && customer.freeShipping ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Truck className="size-4" />
              )}
              Frete Padrão
            </span>
            {!customer.freeShipping && <Badge variant="secondary">Atual</Badge>}
          </Button>
          <Button
            type="button"
            variant={customer.freeShipping ? "default" : "outline"}
            aria-pressed={customer.freeShipping}
            disabled={savingSection !== null || customer.freeShipping}
            onClick={() => {
              if (!window.confirm("Ativar o Frete Grátis para este cliente?"))
                return;
              runAction(
                "shippingType",
                updateCustomerFreeShippingAction({
                  customerId: customer.id,
                  enabled: true,
                }),
              );
            }}
            className="justify-between"
          >
            <span className="flex items-center gap-2">
              {savingSection === "shippingType" && !customer.freeShipping ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Gift className="size-4" />
              )}
              Frete Grátis
            </span>
            {customer.freeShipping && <Badge variant="secondary">Atual</Badge>}
          </Button>
        </fieldset>
      </div>

      <div className="space-y-3 rounded-lg border p-3 sm:p-4">
        <div>
          <h3 className="font-semibold">Status do cadastro</h3>
        </div>
        <fieldset
          className="grid grid-cols-1 gap-2 sm:grid-cols-2"
          aria-label="Status do cadastro"
        >
          <Button
            type="button"
            variant={customer.inactive ? "outline" : "default"}
            aria-pressed={!customer.inactive}
            disabled={savingSection !== null || !customer.inactive}
            onClick={() => {
              if (!window.confirm("Ativar este cliente?")) return;
              runAction(
                "registrationStatus",
                updateCustomerInactiveAction({
                  customerId: customer.id,
                  inactive: false,
                }),
              );
            }}
            className="justify-between"
          >
            <span className="flex items-center gap-2">
              {savingSection === "registrationStatus" && customer.inactive ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Power className="size-4" />
              )}
              Ativo
            </span>
            {!customer.inactive && <Badge variant="secondary">Atual</Badge>}
          </Button>
          <Button
            type="button"
            variant={customer.inactive ? "destructive" : "outline"}
            aria-pressed={customer.inactive}
            disabled={savingSection !== null || customer.inactive}
            onClick={() => {
              if (!window.confirm("Inativar este cliente?")) return;
              runAction(
                "registrationStatus",
                updateCustomerInactiveAction({
                  customerId: customer.id,
                  inactive: true,
                }),
              );
            }}
            className="justify-between"
          >
            <span className="flex items-center gap-2">
              {savingSection === "registrationStatus" && !customer.inactive ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <PowerOff className="size-4" />
              )}
              Inativo
            </span>
            {customer.inactive && <Badge variant="secondary">Atual</Badge>}
          </Button>
        </fieldset>
      </div>

      <div className="space-y-3 rounded-lg border p-3 sm:p-4">
        <div>
          <h3 className="font-semibold">Publicidade por e-mail</h3>
        </div>
        <fieldset
          className="grid grid-cols-1 gap-2 sm:grid-cols-2"
          aria-label="Envio de publicidade por e-mail"
        >
          <Button
            type="button"
            variant={customer.emailMarketingEnabled ? "outline" : "default"}
            aria-pressed={!customer.emailMarketingEnabled}
            disabled={savingSection !== null || !customer.emailMarketingEnabled}
            onClick={() => {
              if (
                !window.confirm(
                  "Desativar o envio de publicidade por e-mail para este cliente?",
                )
              )
                return;
              runAction(
                "emailMarketing",
                updateCustomerEmailMarketingAction({
                  customerId: customer.id,
                  enabled: false,
                }),
              );
            }}
            className="justify-between"
          >
            <span className="flex items-center gap-2">
              {savingSection === "emailMarketing" &&
              customer.emailMarketingEnabled ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <MailX className="size-4" />
              )}
              Não enviar
            </span>
            {!customer.emailMarketingEnabled && (
              <Badge variant="secondary">Atual</Badge>
            )}
          </Button>
          <Button
            type="button"
            variant={customer.emailMarketingEnabled ? "default" : "outline"}
            aria-pressed={customer.emailMarketingEnabled}
            disabled={savingSection !== null || customer.emailMarketingEnabled}
            onClick={() => {
              if (
                !window.confirm(
                  "Ativar o envio de publicidade por e-mail para este cliente?",
                )
              )
                return;
              runAction(
                "emailMarketing",
                updateCustomerEmailMarketingAction({
                  customerId: customer.id,
                  enabled: true,
                }),
              );
            }}
            className="justify-between"
          >
            <span className="flex items-center gap-2">
              {savingSection === "emailMarketing" &&
              !customer.emailMarketingEnabled ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <MailCheck className="size-4" />
              )}
              Enviar
            </span>
            {customer.emailMarketingEnabled && (
              <Badge variant="secondary">Atual</Badge>
            )}
          </Button>
        </fieldset>
      </div>
    </div>
  );
}
