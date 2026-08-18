import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { cacheLife } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { CustomerAreaButton } from "../customer-area-button";
import {
  buildWhatsappUrl,
  company,
  landingNavigation,
  location,
} from "../landing-content";

async function getCurrentYear(): Promise<number> {
  "use cache";
  cacheLife("daily");
  return new Date().getFullYear();
}

export async function SiteFooter() {
  const whatsappUrl = buildWhatsappUrl();
  const year = await getCurrentYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center"
              aria-label={`${company.name} - Página inicial`}
            >
              <div className="relative h-10 w-40">
                <Image
                  src="/images/logo/logo-footer.png"
                  alt={`${company.name} - WinERP Gestor`}
                  fill
                  sizes="160px"
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Sistema de gestão on-line para cadastros, compras, entradas,
              saídas e relatórios administrativos do seu negócio.
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Navegação do rodapé">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Navegação
            </h2>
            <ul className="space-y-3">
              {landingNavigation.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Contato
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <p className="text-sm whitespace-pre-line text-muted-foreground">
                  {location.address}
                  {"\n"}
                  {location.city}
                </p>
              </li>
              <li className="flex items-center gap-3">
                <Phone
                  className="size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <a
                  href={`tel:${company.phone.replace(/\D/g, "")}`}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  {company.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail
                  className="size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <a
                  href={`mailto:${company.email}`}
                  className="text-sm break-all text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  {company.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle
                  className="size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  WhatsApp
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <p className="text-sm text-muted-foreground">
                  Segunda a sexta: 8h às 18h
                </p>
              </li>
            </ul>
          </div>

          {/* Client area */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Sistema
            </h2>
            <p className="text-sm text-muted-foreground">
              Já é cliente? Acesse o WinERP Gestor e continue de onde parou.
            </p>
            <Link href="/sign-in">
              <CustomerAreaButton className="w-full sm:w-auto">
                Área do Cliente
              </CustomerAreaButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-border">
        <div className="container mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-muted-foreground sm:text-sm">
            &copy; {year} {company.name}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
