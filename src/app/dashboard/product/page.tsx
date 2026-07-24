import { redirect } from "next/navigation";

/**
 * Redirect page for /dashboard/product
 * Automatically redirects to /dashboard/catalog to avoid 404 errors
 * This ensures proper navigation flow when users access the base product route
 */
export default function ProductPage() {
  // Immediately redirect to the catalog page
  redirect("/dashboard/catalog");
}
