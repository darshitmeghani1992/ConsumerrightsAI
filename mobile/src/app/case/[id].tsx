import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api, ApiError } from "@/lib/api";
import type { CaseDetail } from "@/lib/types";
import MicroLabel from "@/components/ui/MicroLabel";
import Card from "@/components/ui/Card";
import { colors, fonts, radii } from "@/constants/tokens";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "timeline", label: "Timeline" },
  { key: "rights", label: "Rights" },
  { key: "options", label: "Options" },
  { key: "plan", label: "Action plan" },
  { key: "evidence", label: "Evidence" },
  { key: "similar", label: "Similar" },
  { key: "docs", label: "Documents" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function money(v: number | null) {
  return v == null ? null : `$${v.toLocaleString()}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function CaseWorkspaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("overview");
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getCase(id);
        setCaseData(res.case);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Couldn't load this case.");
      }
    })();
  }, [id]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  if (!caseData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const c = caseData;
  const recoveryRange =
    c.recoveryLow != null || c.recoveryHigh != null
      ? c.recoveryLow != null && c.recoveryHigh != null && c.recoveryLow !== c.recoveryHigh
        ? `${money(c.recoveryLow)}–${money(c.recoveryHigh)}`
        : money(c.recoveryLow ?? c.recoveryHigh)
      : "Not monetary";
  const evidenceHaveCount = c.evidenceHave.length;
  const evidenceTotal = evidenceHaveCount + c.evidenceNeeded.length;

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable style={styles.backTile} onPress={() => router.back()}>
            <Text style={styles.backChevron}>‹</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <MicroLabel>
              Case file · {c.confidenceLabel}
            </MicroLabel>
            <Text style={styles.caseTitle}>{c.title}</Text>
          </View>
          <View style={styles.statusDot} />
        </View>
        <Text style={styles.subline}>
          {c.category} · Opened {formatDate(c.createdAt)}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={{ gap: 7, paddingRight: 18 }}>
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <Pressable key={t.key} onPress={() => setTab(t.key)} style={[styles.tabPill, active && styles.tabPillActive]}>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={styles.divider} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.body}>
        {tab === "overview" && (
          <View style={{ gap: 14 }}>
            <View style={styles.heroPanel}>
              <MicroLabel color={colors.onDarkFaint2}>Estimated recovery</MicroLabel>
              <Text style={styles.heroAmount}>{recoveryRange}</Text>
              {!!c.recoverySummary && <Text style={styles.heroBody}>{c.recoverySummary}</Text>}
              <View style={styles.heroDivider} />
              <View style={styles.confidenceRow}>
                <View style={{ flexDirection: "row", gap: 3 }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <View
                      key={i}
                      style={[
                        styles.confidenceSeg,
                        { backgroundColor: i < c.confidenceScore ? colors.successLight : "rgba(255,255,255,0.18)" },
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.confidenceLabel}>
                  {c.confidenceLabel} · {c.confidenceScore} of 5
                </Text>
              </View>
            </View>

            <Card radius={radii.md}>
              <MicroLabel color={colors.faint} style={{ marginBottom: 7 }}>
                What happened
              </MicroLabel>
              <Text style={styles.bodyText}>{c.whatHappened}</Text>
            </Card>

            <Pressable onPress={() => setTab(c.demandLetter ? "docs" : "plan")}>
              <View style={styles.recommendedCallout}>
                <View style={styles.recommendedIconTile}>
                  <View style={styles.recommendedIconGlyph} />
                </View>
                <View style={{ flex: 1 }}>
                  <MicroLabel color="#5c8a6e">Recommended next step</MicroLabel>
                  <Text style={styles.recommendedTitle}>{c.nextStep}</Text>
                  {!!c.nextStepDetail && (
                    <Text style={styles.recommendedDetail} numberOfLines={2}>
                      {c.nextStepDetail}
                    </Text>
                  )}
                </View>
                <Text style={styles.chevronLg}>›</Text>
              </View>
            </Pressable>

            <View style={styles.statGrid}>
              <StatTile label="Rights on your side" value={c.rights.length} onPress={() => setTab("rights")} />
              <StatTile label="Ways to resolve it" value={c.options.length} onPress={() => setTab("options")} />
              <StatTile label="Evidence gathered" value={`${evidenceHaveCount}/${evidenceTotal}`} onPress={() => setTab("evidence")} />
              <StatTile label="Timeline events" value={c.timeline.length} onPress={() => setTab("timeline")} />
            </View>

            <View style={styles.disclaimerRow}>
              <View style={styles.disclaimerDot}>
                <Text style={styles.disclaimerDotText}>i</Text>
              </View>
              <Text style={styles.disclaimerText}>
                This is legal information to help you decide, not legal advice. For a binding opinion,
                consult a licensed attorney.
              </Text>
            </View>
          </View>
        )}

        {tab === "timeline" && (
          <View>
            <SectionTitle title="Timeline of events" sub="Built from your intake answers." />
            <View style={{ paddingLeft: 8 }}>
              {c.timeline.map((e, i) => (
                <View key={i} style={styles.timelineRow}>
                  <View style={styles.timelineDot} />
                  <Text style={styles.timelineWhen}>{e.when}</Text>
                  <Text style={styles.timelineTitle}>{e.title}</Text>
                  <Text style={styles.timelineNote}>{e.note}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {tab === "rights" && (
          <View>
            <SectionTitle
              title="Your rights, in plain English"
              sub={c.jurisdiction ? `Based on ${c.jurisdiction} law.` : "General guidance — specifics vary by location."}
            />
            <View style={{ gap: 12 }}>
              {c.rights.map((r, i) => (
                <Card key={i} radius={radii.md}>
                  <View style={{ flexDirection: "row", gap: 11 }}>
                    <View style={styles.rightIconTile}>
                      <View style={styles.rightIconDot} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{r.title}</Text>
                      <Text style={styles.rightLawText}>{r.law}</Text>
                    </View>
                  </View>
                  <Text style={[styles.bodyText, { marginTop: 10 }]}>{r.body}</Text>
                </Card>
              ))}
            </View>
          </View>
        )}

        {tab === "options" && (
          <View>
            <SectionTitle title="Your options" sub="Ranked by effort and likelihood of recovery." />
            <View style={{ gap: 12 }}>
              {c.options.map((o, i) => (
                <Card key={i} radius={radii.md}>
                  {o.recommended && (
                    <Text style={styles.recommendedBadge}>RECOMMENDED</Text>
                  )}
                  <Text style={styles.optionName}>{o.name}</Text>
                  <Text style={[styles.bodyText, { marginTop: 5 }]}>{o.why}</Text>
                  <View style={styles.optionMetaRow}>
                    <MetaCell label="Effort" value={o.effort} />
                    <MetaCell label="Timeline" value={o.time} />
                    <MetaCell label="Cost" value={o.cost} />
                  </View>
                  <View style={{ flexDirection: "row", gap: 14, marginTop: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.prosLabel}>Pros</Text>
                      {o.pros.map((p, j) => (
                        <Text key={j} style={styles.prosText}>
                          + {p}
                        </Text>
                      ))}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.consLabel}>Cons</Text>
                      {o.cons.map((cc, j) => (
                        <Text key={j} style={styles.consText}>
                          – {cc}
                        </Text>
                      ))}
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        )}

        {tab === "plan" && (
          <View>
            <SectionTitle title="Your action plan" sub={`${c.actionPlan.length} steps identified for your case.`} />
            <View style={{ gap: 11 }}>
              {c.actionPlan.map((s, i) => (
                <View key={i} style={styles.planRow}>
                  <View style={[styles.planCircle, i === 0 ? styles.planCircleCurrent : styles.planCircleUpcoming]}>
                    <Text style={[styles.planCircleText, i === 0 && styles.planCircleTextCurrent]}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={styles.cardTitle}>{s.title}</Text>
                      {i === 0 && <Text style={styles.nextUpChip}>Next up</Text>}
                    </View>
                    <Text style={[styles.bodyText, { marginTop: 3 }]}>{s.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {tab === "evidence" && (
          <View>
            <SectionTitle title="Evidence center" sub="What you have, and what would strengthen your case." />
            <MicroLabel color="#5c8a6e" style={{ marginBottom: 9 }}>
              You have this
            </MicroLabel>
            <View style={{ gap: 8, marginBottom: 20 }}>
              {c.evidenceHave.length === 0 && <Text style={styles.mutedNote}>Nothing recorded yet.</Text>}
              {c.evidenceHave.map((h, i) => (
                <View key={i} style={styles.evidenceHaveRow}>
                  <View style={styles.evidenceCheckTile}>
                    <Text style={styles.evidenceCheck}>✓</Text>
                  </View>
                  <Text style={styles.evidenceHaveText}>{h}</Text>
                </View>
              ))}
            </View>
            <MicroLabel color={colors.amber} style={{ marginBottom: 9 }}>
              Would strengthen your case
            </MicroLabel>
            <View style={{ gap: 8 }}>
              {c.evidenceNeeded.map((m, i) => (
                <View key={i} style={styles.evidenceMissingCard}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View style={styles.evidencePlusTile}>
                      <Text style={styles.evidencePlus}>+</Text>
                    </View>
                    <Text style={styles.evidenceMissingName}>{m.name}</Text>
                  </View>
                  <Text style={styles.evidenceWhy}>{m.why}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {tab === "similar" && (
          <View>
            <SectionTitle title="Similar situations" sub="How comparable disputes have resolved." />
            <View style={styles.similarEmptyCard}>
              <Text style={styles.cardTitle}>Real outcome data isn't connected yet</Text>
              <Text style={[styles.bodyText, { marginTop: 8 }]}>
                We don't want to show you made-up statistics. Once this is backed by public court records,
                regulator complaint databases, and this platform's own case outcomes, comparable cases and
                resolution rates will appear here.
              </Text>
            </View>
          </View>
        )}

        {tab === "docs" && (
          <View>
            <SectionTitle title="Documents" sub="Built from your case details." />
            {c.demandLetter ? (
              <View style={{ marginBottom: 20 }}>
                <View style={styles.docCard}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View style={styles.docIconTile}>
                      <View style={styles.docIconGlyph} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>Demand letter</Text>
                      <Text style={styles.docDesc}>{c.demandLetter.subject}</Text>
                    </View>
                  </View>
                  <Text style={styles.docStatus}>Ready to send</Text>
                </View>
                <View style={styles.letterPreview}>
                  <MicroLabel color={colors.faint} style={{ marginBottom: 12 }}>
                    Demand letter · preview
                  </MicroLabel>
                  <Text style={styles.letterBody}>{c.demandLetter.body}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.mutedNote}>No demand letter needed for this type of case.</Text>
            )}

            <MicroLabel color={colors.faint} style={{ marginBottom: 9, marginTop: 6 }}>
              Evidence summary
            </MicroLabel>
            <Card radius={radii.md} style={{ marginBottom: 20 }}>
              <Text style={styles.bodyText}>
                {evidenceHaveCount} of {evidenceTotal} evidence items gathered.
                {c.evidenceNeeded.length > 0 ? ` Still needed: ${c.evidenceNeeded.map((e) => e.name).join(", ")}.` : ""}
              </Text>
            </Card>

            <MicroLabel color={colors.faint} style={{ marginBottom: 9 }}>
              Action plan checklist
            </MicroLabel>
            <Card radius={radii.md}>
              {c.actionPlan.map((s, i) => (
                <Text key={i} style={styles.bodyText}>
                  {i + 1}. {s.title}
                </Text>
              ))}
            </Card>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StatTile({ label, value, onPress }: { label: string; value: string | number; onPress: () => void }) {
  return (
    <Pressable style={styles.statTile} onPress={onPress}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function SectionTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.canvas, padding: 24 },
  errorText: { color: colors.amberDeep, fontSize: 14, textAlign: "center" },
  header: { paddingTop: 54, paddingHorizontal: 18, backgroundColor: colors.canvas },
  headerTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  backTile: {
    width: 34,
    height: 34,
    borderRadius: radii.tile,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  backChevron: { fontSize: 18, color: colors.muted2 },
  caseTitle: { fontFamily: fonts.serifSemiBold, fontSize: 21, color: colors.ink, marginTop: 1 },
  statusDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.success },
  subline: { color: colors.muted2, fontSize: 12.5, marginLeft: 44, marginTop: 5, marginBottom: 12 },
  tabScroll: { marginHorizontal: -18, paddingLeft: 18 },
  tabPill: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 11 },
  tabPillActive: { backgroundColor: colors.primary },
  tabLabel: { fontSize: 13.5, fontFamily: fonts.sansMedium, color: colors.muted2 },
  tabLabelActive: { color: colors.onDarkText, fontFamily: fonts.sansSemiBold },
  divider: { height: 1, backgroundColor: colors.divider, marginTop: 12, marginHorizontal: -18 },
  body: { padding: 18, paddingBottom: 44 },
  heroPanel: { backgroundColor: colors.primaryDeep, borderRadius: radii.lg, padding: 21 },
  heroAmount: { fontFamily: fonts.serifMedium, fontSize: 40, color: colors.onDarkText, marginTop: 8 },
  heroBody: { fontSize: 13.5, color: colors.onDarkFaint, marginTop: 8, lineHeight: 19 },
  heroDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.12)", marginTop: 16, marginBottom: 14 },
  confidenceRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  confidenceSeg: { width: 16, height: 6, borderRadius: 3 },
  confidenceLabel: { fontSize: 12.5, color: colors.onDarkFaint },
  bodyText: { fontSize: 14, color: colors.ink2, lineHeight: 21 },
  recommendedCallout: {
    backgroundColor: colors.greenTintBg,
    borderWidth: 1,
    borderColor: colors.greenTintBorder,
    borderRadius: radii.md,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  recommendedIconTile: { width: 40, height: 40, borderRadius: radii.tile, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  recommendedIconGlyph: { width: 13, height: 16, backgroundColor: colors.surface, borderRadius: 2 },
  recommendedTitle: { fontSize: 15.5, fontFamily: fonts.sansSemiBold, color: colors.ink, marginTop: 2 },
  recommendedDetail: { fontSize: 12, color: colors.muted2, marginTop: 3 },
  chevronLg: { color: colors.primary, fontSize: 20 },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statTile: { width: "47%", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 16, padding: 14 },
  statValue: { fontFamily: fonts.serifSemiBold, fontSize: 24, color: colors.primaryDeep },
  statLabel: { fontSize: 12.5, color: colors.muted2, marginTop: 2 },
  disclaimerRow: { flexDirection: "row", gap: 8, paddingHorizontal: 4, marginTop: 2 },
  disclaimerDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: "#b6bdb4", alignItems: "center", justifyContent: "center", marginTop: 1 },
  disclaimerDotText: { fontSize: 9, color: colors.faint2 },
  disclaimerText: { fontSize: 11.5, color: colors.faint2, lineHeight: 16, flex: 1 },
  sectionTitle: { fontFamily: fonts.serifSemiBold, fontSize: 20, color: colors.ink },
  sectionSub: { fontSize: 13, color: colors.muted2, marginTop: 4 },
  timelineRow: { paddingLeft: 26, paddingBottom: 20, borderLeftWidth: 2, borderLeftColor: colors.track, position: "relative" },
  timelineDot: {
    position: "absolute",
    left: -7,
    top: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: "#9db3a4",
  },
  timelineWhen: { fontSize: 11.5, fontFamily: fonts.sansSemiBold, color: colors.faint2, letterSpacing: 0.3 },
  timelineTitle: { fontSize: 15, fontFamily: fonts.sansSemiBold, color: colors.ink, marginTop: 2 },
  timelineNote: { fontSize: 13, color: colors.muted, marginTop: 3, lineHeight: 18 },
  cardTitle: { fontSize: 15, fontFamily: fonts.sansSemiBold, color: colors.ink, lineHeight: 19 },
  rightIconTile: { width: 26, height: 26, borderRadius: 8, backgroundColor: colors.greenTintBg, alignItems: "center", justifyContent: "center" },
  rightIconDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.success },
  rightLawText: { fontSize: 11, color: colors.faint, marginTop: 3, fontFamily: fonts.sansMedium },
  recommendedBadge: {
    fontSize: 10.5,
    fontFamily: fonts.sansBold,
    letterSpacing: 1,
    color: colors.onDarkText,
    backgroundColor: colors.primary,
    borderRadius: 7,
    paddingVertical: 3,
    paddingHorizontal: 9,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  optionName: { fontSize: 16, fontFamily: fonts.sansSemiBold, color: colors.ink },
  optionMetaRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0ebe0",
  },
  metaLabel: { fontSize: 10, color: colors.faint, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: fonts.sansSemiBold },
  metaValue: { fontSize: 13, color: colors.ink2, fontFamily: fonts.sansSemiBold, marginTop: 2 },
  prosLabel: { fontSize: 11, color: "#5c8a6e", fontFamily: fonts.sansSemiBold, marginBottom: 5 },
  prosText: { fontSize: 12.5, color: colors.muted, lineHeight: 18, marginBottom: 3 },
  consLabel: { fontSize: 11, color: colors.amber, fontFamily: fonts.sansSemiBold, marginBottom: 5 },
  consText: { fontSize: 12.5, color: colors.faint2, lineHeight: 18, marginBottom: 3 },
  planRow: { flexDirection: "row", gap: 13, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 16, padding: 14 },
  planCircle: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  planCircleCurrent: { backgroundColor: colors.primary },
  planCircleUpcoming: { backgroundColor: colors.planUpcomingBg },
  planCircleText: { fontSize: 13, fontFamily: fonts.sansBold, color: colors.faint },
  planCircleTextCurrent: { color: colors.onDarkText },
  nextUpChip: { fontSize: 10.5, fontFamily: fonts.sansSemiBold, color: colors.primary, backgroundColor: colors.greenTintBg, borderRadius: 6, paddingVertical: 2, paddingHorizontal: 7 },
  mutedNote: { fontSize: 13, color: colors.faint2 },
  evidenceHaveRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 14, padding: 12 },
  evidenceCheckTile: { width: 24, height: 24, borderRadius: 7, backgroundColor: colors.greenTintBg, alignItems: "center", justifyContent: "center" },
  evidenceCheck: { color: colors.success, fontSize: 12 },
  evidenceHaveText: { fontSize: 14, fontFamily: fonts.sansMedium, color: colors.ink },
  evidenceMissingCard: { backgroundColor: colors.amberBg2, borderWidth: 1, borderColor: colors.amberBorder, borderRadius: 14, padding: 13 },
  evidencePlusTile: { width: 24, height: 24, borderRadius: 7, backgroundColor: colors.amberBg, alignItems: "center", justifyContent: "center" },
  evidencePlus: { color: colors.amber, fontSize: 14 },
  evidenceMissingName: { fontSize: 14, fontFamily: fonts.sansSemiBold, color: colors.ink, flex: 1 },
  evidenceWhy: { fontSize: 12.5, color: "#7d766a", lineHeight: 18, marginTop: 8, paddingLeft: 36 },
  similarEmptyCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: radii.md, padding: 18 },
  docCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: radii.md, padding: 16, marginBottom: 12 },
  docIconTile: { width: 38, height: 38, borderRadius: radii.tile, backgroundColor: colors.greenTintBg, alignItems: "center", justifyContent: "center" },
  docIconGlyph: { width: 13, height: 16, backgroundColor: colors.primary, borderRadius: 2 },
  docDesc: { fontSize: 12, color: colors.faint, marginTop: 1 },
  docStatus: { fontSize: 11, fontFamily: fonts.sansSemiBold, color: "#5c8a6e", backgroundColor: colors.greenTintBg, borderRadius: 7, paddingVertical: 3, paddingHorizontal: 10, alignSelf: "flex-start", marginTop: 12 },
  letterPreview: { backgroundColor: colors.warmOffWhite, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: radii.md, padding: 18 },
  letterBody: { fontFamily: fonts.serif, fontSize: 13.5, color: colors.ink2, lineHeight: 22 },
});
