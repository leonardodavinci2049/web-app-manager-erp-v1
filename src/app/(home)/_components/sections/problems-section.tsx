import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { problems } from "../landing-content";

export function ProblemsSection() {
  return (
    <section id="problemas" className="bg-muted/50 py-16 sm:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="text-balance text-2xl font-bold sm:mb-3 sm:text-3xl lg:text-4xl">
            Problemas que o sistema resolve
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg lg:text-xl">
            A rotina administrativa fica mais simples quando a informação
            confiável está em um só lugar
          </p>
        </div>
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((problem) => (
            <li
              key={problem.title}
              className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle
                    className="size-4.5 text-destructive"
                    aria-hidden="true"
                  />
                </span>
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2
                    className="size-4.5 text-primary"
                    aria-hidden="true"
                  />
                </span>
              </div>
              <h3 className="mb-2 text-base font-semibold">{problem.title}</h3>
              <p className="text-sm text-muted-foreground">
                {problem.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
