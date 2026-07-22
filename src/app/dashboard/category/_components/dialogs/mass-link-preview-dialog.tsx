"use client";

import { Link2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CategoryDetailDto } from "../category-types";

export function MassLinkPreviewDialog({
  detail,
}: {
  detail: CategoryDetailDto;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const labels = ["Destino", "Busca", "Prévia", "Confirmação"];

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Link2 /> Vincular em massa
      </Button>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          if (!value) setStep(1);
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vincular produtos em massa</DialogTitle>
            <DialogDescription>
              Fluxo em prévia. Nenhuma alteração será executada até existir o
              endpoint em lote.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 border-y">
            {labels.map((label, index) => (
              <div
                key={label}
                className={cn(
                  "p-2 text-center text-xs",
                  step === index + 1 && "bg-muted font-medium",
                )}
              >
                <span className="mr-1 inline-flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] text-background">
                  {index + 1}
                </span>
                {label}
              </div>
            ))}
          </div>
          <div className="min-h-48 rounded-md border border-dashed p-6">
            {step === 1 && (
              <div>
                <h4 className="font-medium">Categoria de destino</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  {detail.breadcrumb.map((item) => item.name).join(" › ")}
                </p>
              </div>
            )}
            {step === 2 && (
              <div>
                <h4 className="font-medium">Busca server-side</h4>
                <Input
                  className="mt-3"
                  placeholder="Nome, SKU, EAN, referência, modelo ou marca…"
                  disabled
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Os controles serão ativados com o contrato do endpoint.
                </p>
              </div>
            )}
            {step === 3 && (
              <div>
                <h4 className="font-medium">Prévia de vínculos</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Encontrados, já vinculados, selecionados e novos serão
                  exibidos aqui sem dados simulados.
                </p>
              </div>
            )}
            {step === 4 && (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-4">
                <h4 className="font-medium">Operação indisponível</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  A confirmação ficará disponível após a API oferecer limite,
                  idempotência e retorno parcial.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => (step === 1 ? setOpen(false) : setStep(step - 1))}
            >
              {step === 1 ? "Cancelar" : "Voltar"}
            </Button>
            <Button onClick={() => setStep(step + 1)} disabled={step === 4}>
              {step === 4 ? "Aguardando API" : "Próximo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
