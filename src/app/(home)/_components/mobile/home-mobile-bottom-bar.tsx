import type { LucideIcon } from "lucide-react";
import { Home, LogIn, MapPin, MessageCircle } from "lucide-react";
import { buildWhatsappUrl } from "../landing-content";

type MobileBarItem = {
  href: string;
  icon: LucideIcon;
  label: string;
  external?: boolean;
  highlighted?: boolean;
};

/**
 * Mobile-only bottom navigation bar with quick shortcuts:
 * home, WhatsApp, location and client area.
 */
export function HomeMobileBottomBar() {
  const whatsappUrl = buildWhatsappUrl();

  const items: MobileBarItem[] = [
    {
      href: "/#inicio",
      icon: Home,
      label: "Início",
    },
    {
      href: whatsappUrl,
      icon: MessageCircle,
      label: "WhatsApp",
      external: true,
    },
    {
      href: "/#localizacao",
      icon: MapPin,
      label: "Localização",
    },
    {
      href: "/sign-in",
      icon: LogIn,
      label: "Área do Cliente",
      highlighted: true,
    },
  ];

  return (
    <nav
      aria-label="Atalhos da página inicial"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-4">
        {items.map((item) => (
          <li key={item.label}>
            <a
              href={item.href}
              {...(item.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className={`flex min-h-[3.25rem] flex-col items-center justify-center gap-1 px-1 py-2 transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none ${
                item.highlighted
                  ? "text-success hover:text-success-hover focus-visible:text-success-hover"
                  : "text-muted-foreground hover:text-foreground focus-visible:text-foreground aria-[current=page]:text-foreground"
              }`}
            >
              <item.icon className="size-5" aria-hidden="true" />
              <span className="text-[0.6875rem] font-medium leading-none">
                {item.label}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
