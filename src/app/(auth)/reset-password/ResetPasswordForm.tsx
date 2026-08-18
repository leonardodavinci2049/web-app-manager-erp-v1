"use client";

import { LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";

import {
  type ResetPasswordFormData,
  validateResetPasswordData,
} from "../_common-validations/validation";
import { AuthFormHeader } from "../components/auth-form-header";

interface ResetPasswordFormProps {
  token: string;
}

const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Gerar ID único para cada instância do componente usando useId (SSR-safe)
  const formId = useId();

  // Função para validar o formulário
  const validateForm = (
    formData: FormData,
  ): { isValid: boolean; data?: ResetPasswordFormData } => {
    const rawData = {
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    const validation = validateResetPasswordData(rawData);

    if (!validation.success) {
      setErrors(validation.errors || {});
      return { isValid: false };
    }

    setErrors({});
    return { isValid: true, data: validation.data || undefined };
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
      const { error } = await authClient.resetPassword({
        newPassword: validation.data.password,
        token,
      });

      if (error) {
        // Tratar diferentes tipos de erro
        if (
          error.message?.includes("Invalid token") ||
          error.message?.includes("Token expired")
        ) {
          toast.error(
            "Link de recuperação inválido ou expirado. Solicite um novo link.",
          );
        } else {
          toast.error(
            error.message || "Erro ao redefinir a senha. Tente novamente.",
          );
        }
      } else {
        toast.success("Senha redefinida com sucesso!");
        // Redirecionar para login após sucesso
        router.push("/sign-in");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("Erro ao redefinir a senha. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <AuthFormHeader
        icon={LockKeyhole}
        title="Redefinir senha"
        description="Crie uma nova senha para recuperar o acesso à sua conta."
      />

      <div className="grid gap-6">
        <form onSubmit={onSubmit} className="grid gap-6">
          <div className="grid gap-2.5">
            <Label htmlFor={`newPassword-${formId}`}>Nova senha</Label>
            <Input
              id={`newPassword-${formId}`}
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
              aria-invalid={Boolean(errors?.password)}
              className={cn(
                "h-12 rounded-lg bg-background px-3.5 shadow-xs",
                errors?.password &&
                  "border-destructive focus-visible:ring-destructive",
              )}
            />
            {errors?.password && (
              <p className="text-destructive text-sm">{errors.password}</p>
            )}
          </div>

          <div className="grid gap-2.5">
            <Label htmlFor={`confirmPassword-${formId}`}>Confirmar senha</Label>
            <Input
              id={`confirmPassword-${formId}`}
              name="confirmPassword"
              type="password"
              placeholder="Confirme sua senha"
              required
              autoComplete="new-password"
              aria-invalid={Boolean(errors?.confirmPassword)}
              className={cn(
                "h-12 rounded-lg bg-background px-3.5 shadow-xs",
                errors?.confirmPassword &&
                  "border-destructive focus-visible:ring-destructive",
              )}
            />
            {errors?.confirmPassword && (
              <p className="text-destructive text-sm">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-lg shadow-sm"
            disabled={isLoading}
          >
            {isLoading ? "Redefinindo..." : "Redefinir senha"}
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

      {/* Token oculto para debugging */}
      <input type="hidden" value={token} />
    </div>
  );
};

export default ResetPasswordForm;
