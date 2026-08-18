import { Mail, MessageCircle, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ContactForm } from "../contact/contact-form";
import { company, contactChannels } from "../landing-content";

export function ContactSection() {
  const channels = [
    {
      icon: MessageCircle,
      title: contactChannels.whatsapp.label,
      info: company.whatsapp,
      href: contactChannels.whatsapp.href,
      external: true,
    },
    {
      icon: Phone,
      title: contactChannels.phone.label,
      info: company.phone,
      href: contactChannels.phone.href,
      external: false,
    },
    {
      icon: Mail,
      title: contactChannels.email.label,
      info: company.email,
      href: contactChannels.email.href,
      external: false,
    },
  ] as const;

  return (
    <section id="contato" className="bg-muted/50 py-16 sm:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="text-balance text-2xl font-bold sm:mb-3 sm:text-3xl lg:text-4xl">
            Entre em contato
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg lg:text-xl">
            Nossa equipe está pronta para apresentar a melhor solução para o seu
            negócio
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 sm:gap-12 lg:grid-cols-5">
          {/* Channels */}
          <div className="space-y-4 lg:col-span-2">
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {channels.map((channel) => (
                <li key={channel.title}>
                  <Card className="h-full border-border">
                    <CardContent className="flex items-center gap-4 p-4 sm:p-5 lg:items-start">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <channel.icon
                          className="size-5 text-primary"
                          aria-hidden="true"
                        />
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold">
                          {channel.title}
                        </h3>
                        <a
                          href={channel.href}
                          {...(channel.external
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                          className="text-sm break-words text-muted-foreground transition-colors hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                        >
                          {channel.info}
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>

            <Card className="border-dashed">
              <CardContent className="p-4 text-sm text-muted-foreground sm:p-5">
                <p>
                  Prefere falar agora? Clique em um dos canais acima ou use o
                  formulário ao lado — respondemos o mais breve possível em
                  horário comercial.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <Card className="lg:col-span-3">
            <CardContent className="p-6 sm:p-8">
              <h3 className="mb-1.5 text-lg font-semibold">
                Envie sua mensagem
              </h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Preencha os campos abaixo e fale com um consultor.
              </p>
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
