import type { Metadata } from "next";
import { AuthPageCard } from "../components/auth-page-card";
import ForgotPasswordForm from "./components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthPageCard>
      <ForgotPasswordForm />
    </AuthPageCard>
  );
}
