"use client";

import DOMPurify from "dompurify";
import { Pencil, Save, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateProductDescription } from "@/app/actions/action-product-description";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface ProductDescriptionEditorProps {
  productId: number;
  initialDescription: string | null;
}

export function ProductDescriptionEditor({
  productId,
  initialDescription,
}: ProductDescriptionEditorProps) {
  const MAX_CHARACTERS = 10000;
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(initialDescription || "");
  const [sanitizedHtml, setSanitizedHtml] = useState("");
  const [isPending, startTransition] = useTransition();

  const remainingCharacters = MAX_CHARACTERS - description.length;
  const isOverLimit = description.length > MAX_CHARACTERS;

  // Sanitize HTML on client-side to avoid SSR issues
  useEffect(() => {
    if (description) {
      setSanitizedHtml(DOMPurify.sanitize(description));
    } else {
      setSanitizedHtml("");
    }
  }, [description]);

  // Handle save action
  const handleSave = () => {
    // Validation: check if description exceeds max length
    if (isOverLimit) {
      toast.error(`A descrição não pode exceder ${MAX_CHARACTERS} caracteres`);
      return;
    }

    startTransition(async () => {
      try {
        // Sanitize content before saving
        const sanitizedDescription = DOMPurify.sanitize(description);
        const result = await updateProductDescription(
          productId,
          sanitizedDescription,
        );

        if (result.success) {
          setDescription(sanitizedDescription);
          toast.success(result.message);
          setIsEditing(false);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error("Error saving description:", error);

        // More detailed error message
        if (error instanceof Error) {
          if (error.message.includes("fetch")) {
            toast.error(
              "Erro de conexão: Verifique se o servidor está rodando",
            );
          } else {
            toast.error(`Erro ao salvar: ${error.message}`);
          }
        } else {
          toast.error("Erro inesperado ao salvar descrição");
        }
      }
    });
  };

  // Handle cancel action
  const handleCancel = () => {
    setDescription(initialDescription || "");
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Descrição do Produto</CardTitle>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              disabled={isPending}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Digite a descrição do produto..."
                className="min-h-[200px] resize-y"
                disabled={isPending}
                maxLength={MAX_CHARACTERS + 50}
              />
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`${
                    isOverLimit
                      ? "text-destructive font-medium"
                      : remainingCharacters < 500
                        ? "text-yellow-600 dark:text-yellow-500"
                        : "text-muted-foreground"
                  }`}
                >
                  {isOverLimit
                    ? `${Math.abs(remainingCharacters)} caracteres a mais`
                    : `${remainingCharacters} caracteres restantes`}
                </span>
                <span className="text-muted-foreground">
                  {description.length} / {MAX_CHARACTERS}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSave}
                disabled={isPending || isOverLimit}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                {isPending ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {description ? (
              <div
                className="prose dark:prose-invert max-w-none text-muted-foreground"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: Trusted content for admin dashboard
                dangerouslySetInnerHTML={{
                  __html: sanitizedHtml,
                }}
              />
            ) : (
              <p className="text-muted-foreground italic">
                Nenhuma descrição disponível para este produto.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
