export type QuestionKind = "choice" | "multichoice" | "text" | "textarea" | "amount";

export type IntakeQuestion = {
  key: string;
  kind: QuestionKind;
  q: string;
  help: string;
  options: string[];
  placeholder: string;
};

export type HistoryEntry = { key: string; q: string; answer: string | string[] };

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

export type IntakeStepResponse =
  | { done: false; question: IntakeQuestion }
  | { done: true; outOfScope: true; reason: string }
  | { done: true; outOfScope: false; caseId: string; result: PlanResult };

export type CaseSummary = {
  id: string;
  title: string;
  category: string;
  status: string;
  confidenceLabel: string;
  confidenceScore: number;
  recoveryLow: number | null;
  recoveryHigh: number | null;
  nextStep: string;
  createdAt: string;
};

export type CaseDetail = CaseSummary & {
  userId: string;
  summary: string;
  whatHappened: string;
  otherParty: string | null;
  jurisdiction: string | null;
  recoverySummary: string | null;
  nextStepDetail: string | null;
  rights: PlanRight[];
  options: PlanOption[];
  evidenceHave: string[];
  evidenceNeeded: EvidenceNeeded[];
  timeline: TimelineEntry[];
  actionPlan: ActionPlanStep[];
  demandLetter: DemandLetter;
  intakeHistory: HistoryEntry[];
  updatedAt: string;
};
