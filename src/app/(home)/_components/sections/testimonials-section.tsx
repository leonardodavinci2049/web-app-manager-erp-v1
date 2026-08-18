import { Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { testimonials } from "../landing-content";

export function TestimonialsSection() {
  return (
    <section id="depoimentos" className="bg-muted/50 py-16 sm:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16">
          <Badge className="mb-3 border-amber-500/30 bg-amber-500/10 text-xs text-amber-600 dark:text-amber-400 sm:mb-4 sm:text-sm">
            CONTEÚDO ILUSTRATIVO
          </Badge>
          <h2 className="text-balance text-2xl font-bold sm:mb-3 sm:text-3xl lg:text-4xl">
            O que dizem os usuários
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg lg:text-xl">
            Depoimentos provisórios para demonstração da seção; serão
            substituídos por relatos reais autorizados.
          </p>
        </div>
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <li
              key={testimonial.author + testimonial.role}
              className="flex flex-col rounded-xl border border-border bg-card p-6"
            >
              <Quote
                className="mb-4 size-6 shrink-0 text-primary/60"
                aria-hidden="true"
              />
              <blockquote className="grow text-sm text-pretty text-muted-foreground sm:text-base">
                {testimonial.quote}
              </blockquote>
              <footer className="mt-6 border-t border-border pt-4">
                <p className="text-sm font-semibold">{testimonial.author}</p>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {testimonial.role}
                </p>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
