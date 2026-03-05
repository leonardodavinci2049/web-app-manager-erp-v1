"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { updateProductBrand } from "@/app/actions/action-product-updates";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBrands } from "@/hooks/use-brands";

interface ChangeProductBrandDialogProps {
  productId: number;
  currentBrandId: number;
  currentBrandName: string;
  onSuccess?: () => void;
}

export function ChangeProductBrandDialog({
  productId,
  currentBrandId,
  currentBrandName,
  onSuccess,
}: ChangeProductBrandDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { brands, isLoading } = useBrands();

  async function handleChangeBrand(brandId: number) {
    if (brandId === currentBrandId) {
      toast.info("Esta já é a marca atual do produto");
      return;
    }

    setIsUpdating(true);

    try {
      const result = await updateProductBrand(productId, brandId);

      if (result.success) {
        toast.success(
          result.message || "Marca do produto atualizada com sucesso!",
        );
        setIsOpen(false);
        setSearchTerm("");
        onSuccess?.();
      } else {
        toast.error(result.error || "Erro ao atualizar marca do produto");
      }
    } catch (_error) {
      toast.error("Erro ao atualizar marca do produto");
    } finally {
      setIsUpdating(false);
    }
  }

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Alterar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Alterar Marca do Produto</DialogTitle>
          <DialogDescription>
            {`Marca atual: ${currentBrandName}. Selecione uma nova marca para o produto`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar marcas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
          ) : filteredBrands.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">
                Nenhuma marca encontrada
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] rounded-md border">
              <div className="space-y-1 p-4">
                {filteredBrands.map((brand) => (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => handleChangeBrand(brand.id)}
                    disabled={isUpdating || brand.id === currentBrandId}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50 data-[current=true]:bg-muted"
                    data-current={brand.id === currentBrandId}
                  >
                    <span className="flex items-center gap-2">
                      <span>{brand.name}</span>
                      {brand.id === currentBrandId && (
                        <span className="text-xs text-muted-foreground">
                          (Marca atual)
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ID: {brand.id}
                    </span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              setSearchTerm("");
            }}
            disabled={isUpdating}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
