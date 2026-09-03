import { Check, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SupplierPersonTypeId } from "../supplier-detail-utils";

const PERSON_TYPES = [
  { id: 1, label: "Pessoa Física" },
  { id: 2, label: "Pessoa Jurídica" },
] as const;

interface SupplierPersonTypeSectionProps {
  currentPersonTypeId?: SupplierPersonTypeId;
  selectedPersonTypeId?: SupplierPersonTypeId;
  onSelect: (personTypeId: SupplierPersonTypeId) => void;
}

export function SupplierPersonTypeSection({
  currentPersonTypeId,
  selectedPersonTypeId,
  onSelect,
}: SupplierPersonTypeSectionProps) {
  return (
    <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="size-4" aria-hidden="true" />
          Tipo de pessoa
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {PERSON_TYPES.map((option) => {
            const selected = option.id === selectedPersonTypeId;
            const current = option.id === currentPersonTypeId;

            return (
              <Button
                key={option.id}
                type="button"
                variant={selected ? "default" : "outline"}
                aria-pressed={selected}
                disabled={selected}
                onClick={() => onSelect(option.id)}
                className="justify-between"
              >
                <span className="flex items-center gap-2">
                  {selected && <Check className="size-4" aria-hidden="true" />}
                  {option.label}
                </span>
                {current ? (
                  <Badge variant="secondary">Atual</Badge>
                ) : selected ? (
                  <Badge variant="secondary">Visualizando</Badge>
                ) : null}
              </Button>
            );
          })}
        </div>
        <p className="text-muted-foreground mt-3 text-xs">
          Selecione o tipo para visualizar os campos correspondentes. A seleção
          não altera o cadastro.
        </p>
      </CardContent>
    </Card>
  );
}
