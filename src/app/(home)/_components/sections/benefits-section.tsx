import { BarChart3, CheckCircle2 } from "lucide-react";
import { benefits } from "../landing-content";

export function BenefitsSection() {
  return (
    <section id="beneficios" className="bg-muted/50 py-16 sm:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-balance text-2xl font-bold sm:mb-4 sm:text-3xl lg:text-4xl">
              Benefícios para o seu dia a dia
            </h2>
            <p className="mb-8 text-pretty text-base text-muted-foreground sm:mb-10 sm:text-lg">
              Mais organização, controle e clareza nas informações da empresa,
              sem planilhas manuais dispersas.
            </p>
            <ul className="space-y-5">
              {benefits.map((benefit) => (
                <li key={benefit.title} className="flex items-start gap-3">
                  <CheckCircle2
                    className="mt-0.5 size-5 shrink-0 text-primary sm:size-6"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="text-sm font-semibold sm:text-base">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-muted-foreground sm:text-base">
                      {benefit.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Decorative panel */}
          <div
            className="hidden rounded-2xl border border-border bg-linear-to-br from-primary/10 via-card to-primary/5 p-10 lg:flex lg:items-center lg:justify-center"
            aria-hidden="true"
          >
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-24 items-center justify-center rounded-2xl bg-primary/15">
                <BarChart3
                  className="size-12 text-primary"
                  aria-hidden="true"
                />
              </div>
              <p className="text-lg font-semibold">Visão completa</p>
              <p className="text-sm text-muted-foreground">
                Gestão de cadastros, estoque e relatórios
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
