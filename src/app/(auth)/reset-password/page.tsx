import type { Metadata } from "next";
import { AuthPageCard } from "../components/auth-page-card";
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
    <AuthPageCard>
      {token ? (
        <ResetPasswordUI token={token} />
      ) : (
        <div role="alert" className="text-center text-sm text-destructive">
          Token está ausente.
        </div>
      )}
    </AuthPageCard>
  );
}

interface ResetPasswordUIProps {
  token: string;
}

function ResetPasswordUI({ token }: ResetPasswordUIProps) {
  return <ResetPasswordForm token={token} />;
}
