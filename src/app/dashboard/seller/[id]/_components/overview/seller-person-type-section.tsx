"use client";

import { Check, Loader2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSellerTypePersonAction } from "../../_actions/seller-actions";
import type { SellerActionResult } from "../types/seller-detail-types";

const PERSON_TYPES = [
  { id: 1, label: "Pessoa Física" },
  { id: 2, label: "Pessoa Jurídica" },
] as const;

interface SellerPersonTypeSectionProps {
  sellerId: number;
  personTypeId: number;
}

export function SellerPersonTypeSection({
  sellerId,
  personTypeId,
}: SellerPersonTypeSectionProps) {
  const router = useRouter();
  const [savingPerson, setSavingPerson] = useState<number | null>(null);

  const runInline = async (
    value: number,
    action: Promise<SellerActionResult>,
  ) => {
    setSavingPerson(value);
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
      setSavingPerson(null);
    }
  };

  return (
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
                disabled={savingPerson !== null || selected}
                onClick={() =>
                  runInline(
                    option.id,
                    updateSellerTypePersonAction({
                      sellerId,
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
  );
}
