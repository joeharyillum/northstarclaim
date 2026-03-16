import { auth } from "@/auth";

/**
 * Returns the authenticated session or null.
 * No fallbacks, no bypasses — if you're not logged in, you get null.
 */
export async function getOwnerSession() {
  const session = await auth();
  if (session?.user?.id) return session;
  return null;
}
