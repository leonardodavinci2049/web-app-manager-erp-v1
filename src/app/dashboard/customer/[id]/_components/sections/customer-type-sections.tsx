"use client";

import { Check, Loader2, Tags, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  updateCustomerTypeCustomerAction,
  updateCustomerTypePersonAction,
} from "@/app/dashboard/customer/_actions/customer-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomerActionResult } from "../../../_components";

const PERSON_TYPES = [
  { id: 1, label: "Pessoa Física" },
  { id: 2, label: "Pessoa Jurídica" },
] as const;

const CUSTOMER_TYPES = [
  { id: 1, label: "Atacado" },
  { id: 2, label: "Varejo" },
  { id: 3, label: "Corporativo" },
] as const;

interface CustomerTypeSectionsProps {
  customerId: number;
  personTypeId: number;
  customerTypeId: number;
  showPersonType?: boolean;
  showCustomerType?: boolean;
}

export function CustomerTypeSections({
  customerId,
  personTypeId,
  customerTypeId,
  showPersonType = true,
  showCustomerType = true,
}: CustomerTypeSectionsProps) {
  const router = useRouter();
  const [savingPerson, setSavingPerson] = useState<number | null>(null);
  const [savingCustomer, setSavingCustomer] = useState<number | null>(null);
  const isBusy = savingPerson !== null || savingCustomer !== null;

  const runInline = async (
    section: "person" | "customer",
    value: number,
    action: Promise<CustomerActionResult>,
  ) => {
    if (section === "person") setSavingPerson(value);
    else setSavingCustomer(value);
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
      if (section === "person") setSavingPerson(null);
      else setSavingCustomer(null);
    }
  };

  return (
    <>
      {showPersonType && (
        <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4" />
              Tipo de pessoa
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid grid-cols-2 gap-2">
              {PERSON_TYPES.map((option) => {
                const selected = option.id === personTypeId;
                const saving = savingPerson === option.id;
                return (
                  <Button
                    key={option.id}
                    type="button"
                    variant={selected ? "default" : "outline"}
                    aria-pressed={selected}
                    disabled={isBusy || selected}
                    onClick={() =>
                      runInline(
                        "person",
                        option.id,
                        updateCustomerTypePersonAction({
                          customerId,
                          personTypeId: option.id,
                        }),
                      )
                    }
                    className="justify-between"
                  >
                    <span className="flex items-center gap-2">
                      {saving ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Check className="size-4" />
                      )}
                      {option.label}
                    </span>
                    {selected && <Badge variant="secondary">Atual</Badge>}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {showCustomerType && (
        <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base">
              <Tags className="size-4" />
              Tipo de cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {CUSTOMER_TYPES.map((option) => {
                const selected = option.id === customerTypeId;
                const saving = savingCustomer === option.id;
                return (
                  <Button
                    key={option.id}
                    type="button"
                    variant={selected ? "default" : "outline"}
                    aria-pressed={selected}
                    disabled={isBusy || selected}
                    onClick={() =>
                      runInline(
                        "customer",
                        option.id,
                        updateCustomerTypeCustomerAction({
                          customerId,
                          customerTypeId: option.id,
                        }),
                      )
                    }
                    className="justify-between"
                  >
                    <span className="flex items-center gap-2">
                      {saving ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Check className="size-4" />
                      )}
                      {option.label}
                    </span>
                    {selected && <Badge variant="secondary">Atual</Badge>}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
