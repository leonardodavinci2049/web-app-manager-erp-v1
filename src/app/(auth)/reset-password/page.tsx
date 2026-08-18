import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Redefinir senha",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return (
    <div className="flex w-full items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      {token ? (
        <ResetPasswordUI token={token} />
      ) : (
        <Card className="w-full max-w-md border-white/70 bg-card/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.14)] backdrop-blur-sm sm:p-8 dark:border-border">
          <div role="alert" className="text-center text-destructive">
            Token está ausente.
          </div>
        </Card>
      )}
    </div>
  );
}

interface ResetPasswordUIProps {
  token: string;
}

function ResetPasswordUI({ token }: ResetPasswordUIProps) {
  return (
    <Card className="w-full max-w-md gap-8 border-white/70 bg-card/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.14)] backdrop-blur-sm sm:p-8 dark:border-border">
      <ResetPasswordForm token={token} />
    </Card>
  );
}
