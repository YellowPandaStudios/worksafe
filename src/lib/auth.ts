import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor } from "better-auth/plugins";
import { prisma } from "./prisma";

export const auth = betterAuth({
  appName: "Work Safe",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  plugins: [
    twoFactor({
      issuer: "Work Safe",
      totpOptions: {
        digits: 6,
        period: 30,
      },
      backupCodeOptions: {
        length: 10,
        count: 10,
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
