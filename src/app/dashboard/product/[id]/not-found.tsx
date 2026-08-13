"use client";

import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-6 py-6">
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-center min-h-100">
              <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-destructive/10 p-3">
                      <AlertCircle className="h-8 w-8 text-destructive" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">
                    Produto Não Encontrado
                  </CardTitle>
                  <CardDescription>
                    O produto que você está procurando não foi encontrado ou
                    pode ter sido removido.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <Button asChild className="w-full">
                    <Link href="/dashboard/product">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Voltar para Catálogo
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/dashboard">Ir para Dashboard</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
