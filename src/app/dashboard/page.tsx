import { redirect } from "next/navigation";

export default function ProductPage() {
  // Immediately redirect to the catalog page
  redirect("/dashboard/report/panel");
}
