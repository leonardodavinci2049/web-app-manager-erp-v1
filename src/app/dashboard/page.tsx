import {
  Archive,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bolt,
  Factory,
  LayoutGrid,
  Mail,
  PackageSearch,
  ShieldCheck,
  ShoppingCart,
  Tags,
  TriangleAlert,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { getAuthContext } from "@/server/auth-context";
import { SiteHeaderWithBreadcrumb } from "./_components/header/site-header-with-breadcrumb";

const modules = [
  {
    title: "Catálogo de Produtos",
    description: "Consulte e organize o catálogo principal de produtos.",
    href: "/dashboard/product/catalog",
    icon: PackageSearch,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "group-hover:border-blue-500/50",
  },
  {
    title: "Cadastro de Categorias",
    description: "Gerencie categorias e agrupamentos usados no catálogo.",
    href: "/dashboard/category/category-overviews",
    icon: Tags,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "group-hover:border-blue-500/50",
  },
  {
    title: "Cadastro de Clientes",
    description: "Acesse o cadastro de clientes e acompanhe o relacionamento.",
    href: "/dashboard/customer/customer-list",
    icon: Users,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "group-hover:border-amber-500/50",
  },
  {
    title: "Marcas",
    description: "Área de marcas em manutenção e evolução contínua.",
    href: "/dashboard/development",
    icon: BadgeCheck,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "group-hover:border-emerald-500/50",
  },
  {
    title: "Fornecedores",
    description: "Cadastros e integrações de fornecedores em manutenção.",
    href: "/dashboard/development",
    icon: Factory,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "group-hover:border-indigo-500/50",
  },
  {
    title: "Transportadoras",
    description:
      "Gerencie transportadoras e entregas quando o módulo estiver disponível.",
    href: "/dashboard/development",
    icon: Truck,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "group-hover:border-purple-500/50",
  },
  {
    title: "Entradas de Produtos",
    description: "Controle entradas e abastecimento com módulo em manutenção.",
    href: "/dashboard/development",
    icon: Archive,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    borderColor: "group-hover:border-rose-500/50",
  },
  {
    title: "Compras",
    description: "Fluxo de compras e reposição em manutenção nesta versão.",
    href: "/dashboard/development",
    icon: ShoppingCart,
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    borderColor: "group-hover:border-sky-500/50",
  },
  {
    title: "Relatórios",
    description: "Acompanhe indicadores, consultas e painéis analíticos.",
    href: "/dashboard/report/panel",
    icon: BarChart3,
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    borderColor: "group-hover:border-slate-500/50",
  },
];

const quickInfoItems = [
  {
    title:
      "Catálogo, categorias e clientes já possuem acesso direto na área principal.",
    icon: Bolt,
    color: "text-amber-500",
  },
  {
    title: "Seus dados permanecem protegidos com autenticação e sessão ativa.",
    icon: ShieldCheck,
    color: "text-emerald-500",
  },
  {
    title:
      "Relatórios ficam centralizados para consulta rápida de indicadores.",
    icon: BarChart3,
    color: "text-sky-500",
  },
  {
    title:
      "Marcas, fornecedores, transportadoras, entradas e compras seguem apontando para manutenção.",
    icon: Wrench,
    color: "text-teal-500",
  },
];

function getInitials(name?: string | null) {
  if (!name) return "US";

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "US";
}

function formatRole(role?: string | null) {
  if (!role) return "Usuário";

  return role
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());
}

export default async function DashboardPage() {
  const { session, authWarning } = await getAuthContext();

  const { user } = session;
  const firstName = user?.name?.split(" ")[0] || "Vendedor";
  const userInitials = getInitials(user?.name);
  const userRole = formatRole(user?.role);

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(148,163,184,0.1),transparent_20%)]" />

      <SiteHeaderWithBreadcrumb
        title="Início"
        breadcrumbItems={[{ label: "Início", isActive: true }]}
      />

      <main className="mx-auto flex w-full max-w-350 flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
        {authWarning ? (
          <Alert className="border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-100">
            <TriangleAlert className="text-amber-600 dark:text-amber-300" />
            <AlertTitle>{authWarning.title}</AlertTitle>
            <AlertDescription className="text-amber-900/80 dark:text-amber-100/80">
              {authWarning.description}
            </AlertDescription>
          </Alert>
        ) : null}

        <Card className="overflow-hidden border-border/60 bg-linear-to-br from-card via-card to-muted/30 shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-500">
          <CardContent className="relative px-6 py-6 sm:px-8 sm:py-7">
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-40 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_65%)] lg:block" />

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4 sm:gap-5">
                <Avatar className="size-16 border border-border/60 shadow-sm sm:size-20">
                  <AvatarImage
                    src={user.image ?? ""}
                    alt={user.name ?? firstName}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold sm:text-xl">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                      Olá, {firstName}!
                    </h1>
                    <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                      Bem-vindo ao painel principal. Acesse catálogo,
                      categorias, clientes, relatórios e os demais módulos
                      centrais do sistema a partir deste índice.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="gap-1.5 rounded-full px-3 py-1">
                      <BadgeCheck className="size-3.5" />
                      {userRole}
                    </Badge>

                    {user.email ? (
                      <Badge
                        variant="outline"
                        className="gap-1.5 rounded-full border-border/60 px-3 py-1 text-muted-foreground"
                      >
                        <Mail className="size-3.5" />
                        {user.email}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-3xl border border-border/60 bg-background/70 p-4 shadow-sm backdrop-blur sm:min-w-56 lg:justify-center">
                <div className="space-y-1 lg:hidden">
                  <p className="text-sm font-medium text-foreground">
                    {modules.length} módulos disponíveis
                  </p>
                  <p className="text-xs text-muted-foreground">
                    atalhos e áreas principais do sistema
                  </p>
                </div>

                <div className="hidden lg:block lg:space-y-3">
                  <div className="mx-auto flex size-18 items-center justify-center rounded-2xl bg-muted text-foreground shadow-inner">
                    <LayoutGrid className="size-8 stroke-[1.75]" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      {modules.length} módulos disponíveis
                    </p>
                    <p className="text-xs text-muted-foreground">
                      índice principal do sistema
                    </p>
                  </div>
                </div>

                <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-foreground shadow-inner lg:hidden">
                  <LayoutGrid className="size-6 stroke-[1.75]" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Módulos principais
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              Escolha um dos módulos abaixo para continuar o trabalho.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((mod) => (
              <Link
                key={mod.title}
                href={mod.href}
                prefetch={false}
                className="group block h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Card
                  className={`relative flex h-full flex-col overflow-hidden border-border/60 bg-card/70 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 ${mod.borderColor}`}
                >
                  <CardHeader className="items-center pb-2">
                    <div className="flex items-center justify-center">
                      <div
                        className={`rounded-2xl p-3.5 shadow-inner ${mod.bgColor} ${mod.color}`}
                      >
                        <mod.icon className="h-6 w-6 stroke-[1.75] md:h-7 md:w-7" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex grow flex-col justify-end space-y-2 pt-2">
                    <CardTitle className="text-lg font-semibold tracking-tight text-foreground/90 md:text-[1.15rem]">
                      {mod.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-sm leading-relaxed font-medium text-muted-foreground opacity-85">
                      {mod.description}
                    </CardDescription>

                    <div className="pt-3">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground/80 transition-transform duration-300 group-hover:translate-x-1">
                        Abrir módulo
                        <ArrowRight className="size-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 pb-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-border/60 bg-card/70 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <CardHeader className="space-y-1 pb-3">
              <CardTitle className="flex items-center gap-2 text-xl tracking-tight">
                <Bolt className="size-5 text-amber-500" />
                Informações rápidas
              </CardTitle>
              <CardDescription>
                Resumo objetivo sobre os acessos principais desta versão.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickInfoItems.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 rounded-2xl border border-transparent px-1 py-1"
                >
                  <div className={`mt-0.5 ${item.color}`}>
                    <item.icon className="size-4.5" />
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground sm:text-[0.95rem]">
                    {item.title}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/70 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <CardHeader className="space-y-1 pb-3">
              <CardTitle className="flex items-center gap-2 text-xl tracking-tight">
                <LayoutGrid className="size-5 text-foreground/80" />
                Acesso rápido
              </CardTitle>
              <CardDescription>
                Os mesmos módulos principais organizados como lista de atalhos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {modules.map((mod, index) => (
                <Link
                  key={mod.title}
                  href={mod.href}
                  prefetch={false}
                  className="group block rounded-2xl outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div
                    className={`flex items-start gap-3 px-3 py-3 ${
                      index < modules.length - 1
                        ? "border-b border-border/50"
                        : ""
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${mod.bgColor} ${mod.color}`}
                    >
                      <mod.icon className="size-4.5 stroke-[1.75]" />
                    </div>

                    <div className="min-w-0 grow">
                      <p className="text-sm font-medium text-foreground">
                        {mod.title}
                      </p>
                      <p className="line-clamp-1 text-xs text-muted-foreground sm:text-sm">
                        {mod.description}
                      </p>
                    </div>

                    <ArrowRight className="mt-1 size-4 shrink-0 text-foreground/40 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
