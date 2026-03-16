import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOwnerSession } from "@/lib/owner-session";

export async function GET() {
  const session = await getOwnerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        clinicName: true,
        role: true,
        createdAt: true,
        uploadBatches: {
          select: {
            id: true,
            createdAt: true,
            claims: {
              select: {
                id: true,
                status: true,
                billedAmount: true,
                createdAt: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = users.map((u) => {
      const allClaims = u.uploadBatches.flatMap((b) => b.claims);
      const totalClaims = allClaims.length;
      const totalBilled = allClaims.reduce((s, c) => s + c.billedAmount, 0);
      const recovered = allClaims.filter(
        (c) => c.status === "RECOVERED" || c.status === "SETTLED"
      );
      const recoveredAmount = recovered.reduce(
        (s, c) => s + c.billedAmount,
        0
      );
      const pending = allClaims.filter(
        (c) =>
          c.status === "PENDING_ANALYSIS" || c.status === "RECOVERABLE"
      ).length;
      const appealed = allClaims.filter(
        (c) => c.status === "APPEALED"
      ).length;

      const lastClaimDate = allClaims.length
        ? allClaims.reduce((latest, c) =>
            c.createdAt > latest ? c.createdAt : latest,
            allClaims[0].createdAt
          )
        : null;

      return {
        id: u.id,
        name: u.name || u.email.split("@")[0],
        email: u.email,
        clinicName: u.clinicName,
        role: u.role,
        joinedAt: u.createdAt,
        totalClaims,
        totalBilled,
        recoveredCount: recovered.length,
        recoveredAmount,
        pendingCount: pending,
        appealedCount: appealed,
        recoveryRate:
          totalClaims > 0
            ? Math.round((recovered.length / totalClaims) * 100)
            : 0,
        lastActivity: lastClaimDate || u.createdAt,
      };
    });

    return NextResponse.json({ success: true, users: result });
  } catch (e) {
    console.error("Users progress fetch error:", e);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user progress" },
      { status: 500 }
    );
  }
}
