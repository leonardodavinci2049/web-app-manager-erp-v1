import { Badge } from "@/components/ui/badge";
import { modules } from "../landing-content";

export function ModulesSection() {
  return (
    <section id="recursos" className="py-16 sm:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16">
          <Badge className="mb-3 border-primary/20 bg-primary/10 text-xs text-primary sm:mb-4 sm:text-sm">
            MÓDULOS DO SISTEMA
          </Badge>
          <h2 className="text-balance text-2xl font-bold sm:mb-3 sm:text-3xl lg:text-4xl">
            Recursos do WinERP Gestor
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg lg:text-xl">
            Do cadastro ao relatório, tudo o que você precisa para administrar a
            operação
          </p>
        </div>
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <li
              key={module.title}
              className="group rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                <module.icon
                  className="size-5.5 text-primary"
                  aria-hidden="true"
                />
              </div>
              <h3 className="mb-2 text-base font-semibold">{module.title}</h3>
              <p className="text-sm text-muted-foreground">
                {module.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
