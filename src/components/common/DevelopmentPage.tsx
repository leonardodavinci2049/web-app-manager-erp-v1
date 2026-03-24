import {
  ArrowLeft,
  Clock,
  Code2,
  Coffee,
  Construction,
  Rocket,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { GitHubIcon } from "@/app/(auth)/components/GitHubIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DevelopmentPage = () => {
  return (
    <div className="from-background via-muted/20 to-background flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header com animação */}
        <div className="space-y-4 text-center">
          <div className="relative inline-flex">
            <Construction className="text-primary h-20 w-20 animate-bounce" />
            <div className="absolute -top-1 -right-1">
              <Badge variant="secondary" className="animate-pulse">
                Beta
              </Badge>
            </div>
          </div>
          <h1 className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
            Em Desenvolvimento
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
            Esta página está sendo construída com muito cuidado e atenção aos
            detalhes. Em breve estará disponível com uma experiência incrível!
          </p>
        </div>

        {/* Cards informativos */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="transition-shadow duration-300 hover:shadow-lg">
            <CardHeader className="text-center">
              <Rocket className="mx-auto mb-2 h-12 w-12 text-blue-500" />
              <CardTitle className="text-lg">
                Funcionalidades Avançadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center text-sm">
                Estamos implementando recursos modernos e intuitivos para
                proporcionar a melhor experiência possível.
              </p>
            </CardContent>
          </Card>

          <Card className="transition-shadow duration-300 hover:shadow-lg">
            <CardHeader className="text-center">
              <Code2 className="mx-auto mb-2 h-12 w-12 text-green-500" />
              <CardTitle className="text-lg">Tecnologias Modernas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center text-sm">
                Desenvolvido com Next.js 15, TypeScript, Tailwind CSS e as
                melhores práticas do mercado.
              </p>
            </CardContent>
          </Card>

          <Card className="transition-shadow duration-300 hover:shadow-lg md:col-span-2 lg:col-span-1">
            <CardHeader className="text-center">
              <Zap className="mx-auto mb-2 h-12 w-12 text-yellow-500" />
              <CardTitle className="text-lg">Alta Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center text-sm">
                Interface otimizada, responsiva e acessível, garantindo rapidez
                e eficiência em todos os dispositivos.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status do desenvolvimento */}
        <Card className="from-primary/10 to-secondary/10 border-primary/20 bg-gradient-to-r">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Clock className="text-primary h-6 w-6" />
              <CardTitle className="text-xl">
                Status do Desenvolvimento
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Interface de Usuário
                </span>
                <Badge variant="default">95% Concluído</Badge>
              </div>
              <div className="bg-muted h-2 w-full rounded-full">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: "95%" }}
                ></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Funcionalidades Backend
                </span>
                <Badge variant="secondary">78% Concluído</Badge>
              </div>
              <div className="bg-muted h-2 w-full rounded-full">
                <div
                  className="bg-secondary h-2 rounded-full"
                  style={{ width: "78%" }}
                ></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Testes & Otimização</span>
                <Badge variant="outline">65% Concluído</Badge>
              </div>
              <div className="bg-muted h-2 w-full rounded-full">
                <div
                  className="bg-accent h-2 rounded-full"
                  style={{ width: "65%" }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline estimada */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Coffee className="h-5 w-5" />
              Previsão de Lançamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 text-center md:grid-cols-3">
              <div className="space-y-2">
                <div className="mx-auto w-fit rounded-full bg-blue-500/10 p-3">
                  <Code2 className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-semibold">Desenvolvimento</h3>
                <p className="text-muted-foreground text-sm">
                  Finalização das funcionalidades principais
                </p>
                <Badge variant="secondary">Em andamento</Badge>
              </div>

              <div className="space-y-2">
                <div className="mx-auto w-fit rounded-full bg-orange-500/10 p-3">
                  <Zap className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="font-semibold">Testes</h3>
                <p className="text-muted-foreground text-sm">
                  Validação e otimização de performance
                </p>
                <Badge variant="outline">Próximo</Badge>
              </div>

              <div className="space-y-2">
                <div className="mx-auto w-fit rounded-full bg-green-500/10 p-3">
                  <Rocket className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="font-semibold">Lançamento</h3>
                <p className="text-muted-foreground text-sm">
                  Disponibilização para produção
                </p>
                <Badge variant="default">Em breve</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações do usuário */}
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild variant="outline" className="group">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
              Voltar ao Dashboard
            </Link>
          </Button>
          <Button variant="default" className="group">
            <GitHubIcon className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
            Acompanhar Progresso
          </Button>
        </div>

        {/* Footer */}
        <div className="text-muted-foreground pt-8 text-center text-sm">
          <p>
            Nossa equipe está trabalhando incansavelmente para entregar a melhor
            experiência.
          </p>
          <p className="mt-1">
            Agradecemos sua paciência!
            <span className="ml-1 inline-block animate-pulse">💙</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DevelopmentPage;
