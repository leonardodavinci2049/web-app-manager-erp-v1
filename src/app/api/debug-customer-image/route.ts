import { NextResponse } from "next/server";
import { getCustomersPage } from "@/services/api-main/customer-general";

export async function GET() {
  const result = await getCustomersPage({
    search: "50118",
    pe_system_client_id: 1,
    pe_organization_id: "0",
    pe_user_id: "0",
    pe_user_name: "debug",
    pe_user_role: "admin",
    pe_person_id: 0,
  });

  return NextResponse.json({
    total: result.total,
    items: result.items.map((item) => ({
      customerId: item.customerId,
      name: item.name,
      imagePath: item.imagePath ?? null,
    })),
  });
}
