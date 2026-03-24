import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    stripeAccountId?: string | null;
    role?: string;
    baaSignedAt?: string | null;
  }
  interface Session {
    user: {
      id: string;
      stripeAccountId?: string | null;
      role?: string;
      baaSignedAt?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    stripeAccountId?: string | null;
    role?: string;
    baaSignedAt?: string | null;
  }
}
