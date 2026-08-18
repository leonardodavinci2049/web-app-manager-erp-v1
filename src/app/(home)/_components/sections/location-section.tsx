import { Clock, Info, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { company, location } from "../landing-content";

export function LocationSection() {
  return (
    <section id="localizacao" className="py-16 sm:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center sm:mb-12">
          <h2 className="text-balance text-2xl font-bold sm:mb-3 sm:text-3xl lg:text-4xl">
            Nossa localização
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg lg:text-xl">
            Estamos disponíveis para atendimento on-line e presencial
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 sm:gap-12 lg:grid-cols-2">
          {/* Map */}
          <div className="order-2 lg:order-1">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
              <iframe
                src={location.mapsEmbedUrl}
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[300px] w-full sm:h-[350px] lg:h-[400px]"
                title={`Mapa com a localização da ${company.name}`}
              />
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              <a
                href={location.mapsExternalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                Abrir no Google Maps
              </a>{" "}
              em uma nova aba.
            </p>
          </div>

          {/* Info */}
          <div className="order-1 space-y-6 lg:order-2 lg:space-y-8">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:size-12">
                  <MapPin
                    className="size-5 text-primary sm:size-6"
                    aria-hidden="true"
                  />
                </span>
                <div>
                  <h3 className="mb-1 text-sm font-semibold sm:text-base">
                    Endereço
                    <span className="sr-only"> (provisório)</span>
                  </h3>
                  <p className="text-sm whitespace-pre-line text-muted-foreground sm:text-base">
                    {company.name}
                    {"\n"}
                    {location.address}
                    {"\n"}
                    {location.city}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:size-12">
                  <Clock
                    className="size-5 text-primary sm:size-6"
                    aria-hidden="true"
                  />
                </span>
                <div>
                  <h3 className="mb-1 text-sm font-semibold sm:text-base">
                    Horário de atendimento
                  </h3>
                  <div className="space-y-1 text-sm text-muted-foreground sm:text-base">
                    <p>Segunda a sexta: 8h às 18h</p>
                    <p>Sábado: 8h às 12h</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 flex-1">
                <a
                  href={location.mapsExternalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="size-4 sm:size-5" />
                  Abrir no Google Maps
                </a>
              </Button>
            </div>

            <Card className="border-dashed">
              <CardContent className="flex items-start gap-3 p-4 sm:p-6">
                <Badge
                  variant="outline"
                  className="shrink-0 gap-1.5 border-amber-500/40 bg-amber-500/10 text-xs text-amber-600 dark:text-amber-400"
                >
                  <Info className="size-3.5" aria-hidden="true" />
                  PROVISÓRIO
                </Badge>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Endereço e horários ilustrativos para demonstração da seção.
                  Substitua pelos dados oficiais da empresa antes de publicar.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
