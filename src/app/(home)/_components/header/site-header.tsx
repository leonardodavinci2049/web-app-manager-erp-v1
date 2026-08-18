import { CircleUserRound, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ModeToggle from "@/components/theme/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  buildWhatsappUrl,
  company,
  landingNavigation,
} from "../landing-content";

export function SiteHeader() {
  const whatsappUrl = buildWhatsappUrl();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 shadow-sm backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-2 py-3 md:py-4">
          {/* Logo */}
          <Link
            href="/"
            className="inline-flex shrink-0 items-center"
            aria-label={`${company.name} - Página inicial`}
          >
            <div className="relative h-9 w-36 sm:h-11 sm:w-44 md:h-10 md:w-44 lg:h-12 lg:w-48">
              <Image
                src="/images/logo/logo-header.png"
                alt={`${company.name} - WinERP Gestor`}
                fill
                sizes="(min-width: 1024px) 192px, (min-width: 768px) 176px, 160px"
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Desktop anchor navigation */}
          <nav
            aria-label="Navegação da página inicial"
            className="hidden md:block"
          >
            <ul className="flex items-center gap-1 lg:gap-2">
              {landingNavigation.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none lg:px-3"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            <Link href="/sign-in">
              <Button variant="ghost" className="gap-1.5">
                <CircleUserRound className="size-5 md:size-4" />
                <span className="hidden sm:inline">Área do Cliente</span>
                <span className="sm:hidden">Acessar</span>
              </Button>
            </Link>
            <ModeToggle />
            <Link href={whatsappUrl} className="hidden lg:inline-flex">
              <Button className="gap-2">
                <MessageCircle className="size-4" />
                Falar com consultor
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile anchor navigation */}
        <nav aria-label="Navegação da página inicial" className="md:hidden">
          <ul className="-mx-4 flex items-center gap-1.5 overflow-x-auto px-4 pb-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {landingNavigation.map((item) => (
              <li key={item.href} className="shrink-0">
                <a
                  href={item.href}
                  className="inline-block rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
