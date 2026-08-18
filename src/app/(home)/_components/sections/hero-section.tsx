import { ArrowRight, CircleUserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hero, highlights } from "../landing-content";

export function HeroSection() {
  return (
    <section id="inicio" className="bg-linear-to-b from-muted/60 to-background">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Text content */}
          <div className="text-center lg:text-left">
            <Badge className="mb-4 border-primary/20 bg-primary/10 text-xs font-medium text-primary sm:text-sm">
              {hero.badge}
            </Badge>
            <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {hero.titleStart}{" "}
              <span className="text-primary">{hero.titleHighlight}</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-muted-foreground sm:mt-6 sm:text-lg lg:mx-0">
              {hero.description}
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link href={hero.primaryCta.href} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="h-12 w-full px-6 text-base sm:w-auto"
                >
                  {hero.primaryCta.label}
                  <ArrowRight className="size-4 sm:size-5" />
                </Button>
              </Link>
              <Link href={hero.secondaryCta.href} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full bg-transparent px-6 text-base sm:w-auto"
                >
                  <CircleUserRound className="size-4 sm:size-5" />
                  {hero.secondaryCta.label}
                </Button>
              </Link>
            </div>

            {/* Highlights */}
            <ul className="mx-auto mt-10 grid max-w-xl grid-cols-1 gap-4 text-left sm:grid-cols-3 lg:mx-0">
              {highlights.map((item) => (
                <li key={item.title} className="flex items-start gap-2.5">
                  <item.icon
                    className="mt-0.5 size-5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Visual panel */}
          <div className="relative px-4 sm:px-8 lg:px-0">
            <div className="relative mx-auto aspect-[634/800] w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-xl sm:max-w-md lg:max-w-lg">
              <Image
                src="/images/auth/logo-winerp-banner-auth.png"
                alt="Identidade visual do sistema WinERP Gestor"
                fill
                sizes="(min-width: 1024px) 512px, (min-width: 640px) 448px, 384px"
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
