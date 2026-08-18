"use client";

import { KeyRound } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";
import {
  type ForgotPasswordFormData,
  forgotPasswordSchema,
} from "../../_common-validations/validation";
import { AuthFormHeader } from "../../components/auth-form-header";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Gerar ID único para cada instância do componente usando useId (SSR-safe)
  const formId = useId();

  // Função para validar o formulário
  const validateForm = (
    formData: FormData,
  ): { isValid: boolean; data?: ForgotPasswordFormData } => {
    const rawData = {
      email: formData.get("email") as string,
    };

    try {
      const validatedData = forgotPasswordSchema.parse(rawData);
      setErrors({});
      return { isValid: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.issues.reduce(
          (acc: Record<string, string>, err) => {
            const field = err.path[0] as string;
            acc[field] = err.message;
            return acc;
          },
          {},
        );
        setErrors(formattedErrors);
        return { isValid: false };
      }

      setErrors({ general: "Erro de validação inesperado." });
      return { isValid: false };
    }
  };

  // Função onSubmit do lado do cliente
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const validation = validateForm(formData);

    if (!validation.isValid || !validation.data) {
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await authClient.requestPasswordReset({
        email: validation.data.email,
        redirectTo: "/reset-password",
      });

      if (error) {
        console.error("Forgot password error:", error);

        if (
          !error.message?.includes("User not found") &&
          !error.message?.includes("Email not found")
        ) {
          toast.error("Erro interno do sistema. Tente novamente mais tarde.");
          return;
        }
      }

      toast.success(
        "Se este email estiver registrado, você receberá instruções de recuperação em breve.",
      );

      (event.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("Erro interno do sistema. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      <AuthFormHeader
        icon={KeyRound}
        title="Recuperar senha"
        description="Digite seu email para receber as instruções de recuperação."
      />

      <div className="grid gap-6">
        <form onSubmit={onSubmit} className="grid gap-6">
          <div className="grid gap-2.5">
            <Label htmlFor={`email-${formId}`}>Email</Label>
            <Input
              id={`email-${formId}`}
              name="email"
              type="email"
              placeholder="seu@email.com"
              required
              autoComplete="email"
              aria-invalid={Boolean(errors?.email)}
              className={cn(
                "h-12 rounded-lg bg-background px-3.5 shadow-xs",
                errors?.email &&
                  "border-destructive focus-visible:ring-destructive",
              )}
            />
            {errors?.email && (
              <p className="text-destructive text-sm">{errors.email}</p>
            )}
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-lg shadow-sm"
            disabled={isLoading}
          >
            {isLoading ? "Enviando..." : "Enviar instruções"}
          </Button>
        </form>
      </div>

      <div className="border-t pt-6 text-center text-sm">
        <a
          href="/sign-in"
          className="font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Voltar para o login
        </a>
      </div>
    </div>
  );
}

export default ForgotPasswordForm;
