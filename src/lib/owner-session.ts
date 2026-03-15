import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Returns the current session, or falls back to the first admin user
 * so the owner can access all dashboard pages without logging in.
 */
export async function getOwnerSession() {
  const session = await auth();
  if (session?.user?.id) return session;

  // Fall back: find the first admin user, or the first user at all
  const fallback = await prisma.user.findFirst({
    where: { role: "admin" },
    select: { id: true, name: true, email: true, role: true },
  }) ?? await prisma.user.findFirst({
    select: { id: true, name: true, email: true, role: true },
  });

  if (!fallback) {
    // No users exist at all — return a synthetic owner session
    return {
      user: {
        id: "owner",
        name: "Owner",
        email: "admin@northstarmedic.com",
        role: "admin",
      },
    };
  }

  return {
    user: {
      id: fallback.id,
      name: fallback.name || "Owner",
      email: fallback.email,
      role: fallback.role || "admin",
    },
  };
}
