import { betterAuth } from "better-auth";

import { nextCookies } from "better-auth/next-js";
import { lastLoginMethod, organization, twoFactor } from "better-auth/plugins";
import { admin as adminPlugin } from "better-auth/plugins/admin";
import { createPool } from "mysql2/promise";
import { Resend } from "resend";
import VerifyEmail from "@/components/emails/verify-email";
import { serverEnvs } from "@/core/config/envs.server";
import { getActiveOrganization } from "@/server/organizations";

const resend = new Resend(serverEnvs.RESEND_API_KEY);

import OrganizationInvitationEmail from "@/components/emails/organization-invitation";
import ForgotPasswordEmail from "@/components/emails/reset-password";
import sendDeleteAccountVerificationEmail from "@/components/emails/sendDeleteAccountVerificationEmail";
import sendEmailVerificationEmail from "@/components/emails/sendEmailVerificationEmail";

// Admin Roles
import { superAdmin, user } from "./permissions/admin-roles";
// Organization Roles
import {
  cashier,
  customer,
  finance,
  manager,
  operator,
  owner,
  salesperson,
  shipping,
} from "./permissions/organization-roles";
import { ac } from "./permissions/statements";

export const auth = betterAuth({
  appName: "WEB APP MANAGER",
  secret: serverEnvs.BETTER_AUTH_SECRET,
  database: createPool({
    host: serverEnvs.DATABASE_ADMIN_HOST,
    port: serverEnvs.DATABASE_ADMIN_PORT,
    user: serverEnvs.DATABASE_ADMIN_USER,
    password: serverEnvs.DATABASE_ADMIN_PASSWORD,
    database: serverEnvs.DATABASE_ADMIN_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  }),

  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const activeOrganization = await getActiveOrganization(
            session.userId,
          );

          return {
            data: {
              ...session,
              activeOrganizationId: activeOrganization?.id,
              systemId: activeOrganization?.systemId ?? 0,
            },
          };
        },
      },
    },
  },

  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ user, url, newEmail }) => {
        await sendEmailVerificationEmail({
          user: { ...user, email: newEmail },
          url,
        });
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        await sendDeleteAccountVerificationEmail({
          userName: user.name,
          confirmationUrl: url,
        });
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      const response = await resend.emails.send({
        from: `${serverEnvs.EMAIL_SENDER_NAME} <${serverEnvs.EMAIL_SENDER_ADDRESS}>`,
        to: user.email,
        subject: "Reset your password",
        react: ForgotPasswordEmail({
          username: user.name,
          resetUrl: url,
          userEmail: user.email,
        }),
      });

      if (response.error) {
        console.error("Failed to send email:", response.error);
      } else {
        console.log("Email sent successfully:", response.data);
      }
    },
    requireEmailVerification: true,
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: `${serverEnvs.EMAIL_SENDER_NAME} <${serverEnvs.EMAIL_SENDER_ADDRESS}>`,
        to: user.email,
        subject: "Verify your email",
        react: VerifyEmail({ username: user.name, verifyUrl: url }),
      });
    },
    sendOnSignUp: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60, // 1 minute
    },
    additionalFields: {
      systemId: {
        type: "number",
        required: false,
      },
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
  },

  plugins: [
    twoFactor(),

    adminPlugin({
      ac,

      roles: {
        admin: superAdmin,
        user,
      },
    }),
    organization({
      ac,
      sendInvitationEmail: async (data) => {
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/accept-invitation/${data.id}`;

        await resend.emails.send({
          from: `${serverEnvs.EMAIL_SENDER_NAME} <${serverEnvs.EMAIL_SENDER_ADDRESS}>`,
          to: data.email,
          subject: "You've been invited to join our organization",
          react: OrganizationInvitationEmail({
            email: data.email,
            invitedByUsername: data.inviter.user.name,
            invitedByEmail: data.inviter.user.email,
            teamName: data.organization.name,
            inviteLink,
          }),
        });
      },
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
      schema: {
        organization: {
          additionalFields: {
            system_id: {
              type: "number",
              input: true,
              required: true,
            },
          },
        },
        member: {
          additionalFields: {
            personId: {
              type: "number",
              required: false,
              input: false,
            },
          },
        },
      },
    }),

    lastLoginMethod(),
    nextCookies(),
  ],
});
