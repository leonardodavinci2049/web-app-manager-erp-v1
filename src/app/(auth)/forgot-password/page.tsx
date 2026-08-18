import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import ForgotPasswordForm from "./components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex w-full items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <Card className="w-full max-w-md gap-8 border-white/70 bg-card/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.14)] backdrop-blur-sm sm:p-8 dark:border-border">
        <ForgotPasswordForm />
      </Card>
    </div>
  );
}
