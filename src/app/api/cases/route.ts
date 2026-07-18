import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const cases = await db.case.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      confidenceLabel: true,
      confidenceScore: true,
      recoveryLow: true,
      recoveryHigh: true,
      nextStep: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ cases });
}
