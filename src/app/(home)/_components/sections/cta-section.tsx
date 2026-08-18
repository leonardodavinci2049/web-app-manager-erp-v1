import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buildWhatsappUrl, cta } from "../landing-content";

export function CtaSection() {
  const whatsappUrl = buildWhatsappUrl();

  return (
    <section className="bg-linear-to-r from-primary to-primary/80 py-16 text-primary-foreground sm:py-20">
      <div className="container mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-balance text-2xl font-bold sm:mb-3 sm:text-3xl lg:text-4xl">
          {cta.title}
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-pretty text-base opacity-90 sm:mb-10 sm:text-lg lg:text-xl">
          {cta.description}
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <Link href={whatsappUrl} className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="secondary"
              className="h-12 w-full px-6 text-base sm:w-auto sm:px-8"
            >
              Falar com um consultor
              <ArrowRight className="size-4 sm:size-5" />
            </Button>
          </Link>
          <Link href="#contato" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full border-primary-foreground/40 bg-transparent px-6 text-base text-primary-foreground hover:bg-primary-foreground hover:text-primary sm:w-auto sm:px-8"
            >
              Enviar mensagem
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
