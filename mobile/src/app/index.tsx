import { View, Text, StyleSheet } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { useSession } from "@/store/session";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { colors, fonts, radii } from "@/constants/tokens";

export default function WelcomeScreen() {
  const router = useRouter();
  const signedIn = useSession((s) => s.signedIn);

  if (signedIn) return <Redirect href="/(tabs)/home" />;

  return (
    <View style={styles.page}>
      <View style={styles.hero}>
        <View style={styles.iconTile}>
          <View style={styles.iconDot} />
        </View>
        <Text style={styles.wordmark}>Consumer Rights AI</Text>
        <Text style={styles.sub}>YOUR DISPUTE, DECODED</Text>
      </View>
      <View>
        <Text style={styles.headline}>
          Know your rights.{"\n"}
          <Text style={styles.headlineEm}>Get your money back.</Text>
        </Text>
        <Text style={styles.body}>
          A withheld deposit, a refused refund, a denied claim — answer a few questions and get a
          tailored plan grounded in the laws that apply to you.
        </Text>
        <PrimaryButton title="Get started" onPress={() => router.push("/signup")} />
        <Text style={styles.switchText} onPress={() => router.push("/login")}>
          I already have an account
        </Text>
        <Text style={styles.footnote}>Legal information, not legal advice.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 96,
    paddingBottom: 46,
    paddingHorizontal: 28,
    backgroundColor: colors.canvas,
  },
  hero: { alignItems: "center", marginTop: 14 },
  iconTile: {
    width: 52,
    height: 52,
    borderRadius: radii.tile + 4,
    backgroundColor: colors.primaryDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  iconDot: { width: 15, height: 15, borderRadius: 8, backgroundColor: colors.successLight },
  wordmark: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 26,
    marginTop: 18,
    color: colors.ink,
    textAlign: "center",
  },
  sub: {
    fontSize: 11,
    letterSpacing: 2,
    color: colors.faint,
    marginTop: 8,
    fontFamily: fonts.sansSemiBold,
  },
  headline: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 34,
    lineHeight: 40,
    color: colors.ink,
  },
  headlineEm: { color: colors.primary },
  body: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.muted2,
    marginTop: 16,
    marginBottom: 26,
  },
  switchText: {
    textAlign: "center",
    fontSize: 14,
    color: colors.primary,
    marginTop: 16,
    fontFamily: fonts.sansSemiBold,
  },
  footnote: {
    textAlign: "center",
    fontSize: 12,
    color: colors.faint,
    marginTop: 20,
  },
});
