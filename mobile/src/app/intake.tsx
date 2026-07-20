import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { api, ApiError } from "@/lib/api";
import type { HistoryEntry, IntakeQuestion, PlanResult } from "@/lib/types";
import MicroLabel from "@/components/ui/MicroLabel";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { colors, fonts, radii } from "@/constants/tokens";

const SEEDS: IntakeQuestion[] = [
  {
    key: "category",
    kind: "choice",
    q: "What kind of problem are you dealing with?",
    help: "Pick the closest match — the next questions adapt to what you choose.",
    options: [
      "Deposit or housing",
      "Refund or defective product",
      "Airline or travel",
      "Subscription or billing",
      "Insurance claim",
      "Employment",
      "Something else",
    ],
    placeholder: "",
  },
  {
    key: "describe",
    kind: "textarea",
    q: "In your own words, what happened?",
    help: "Plain English is perfect — what you expected, and what went wrong.",
    options: [],
    placeholder: "e.g. My landlord kept my $2,400 deposit and stopped replying.",
  },
];

type Phase = "form" | "outOfScope" | "result";

export default function IntakeScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("form");
  const [q, setQ] = useState<IntakeQuestion>(SEEDS[0]);
  const [qNumber, setQNumber] = useState(1);
  const [seedIndex, setSeedIndex] = useState(0);
  const [qStack, setQStack] = useState<IntakeQuestion[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [draft, setDraft] = useState("");
  const [evidence, setEvidence] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [firstAiTurn, setFirstAiTurn] = useState(true);
  const [result, setResult] = useState<PlanResult | null>(null);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [outOfScopeReason, setOutOfScopeReason] = useState("");

  async function askNext(nextHistory: HistoryEntry[]) {
    setBusy(true);
    setError(false);
    try {
      const res = await api.intakeStep(nextHistory);
      setFirstAiTurn(false);
      if (!res.done) {
        setQ(res.question);
        setQNumber((n) => n + 1);
        setBusy(false);
        setDraft("");
        setEvidence([]);
        return;
      }
      if (res.outOfScope) {
        setOutOfScopeReason(res.reason);
        setPhase("outOfScope");
        setBusy(false);
        return;
      }
      setResult(res.result);
      setCaseId(res.caseId);
      setPhase("result");
      setBusy(false);
    } catch {
      setBusy(false);
      setError(true);
    }
  }

  function answerCurrent(val: string | string[]) {
    const entry: HistoryEntry = { key: q.key, q: q.q, answer: val };
    const nextHistory = [...history, entry];
    const nextStack = [...qStack, q];
    setHistory(nextHistory);
    setQStack(nextStack);

    const nextSeed = seedIndex + 1;
    if (nextSeed < SEEDS.length) {
      setSeedIndex(nextSeed);
      setQ(SEEDS[nextSeed]);
      setQNumber((n) => n + 1);
      setDraft("");
      setEvidence([]);
    } else {
      setSeedIndex(nextSeed);
      setDraft("");
      setEvidence([]);
      askNext(nextHistory);
    }
  }

  function goBack() {
    if (!qStack.length) return;
    const prevQ = qStack[qStack.length - 1];
    const lastEntry = history[history.length - 1];
    const nextHistory = history.slice(0, -1);
    const seedKeys = SEEDS.map((s) => s.key);
    const si = seedKeys.indexOf(prevQ.key);

    setQ(prevQ);
    setQStack(qStack.slice(0, -1));
    setHistory(nextHistory);
    setQNumber((n) => Math.max(1, n - 1));
    setSeedIndex(si >= 0 ? si : SEEDS.length);
    setDraft(typeof lastEntry?.answer === "string" ? lastEntry.answer : "");
    setEvidence(Array.isArray(lastEntry?.answer) ? lastEntry.answer : []);
  }

  function toggleEvidence(val: string) {
    setEvidence((prev) => (prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]));
  }

  function next() {
    const val = q.kind === "multichoice" ? evidence : draft.trim();
    answerCurrent(val);
  }

  function retry() {
    setError(false);
    askNext(history);
  }

  const canContinue =
    q.kind === "amount" ? true : q.kind === "multichoice" ? evidence.length > 0 : draft.trim().length > 0;
  const showContinue = q.kind !== "choice";
  const footerVisible = showContinue || qStack.length > 0;
  const progressPct = Math.min(88, 14 + (qNumber - 1) * 20);
  const analyzingTitle = firstAiTurn ? "Reading your situation…" : "One moment…";

  if (phase === "outOfScope") {
    return (
      <View style={styles.centerPage}>
        <View style={styles.amberDisc}>
          <Text style={styles.amberDiscText}>!</Text>
        </View>
        <Text style={styles.centerTitle}>This needs a licensed professional</Text>
        <Text style={styles.centerBody}>{outOfScopeReason}</Text>
        <PrimaryButton title="Back to my cases" onPress={() => router.replace("/(tabs)/home")} style={{ marginTop: 22, alignSelf: "stretch" }} />
      </View>
    );
  }

  if (phase === "result" && result) {
    return (
      <ScrollView style={styles.page} contentContainerStyle={styles.resultScroll}>
        <MicroLabel color="#5c8a6e">Your tailored plan</MicroLabel>
        <Text style={styles.resultTitle}>{result.title}</Text>
        <Text style={styles.resultSummary}>{result.summary}</Text>

        <MicroLabel style={{ marginTop: 18, marginBottom: 9 }}>Rights on your side</MicroLabel>
        <View style={{ gap: 9 }}>
          {result.rights.map((r, i) => (
            <View key={i} style={styles.rightRow}>
              <View style={styles.rightDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rightTitle}>{r.title}</Text>
                <Text style={styles.rightLaw}>{r.law}</Text>
              </View>
            </View>
          ))}
        </View>

        <MicroLabel style={{ marginTop: 18, marginBottom: 9 }}>Your options</MicroLabel>
        <View style={{ gap: 8 }}>
          {result.options.map((o, i) => (
            <View key={i} style={styles.optionCard}>
              <View style={styles.optionTop}>
                <Text style={styles.optionName}>{o.name}</Text>
                <Text style={styles.optionMeta}>
                  {o.effort} · {o.time}
                </Text>
              </View>
              <Text style={styles.optionWhy}>{o.why}</Text>
            </View>
          ))}
        </View>

        <View style={styles.nextStepPanel}>
          <MicroLabel color={colors.onDarkFaint2}>Best next step</MicroLabel>
          <Text style={styles.nextStepText}>{result.nextStep}</Text>
        </View>

        <MicroLabel style={{ marginTop: 18, marginBottom: 9 }}>Evidence to gather</MicroLabel>
        <View style={styles.chipWrap}>
          {result.evidenceNeeded.map((e, i) => (
            <Text key={i} style={styles.chip}>
              {e.name}
            </Text>
          ))}
        </View>

        <PrimaryButton
          title="Open my case workspace ›"
          onPress={() => caseId && router.replace(`/case/${caseId}`)}
          style={{ marginTop: 20 }}
        />
        <Text style={styles.startNew} onPress={() => router.replace("/intake")}>
          Start a new case
        </Text>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.headerRow}>
        <View style={styles.iconTile}>
          <View style={styles.iconDot} />
        </View>
        <View style={{ flex: 1 }}>
          <MicroLabel>New case · Guided intake</MicroLabel>
          <Text style={styles.wordmark}>Consumer Rights AI</Text>
        </View>
      </View>

      {busy ? (
        <View style={styles.centerPage}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.centerTitle, { marginTop: 26 }]}>{analyzingTitle}</Text>
          <Text style={styles.centerBody}>
            Matching your situation to the laws and rights that apply, and finding what to ask next.
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centerPage}>
          <View style={styles.amberDisc}>
            <Text style={styles.amberDiscText}>!</Text>
          </View>
          <Text style={styles.centerTitle}>That didn't go through</Text>
          <Text style={styles.centerBody}>
            We couldn't reach the analysis just now. Your answers are saved — let's try that again.
          </Text>
          <PrimaryButton title="Try again" onPress={retry} style={{ marginTop: 22, alignSelf: "stretch" }} />
        </View>
      ) : (
        <>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.questionScroll}>
            <MicroLabel>Question {qNumber}</MicroLabel>
            <Text style={styles.question}>{q.q}</Text>
            {!!q.help && <Text style={styles.help}>{q.help}</Text>}

            <View style={{ marginTop: 22 }}>
              {q.kind === "choice" &&
                q.options.map((o) => (
                  <Pressable key={o} style={styles.choiceCard} onPress={() => answerCurrent(o)}>
                    <Text style={styles.choiceLabel}>{o}</Text>
                    <Text style={styles.chevron}>›</Text>
                  </Pressable>
                ))}

              {q.kind === "multichoice" && (
                <View style={styles.chipWrap}>
                  {q.options.map((o) => {
                    const selected = evidence.includes(o);
                    return (
                      <Pressable
                        key={o}
                        onPress={() => toggleEvidence(o)}
                        style={[styles.multiChip, selected && styles.multiChipSelected]}
                      >
                        <Text style={[styles.multiChipLabel, selected && styles.multiChipLabelSelected]}>{o}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {q.kind === "textarea" && (
                <TextInput
                  style={styles.textarea}
                  value={draft}
                  onChangeText={setDraft}
                  placeholder={q.placeholder}
                  placeholderTextColor={colors.faint}
                  multiline
                  textAlignVertical="top"
                />
              )}

              {q.kind === "text" && (
                <TextInput
                  style={styles.textInput}
                  value={draft}
                  onChangeText={setDraft}
                  placeholder={q.placeholder}
                  placeholderTextColor={colors.faint}
                />
              )}

              {q.kind === "amount" && (
                <View style={styles.amountRow}>
                  <Text style={styles.amountSign}>$</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={draft}
                    onChangeText={setDraft}
                    placeholder={q.placeholder}
                    placeholderTextColor={colors.faint}
                    keyboardType="decimal-pad"
                  />
                </View>
              )}
            </View>
          </ScrollView>

          {footerVisible && (
            <View style={styles.footer}>
              {qStack.length > 0 && (
                <Pressable style={styles.backBtn} onPress={goBack}>
                  <Text style={styles.backBtnText}>‹</Text>
                </Pressable>
              )}
              {showContinue && <PrimaryButton title="Continue" onPress={next} disabled={!canContinue} style={{ flex: 1 }} />}
            </View>
          )}
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 11, paddingTop: 58, paddingHorizontal: 18, paddingBottom: 14 },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: radii.tile,
    backgroundColor: colors.primaryDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  iconDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.successLight },
  wordmark: { fontFamily: fonts.serifSemiBold, fontSize: 19, color: colors.ink, marginTop: 2 },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: colors.track, marginHorizontal: 20, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2, backgroundColor: colors.primary },
  questionScroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30 },
  question: { fontFamily: fonts.serifSemiBold, fontSize: 25, color: colors.ink, marginTop: 8, lineHeight: 30 },
  help: { fontSize: 13.5, color: colors.muted2, marginTop: 8, lineHeight: 19 },
  choiceCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radii.sm,
    paddingVertical: 15,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 9,
  },
  choiceLabel: { fontSize: 15, fontFamily: fonts.sansMedium, color: colors.ink },
  chevron: { color: "#c3ccc4", fontSize: 18 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  multiChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 15,
  },
  multiChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  multiChipLabel: { fontSize: 14, fontFamily: fonts.sansMedium, color: colors.ink2 },
  multiChipLabelSelected: { color: colors.onDarkText },
  textarea: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    padding: 14,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.sans,
    color: colors.ink,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    padding: 14,
    fontSize: 15,
    fontFamily: fonts.sans,
    color: colors.ink,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
  },
  amountSign: { fontFamily: fonts.serifMedium, fontSize: 24, color: colors.faint2, marginRight: 6 },
  amountInput: { flex: 1, paddingVertical: 12, fontFamily: fonts.serifMedium, fontSize: 24, color: colors.ink },
  footer: { flexDirection: "row", gap: 10, alignItems: "center", padding: 20, paddingBottom: 30 },
  backBtn: {
    width: 50,
    height: 50,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: { fontSize: 18, color: colors.muted },
  centerPage: { flex: 1, alignItems: "center", justifyContent: "center", padding: 34, backgroundColor: colors.canvas },
  centerTitle: { fontFamily: fonts.serifSemiBold, fontSize: 21, color: colors.ink, textAlign: "center" },
  centerBody: { fontSize: 13.5, color: colors.muted2, textAlign: "center", lineHeight: 19, marginTop: 8, maxWidth: 280 },
  amberDisc: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.amberBg,
    alignItems: "center",
    justifyContent: "center",
  },
  amberDiscText: { color: colors.amber, fontSize: 24 },
  resultScroll: { padding: 18, paddingTop: 58, paddingBottom: 40 },
  resultTitle: { fontFamily: fonts.serifSemiBold, fontSize: 24, color: colors.ink, marginTop: 5 },
  resultSummary: { fontSize: 14, color: colors.muted, lineHeight: 21, marginTop: 9 },
  rightRow: { flexDirection: "row", gap: 9 },
  rightDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success, marginTop: 6 },
  rightTitle: { fontSize: 13.5, fontFamily: fonts.sansSemiBold, color: colors.ink, lineHeight: 18 },
  rightLaw: { fontSize: 11.5, color: colors.faint, marginTop: 1 },
  optionCard: { borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 13, padding: 13, backgroundColor: colors.surface },
  optionTop: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  optionName: { fontSize: 13.5, fontFamily: fonts.sansSemiBold, color: colors.ink },
  optionMeta: { fontSize: 11, color: colors.faint2 },
  optionWhy: { fontSize: 12.5, color: colors.muted2, marginTop: 3, lineHeight: 17 },
  nextStepPanel: { backgroundColor: colors.primaryDeep, borderRadius: 15, padding: 16, marginTop: 18 },
  nextStepText: { color: colors.onDarkText, fontSize: 14.5, fontFamily: fonts.sansSemiBold, marginTop: 4, lineHeight: 20 },
  chip: {
    fontSize: 12,
    color: colors.muted,
    backgroundColor: colors.chipBg,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    borderRadius: radii.chip,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  startNew: { textAlign: "center", marginTop: 14, fontSize: 13.5, color: colors.muted2 },
});
