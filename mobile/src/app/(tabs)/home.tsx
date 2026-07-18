import { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { api, ApiError } from "@/lib/api";
import type { CaseSummary } from "@/lib/types";
import MicroLabel from "@/components/ui/MicroLabel";
import Card from "@/components/ui/Card";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { colors, fonts, radii } from "@/constants/tokens";

function recoveryLabel(low: number | null, high: number | null) {
  if (low == null && high == null) return null;
  if (low != null && high != null && low !== high) return `$${low.toLocaleString()}–$${high.toLocaleString()}`;
  const v = low ?? high;
  return v != null ? `$${v.toLocaleString()}` : null;
}

export default function HomeScreen() {
  const router = useRouter();
  const [cases, setCases] = useState<CaseSummary[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await api.listCases();
      setCases(res.cases);
      setError("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't load your cases.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <MicroLabel>Consumer Rights AI</MicroLabel>
        <Text style={styles.title}>Your cases</Text>
      </View>

      {cases === null ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : cases.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No cases yet</Text>
          <Text style={styles.emptyBody}>
            Start a guided intake and we'll build a tailored plan — rights, options, and a next step —
            from what you tell us.
          </Text>
          <PrimaryButton title="Start a new case" onPress={() => router.push("/intake")} style={{ marginTop: 20 }} />
        </View>
      ) : (
        <FlatList
          data={cases}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListHeaderComponent={
            !!error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <Pressable style={styles.newCaseRow} onPress={() => router.push("/intake")}>
                <Text style={styles.newCaseText}>+ New case</Text>
              </Pressable>
            )
          }
          renderItem={({ item }) => {
            const recovery = recoveryLabel(item.recoveryLow, item.recoveryHigh);
            return (
              <Pressable onPress={() => router.push(`/case/${item.id}`)}>
                <Card style={styles.caseCard} radius={radii.md}>
                  <View style={styles.caseCardTop}>
                    <MicroLabel color={colors.faint2}>{item.category}</MicroLabel>
                    <View style={styles.statusDot} />
                  </View>
                  <Text style={styles.caseTitle}>{item.title}</Text>
                  {!!recovery && <Text style={styles.recovery}>{recovery}</Text>}
                  <Text style={styles.nextStep} numberOfLines={1}>
                    Next: {item.nextStep}
                  </Text>
                </Card>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 8 },
  title: { fontFamily: fonts.serifSemiBold, fontSize: 26, color: colors.ink, marginTop: 6 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  emptyTitle: { fontFamily: fonts.serifSemiBold, fontSize: 20, color: colors.ink },
  emptyBody: {
    fontSize: 14,
    color: colors.muted2,
    textAlign: "center",
    lineHeight: 21,
    marginTop: 8,
  },
  list: { padding: 20, paddingTop: 8, gap: 12 },
  newCaseRow: {
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 14,
  },
  newCaseText: { color: colors.onDarkText, fontFamily: fonts.sansSemiBold, fontSize: 14.5 },
  errorText: { color: colors.amberDeep, fontSize: 13, marginBottom: 14, textAlign: "center" },
  caseCard: { marginBottom: 0 },
  caseCardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  caseTitle: { fontFamily: fonts.serifSemiBold, fontSize: 17, color: colors.ink, marginTop: 4 },
  recovery: { fontFamily: fonts.serifMedium, fontSize: 18, color: colors.primaryDeep, marginTop: 4 },
  nextStep: { fontSize: 12.5, color: colors.muted2, marginTop: 6 },
});
