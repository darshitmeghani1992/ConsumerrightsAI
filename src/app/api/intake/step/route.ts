import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { runIntakeStep, type HistoryEntry } from "@/lib/ai";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

// The AI intake call can take longer than Vercel's short default function
// window; allow up to 60s so the model has room to finish instead of being
// killed mid-response.
export const maxDuration = 60;

function toCaseTitle(otherPartyGuess: string | null, title: string) {
  return otherPartyGuess ? `${title} · ${otherPartyGuess}` : title;
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const history: HistoryEntry[] = Array.isArray(body?.history) ? body.history : [];
  if (!history.length) {
    return NextResponse.json({ error: "Missing intake history." }, { status: 400 });
  }

  let step;
  try {
    step = await runIntakeStep(history);
  } catch (e) {
    // Surface the real reason in the Vercel logs instead of swallowing it —
    // this is what lets us tell a missing API key from a bad response shape.
    console.error("intake/step failed:", e);
    return NextResponse.json({ error: "Couldn't reach the analysis just now." }, { status: 502 });
  }

  if (!step.done) {
    return NextResponse.json({ done: false, question: step.question });
  }

  if (step.outOfScope) {
    return NextResponse.json({ done: true, outOfScope: true, reason: step.reason });
  }

  const r = step.result;
  const category = String(history[0]?.answer ?? "Consumer dispute");
  const created = await db.case.create({
    data: {
      userId: user.id,
      title: toCaseTitle(null, r.title || category),
      category,
      summary: r.summary,
      whatHappened: r.whatHappened,
      jurisdiction: r.jurisdiction,
      confidenceLabel: r.confidenceLabel,
      confidenceScore: r.confidenceScore,
      recoveryLow: r.recoveryLow,
      recoveryHigh: r.recoveryHigh,
      recoverySummary: r.recoverySummary,
      nextStep: r.nextStep,
      nextStepDetail: r.nextStepDetail,
      rights: r.rights,
      options: r.options,
      evidenceHave: r.evidenceHave,
      evidenceNeeded: r.evidenceNeeded,
      timeline: r.timeline,
      actionPlan: r.actionPlan,
      demandLetter: r.demandLetter ?? Prisma.JsonNull,
      intakeHistory: history,
    },
  });

  return NextResponse.json({ done: true, outOfScope: false, caseId: created.id, result: r });
}
