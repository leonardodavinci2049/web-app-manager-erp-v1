"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { updateProductType } from "@/app/actions/action-product-updates";
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
import { usePtypes } from "@/hooks/use-ptypes";

interface ChangeProductTypeDialogProps {
  productId: number;
  currentTypeId: number;
  currentTypeName: string;
  onSuccess?: () => void;
}

/**
 * ChangeProductTypeDialog Component
 *
 * Dialog to change the product type.
 * Allows searching and selecting from available types.
 */
export function ChangeProductTypeDialog({
  productId,
  currentTypeId,
  currentTypeName,
  onSuccess,
}: ChangeProductTypeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { ptypes, isLoading } = usePtypes();

  async function handleChangeType(typeId: number) {
    // Prevent selecting the same type
    if (typeId === currentTypeId) {
      toast.info("Este já é o tipo atual do produto");
      return;
    }

    setIsUpdating(true);

    try {
      const result = await updateProductType(productId, typeId);

      if (result.success) {
        toast.success(
          result.message || "Tipo do produto atualizado com sucesso!",
        );
        setIsOpen(false);
        setSearchTerm("");
        onSuccess?.();
      } else {
        toast.error(result.error || "Erro ao atualizar tipo do produto");
      }
    } catch (_error) {
      toast.error("Erro ao atualizar tipo do produto");
    } finally {
      setIsUpdating(false);
    }
  }

  // Filter types based on search
  const filteredTypes = ptypes.filter((type) => {
    const matchesSearch = type.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Alterar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Alterar Tipo do Produto</DialogTitle>
          <DialogDescription>
            {`Tipo atual: ${currentTypeName}. Selecione um novo tipo para o produto`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar tipos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Types List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
          ) : filteredTypes.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">
                Nenhum tipo encontrado
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] rounded-md border">
              <div className="space-y-1 p-4">
                {filteredTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleChangeType(type.id)}
                    disabled={isUpdating || type.id === currentTypeId}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50 data-[current=true]:bg-muted"
                    data-current={type.id === currentTypeId}
                  >
                    <span className="flex items-center gap-2">
                      <span>{type.name}</span>
                      {type.id === currentTypeId && (
                        <span className="text-xs text-muted-foreground">
                          (Tipo atual)
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ID: {type.id}
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
