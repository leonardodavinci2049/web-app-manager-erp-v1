import {
  adminClient,
  lastLoginMethodClient,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import {
  ac,
  cashier,
  customer,
  finance,
  manager,
  operator,
  owner,
  salesperson,
  shipping,
  superAdmin,
  user,
} from "./permissions";

export const authClient = createAuthClient({
  // The auth route handler is served from this same Next.js app at /api/auth,
  // so requests are resolved against the current origin. This keeps session
  // cookies (SameSite=Lax) same-origin even when the dev port differs from
  // NEXT_PUBLIC_APP_URL, avoiding empty sessions in the client.
  plugins: [
    organizationClient({
      ac,
      roles: {
        owner,
        manager,
        salesperson,
        operator,
        cashier,
        finance,
        shipping,
        customer,
      },
    }),
    twoFactorClient({
      onTwoFactorRedirect: () => {
        window.location.href = "/auth/2fa";
      },
    }),
    adminClient({
      ac,
      roles: {
        admin: superAdmin,
        user,
      },
    }),
    lastLoginMethodClient(),
  ],
});
