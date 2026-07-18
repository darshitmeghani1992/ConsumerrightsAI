import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { api } from "@/lib/api";
import { clearToken } from "@/lib/authToken";
import { useSession } from "@/store/session";
import Card from "@/components/ui/Card";
import MicroLabel from "@/components/ui/MicroLabel";
import { colors, fonts, radii } from "@/constants/tokens";

export default function SettingsScreen() {
  const router = useRouter();
  const email = useSession((s) => s.email);
  const reset = useSession((s) => s.reset);

  async function logout() {
    await api.logout().catch(() => {});
    await clearToken();
    reset();
    router.replace("/");
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <MicroLabel>Account</MicroLabel>
        <Text style={styles.title}>Settings</Text>
      </View>
      <View style={styles.body}>
        <Card>
          <MicroLabel color={colors.faint2}>Signed in as</MicroLabel>
          <Text style={styles.email}>{email}</Text>
        </Card>
        <Pressable style={styles.logout} onPress={logout}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
        <Text style={styles.footnote}>
          Consumer Rights AI provides legal information to help you decide, not legal advice. For a
          binding opinion, consult a licensed attorney.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 8 },
  title: { fontFamily: fonts.serifSemiBold, fontSize: 26, color: colors.ink, marginTop: 6 },
  body: { padding: 20, gap: 16 },
  email: { fontSize: 15, color: colors.ink, marginTop: 4, fontFamily: fonts.sansMedium },
  logout: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radii.sm,
    paddingVertical: 15,
    alignItems: "center",
  },
  logoutText: { color: colors.amberDeep, fontFamily: fonts.sansSemiBold, fontSize: 14.5 },
  footnote: { fontSize: 11.5, color: colors.faint2, lineHeight: 16, marginTop: 8 },
});
