import { ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ModeToggle from "@/components/theme/mode-toggle";
import { publicEnvs } from "@/core/config/envs.client";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const appName = publicEnvs.NEXT_PUBLIC_APP_NAME || "Manager ERP";
  const companyName = publicEnvs.NEXT_PUBLIC_COMPANY_NAME || "WinERP";

  return (
    <div className="relative min-h-svh overflow-hidden bg-muted/30 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(30rem,0.95fr)] dark:bg-background">
      <aside className="relative hidden overflow-hidden bg-stone-950 text-white lg:flex lg:min-h-svh lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        <Image
          src="/images/auth/background-auth.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 55vw, 0px"
          className="object-cover opacity-70"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(145deg,rgba(12,10,9,0.1),rgba(12,10,9,0.55)_58%,rgba(12,10,9,0.88))]"
        />

        <Link
          href="/"
          aria-label="Ir para a página inicial"
          className="relative z-10 w-fit rounded-2xl bg-white/95 px-5 py-3 shadow-2xl shadow-black/20 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <Image
            src="/images/logo/logo-header.png"
            alt={companyName}
            width={800}
            height={288}
            className="h-14 w-auto xl:h-16"
          />
        </Link>

        <div className="relative z-10 max-w-xl">
          <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
            <ShieldCheck aria-hidden="true" className="size-4" />
            Ambiente administrativo
          </div>
          <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-balance xl:text-5xl">
            Acesso ao ambiente de gestão
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-white/65">
            Entre ou gerencie sua senha para continuar no {appName}.
          </p>
        </div>

        <p className="relative z-10 text-xs text-white/45">
          © {companyName}. Todos os direitos reservados.
        </p>
      </aside>

      <section className="relative flex min-h-svh min-w-0 flex-col">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,113,108,0.12),transparent_32%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_30%)]"
        />

        <header className="relative z-10 flex h-20 shrink-0 items-center justify-between px-5 sm:px-8 lg:justify-end">
          <Link
            href="/"
            aria-label="Ir para a página inicial"
            className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring lg:hidden"
          >
            <Image
              src="/images/logo/logo-header.png"
              alt={companyName}
              width={800}
              height={288}
              priority
              className="h-10 w-auto sm:h-12"
            />
          </Link>

          <ModeToggle />
        </header>

        <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-8 sm:py-10">
          <div className="w-full max-w-md">
            <p className="mb-6 px-1 text-2xl font-semibold tracking-tight text-balance lg:hidden">
              Acesso ao ambiente de gestão
            </p>

            {children}
          </div>
        </main>

        <p className="relative z-10 px-5 pb-6 text-center text-xs text-muted-foreground lg:hidden">
          © {companyName}. Todos os direitos reservados.
        </p>
      </section>
    </div>
  );
}
