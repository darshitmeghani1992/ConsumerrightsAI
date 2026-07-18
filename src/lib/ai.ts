import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-4-5";
const MAX_TOKENS = 3000;

export type QuestionKind = "choice" | "multichoice" | "text" | "textarea" | "amount";

export type IntakeQuestion = {
  key: string;
  kind: QuestionKind;
  q: string;
  help: string;
  options: string[];
  placeholder: string;
};

export type PlanOption = {
  name: string;
  why: string;
  effort: string;
  time: string;
  cost: string;
  pros: string[];
  cons: string[];
  recommended: boolean;
};

export type PlanRight = { title: string; law: string; body: string };
export type TimelineEntry = { title: string; note: string; when: string };
export type ActionPlanStep = { title: string; desc: string };
export type EvidenceNeeded = { name: string; why: string };
export type DemandLetter = { subject: string; body: string } | null;

export type PlanResult = {
  title: string;
  summary: string;
  whatHappened: string;
  jurisdiction: string | null;
  confidenceLabel: string;
  confidenceScore: number;
  recoveryLow: number | null;
  recoveryHigh: number | null;
  recoverySummary: string;
  rights: PlanRight[];
  options: PlanOption[];
  nextStep: string;
  nextStepDetail: string;
  evidenceHave: string[];
  evidenceNeeded: EvidenceNeeded[];
  timeline: TimelineEntry[];
  actionPlan: ActionPlanStep[];
  demandLetter: DemandLetter;
};

export type IntakeStepResult =
  | { done: false; question: IntakeQuestion }
  | { done: true; outOfScope: true; reason: string }
  | { done: true; outOfScope: false; result: PlanResult };

export type HistoryEntry = { key: string; q: string; answer: string | string[] };

const SYSTEM_PROMPT = `You are Consumer Rights AI, running a SHORT, adaptive intake for a consumer or \
civil dispute. You are informational only — not a lawyer, and you never give a binding legal opinion.

You will receive the answers gathered so far (two fixed seed questions — a category pick and a free-text \
description — followed by any of your own prior follow-ups). Ask the NEXT single most useful question that \
is SPECIFIC to THIS person's exact situation — never generic filler, and never re-ask something already \
answered or that does not matter for their case. Good questions are concrete: for a withheld deposit, whether \
the landlord ever sent an itemized list of deductions; for a denied insurance claim, the exact stated reason \
for denial; for a flight issue, whether the airline cited a reason like weather or a mechanical/crew issue. \
Ask only 2-4 tailored follow-ups total, then finish. If jurisdiction/location matters and is not yet known, \
ask for it once (kind "text" or "choice" of common jurisdictions), otherwise proceed with general guidance.

OUT OF SCOPE: if the situation is fundamentally criminal, a family-law matter (divorce, custody), immigration, \
a personal injury / medical malpractice claim, or describes an active safety emergency, do NOT produce a plan. \
Instead finish immediately with {"done":true,"outOfScope":true,"reason":"one or two sentences, warm and \
plain-English, explaining why this needs a licensed attorney (or emergency services) rather than general \
guidance, said as directly to the person as possible"}.

Otherwise, respond with ONLY one JSON object, no markdown fences, no commentary outside the JSON.

To ask another question:
{"done":false,"question":{"key":"snake_case_key","kind":"choice|multichoice|text|textarea|amount","q":"the \
question in plain English","help":"one short helper line","options":["only for choice/multichoice, 2-6 \
items"],"placeholder":"only for text/textarea/amount"}}

To finish with a tailored plan:
{"done":true,"result":{
  "title":"short case title, e.g. 'Security deposit dispute'",
  "summary":"2-3 sentence plain-English summary of the situation and their position",
  "whatHappened":"a 2-4 sentence factual recap written in second person ('You...'), grounded only in what they told you",
  "jurisdiction":"the state/country they mentioned, or null if never established",
  "confidenceLabel":"one of: Strong position | Moderate position | Uncertain position | Weak position",
  "confidenceScore":1-5 (integer, how strong their position looks),
  "recoveryLow":number or null (low end of a plausible dollar recovery, omit currency symbol, null if not money-based),
  "recoveryHigh":number or null (high end, same units as recoveryLow),
  "recoverySummary":"one sentence explaining the recovery estimate in plain English",
  "rights":[{"title":"plain-language right","law":"best-known law, statute, or regulation name for the \
stated jurisdiction — say 'general consumer-protection principles' if jurisdiction is unknown","body":"1-2 \
sentence plain-English explanation"}] (3-5 items),
  "options":[{"name":"...","why":"one line on why this option fits their case","effort":"Low|Medium|High",\
"time":"e.g. '1-2 weeks'","cost":"e.g. 'Free' or '~$75 filing'","pros":["1-3 short phrases"],"cons":["1-2 \
short phrases"],"recommended":true for exactly one option, false for the rest}] (3-4 items),
  "nextStep":"the single best recommended next action, short (under 8 words)",
  "nextStepDetail":"1-2 sentences on how to do it and why it's recommended first",
  "evidenceHave":["short phrases describing evidence the facts they already told you imply they have, e.g. \
'Lease agreement', 'Email thread with the company' — infer conservatively, only what's clearly implied"],
  "evidenceNeeded":[{"name":"short evidence item still worth gathering","why":"one short line on how it \
strengthens the case"}] (2-4 items),
  "timeline":[{"title":"short event title","note":"1 sentence","when":"a relative or stated phrase like \
'May 31' or 'about 3 weeks ago' — use only dates/timeframes actually mentioned, otherwise a relative phrase \
like 'Before this dispute started'"}] (2-6 items, chronological, include a synthetic final entry \
"Case opened" dated "Today"),
  "actionPlan":[{"title":"short step title","desc":"1 sentence"}] (4-6 items, chronological, starting from \
gathering evidence through to escalation if unresolved),
  "demandLetter": null, OR {"subject":"short subject line","body":"a complete, ready-to-send formal letter \
in plain text (use \\n\\n between paragraphs) addressed generically to the other party, citing the specific \
right/law and requesting a specific remedy and deadline — only include this when a demand letter is actually \
the right tool for this dispute type (e.g. not for something already in active litigation)"}
}}

Use kind "choice" (2-5 options) when the answer is a natural pick, "multichoice" for select-all, "amount" for \
money, "text" for short answers, "textarea" for longer ones. Be encouraging and precise. Never fabricate a \
specific case citation or statute number you are not reasonably confident is real for the stated \
jurisdiction — prefer naming the general statute/regulation area and noting "specifics vary by location" over \
inventing a section number.`;

function parseJson(raw: string): unknown {
  let s = raw.trim().replace(/^```(json)?/i, "").replace(/```$/, "").trim();
  const a = s.indexOf("{");
  const b = s.lastIndexOf("}");
  if (a >= 0 && b > a) s = s.slice(a, b + 1);
  return JSON.parse(s);
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function normalizeQuestion(raw: Record<string, unknown> | undefined, fallbackKey: string): IntakeQuestion {
  const kind: QuestionKind =
    raw?.kind === "choice" ||
    raw?.kind === "multichoice" ||
    raw?.kind === "text" ||
    raw?.kind === "textarea" ||
    raw?.kind === "amount"
      ? raw.kind
      : "text";
  return {
    key: typeof raw?.key === "string" && raw.key ? raw.key : fallbackKey,
    kind,
    q: typeof raw?.q === "string" && raw.q ? raw.q : "Is there anything else that might help your case?",
    help: typeof raw?.help === "string" ? raw.help : "",
    options: asStringArray(raw?.options),
    placeholder: typeof raw?.placeholder === "string" ? raw.placeholder : "",
  };
}

function normalizeResult(raw: Record<string, unknown>): PlanResult {
  const options = Array.isArray(raw.options) ? raw.options : [];
  const rights = Array.isArray(raw.rights) ? raw.rights : [];
  const evidenceNeeded = Array.isArray(raw.evidenceNeeded) ? raw.evidenceNeeded : [];
  const timeline = Array.isArray(raw.timeline) ? raw.timeline : [];
  const actionPlan = Array.isArray(raw.actionPlan) ? raw.actionPlan : [];
  const demandLetterRaw = raw.demandLetter as Record<string, unknown> | null | undefined;

  return {
    title: typeof raw.title === "string" ? raw.title : "Your case",
    summary: typeof raw.summary === "string" ? raw.summary : "",
    whatHappened: typeof raw.whatHappened === "string" ? raw.whatHappened : "",
    jurisdiction: typeof raw.jurisdiction === "string" ? raw.jurisdiction : null,
    confidenceLabel: typeof raw.confidenceLabel === "string" ? raw.confidenceLabel : "Moderate position",
    confidenceScore:
      typeof raw.confidenceScore === "number" ? Math.min(5, Math.max(1, Math.round(raw.confidenceScore))) : 3,
    recoveryLow: typeof raw.recoveryLow === "number" ? raw.recoveryLow : null,
    recoveryHigh: typeof raw.recoveryHigh === "number" ? raw.recoveryHigh : null,
    recoverySummary: typeof raw.recoverySummary === "string" ? raw.recoverySummary : "",
    rights: rights.map((r: Record<string, unknown>) => ({
      title: typeof r?.title === "string" ? r.title : "",
      law: typeof r?.law === "string" ? r.law : "",
      body: typeof r?.body === "string" ? r.body : "",
    })),
    options: options.map((o: Record<string, unknown>) => ({
      name: typeof o?.name === "string" ? o.name : "",
      why: typeof o?.why === "string" ? o.why : "",
      effort: typeof o?.effort === "string" ? o.effort : "Medium",
      time: typeof o?.time === "string" ? o.time : "",
      cost: typeof o?.cost === "string" ? o.cost : "",
      pros: asStringArray(o?.pros),
      cons: asStringArray(o?.cons),
      recommended: o?.recommended === true,
    })),
    nextStep: typeof raw.nextStep === "string" ? raw.nextStep : "",
    nextStepDetail: typeof raw.nextStepDetail === "string" ? raw.nextStepDetail : "",
    evidenceHave: asStringArray(raw.evidenceHave),
    evidenceNeeded: evidenceNeeded.map((e: Record<string, unknown>) => ({
      name: typeof e?.name === "string" ? e.name : "",
      why: typeof e?.why === "string" ? e.why : "",
    })),
    timeline: timeline.map((t: Record<string, unknown>) => ({
      title: typeof t?.title === "string" ? t.title : "",
      note: typeof t?.note === "string" ? t.note : "",
      when: typeof t?.when === "string" ? t.when : "",
    })),
    actionPlan: actionPlan.map((s: Record<string, unknown>) => ({
      title: typeof s?.title === "string" ? s.title : "",
      desc: typeof s?.desc === "string" ? s.desc : "",
    })),
    demandLetter:
      demandLetterRaw && typeof demandLetterRaw.body === "string"
        ? {
            subject: typeof demandLetterRaw.subject === "string" ? demandLetterRaw.subject : "Demand letter",
            body: demandLetterRaw.body,
          }
        : null,
  };
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to your environment to enable the AI intake engine."
    );
  }
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

async function callModel(history: HistoryEntry[]): Promise<unknown> {
  const anthropic = getClient();
  const payload = { answersSoFar: history.map((h) => ({ question: h.q, answer: h.answer })) };
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: JSON.stringify(payload) }],
  });
  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") throw new Error("empty model response");
  return parseJson(textBlock.text);
}

function validateShape(data: unknown): data is Record<string, unknown> {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  if (d.done === false) return !!d.question;
  if (d.done === true) return d.outOfScope === true ? typeof d.reason === "string" : !!(d.result as Record<string, unknown> | undefined)?.title;
  return false;
}

// Retries once on a network error or an unparseable/wrong-shape response — long
// user descriptions were a real bug source where the model jumped straight to a
// truncated plan; a generous max_tokens plus this one retry covers both failure modes.
export async function runIntakeStep(history: HistoryEntry[]): Promise<IntakeStepResult> {
  let data: Record<string, unknown> | null = null;
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 2 && !data; attempt++) {
    try {
      const raw = await callModel(history);
      if (!validateShape(raw)) throw new Error("bad shape");
      data = raw as Record<string, unknown>;
    } catch (e) {
      lastError = e;
    }
  }
  if (!data) throw lastError instanceof Error ? lastError : new Error("AI intake step failed");

  if (data.done === true) {
    if (data.outOfScope === true) {
      return { done: true, outOfScope: true, reason: String(data.reason) };
    }
    return { done: true, outOfScope: false, result: normalizeResult(data.result as Record<string, unknown>) };
  }
  return { done: false, question: normalizeQuestion(data.question as Record<string, unknown>, `q${history.length}`) };
}
