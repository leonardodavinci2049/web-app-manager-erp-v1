import { Truck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CarrierNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <Truck className="text-muted-foreground mb-4 size-14" />
      <h1 className="text-xl font-semibold">Transportadora não encontrada</h1>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        O cadastro não existe ou não está acessível para a organização atual.
      </p>
      <Button asChild variant="outline" className="mt-5">
        <Link href="/dashboard/carriers">Voltar às transportadoras</Link>
      </Button>
    </div>
  );
}
