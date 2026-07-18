import { useState } from "react";
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { api, ApiError } from "@/lib/api";
import { setToken } from "@/lib/authToken";
import { useSession } from "@/store/session";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { colors, fonts, radii } from "@/constants/tokens";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const hydrate = useSession((s) => s.hydrate);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isSignup = mode === "signup";

  async function submit() {
    setError("");
    setLoading(true);
    try {
      const res = isSignup ? await api.signup(email, password) : await api.login(email, password);
      await setToken(res.token);
      const me = await api.me();
      hydrate(me);
      router.replace("/(tabs)/home");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>{isSignup ? "Create your account" : "Welcome back"}</Text>
          <Text style={styles.subtitle}>
            {isSignup
              ? "So your case is here whenever you come back."
              : "Log in to see your case workspace."}
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor={colors.faint}
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder="••••••••"
              placeholderTextColor={colors.faint}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <PrimaryButton
            title={loading ? "Please wait…" : isSignup ? "Create account" : "Log in"}
            onPress={submit}
            disabled={loading || !email || !password}
            style={{ marginTop: 22 }}
          />

          <Text style={styles.switchText}>
            {isSignup ? "Already have an account? " : "New here? "}
            <Text style={styles.switchLink} onPress={() => router.replace(isSignup ? "/login" : "/signup")}>
              {isSignup ? "Log in" : "Create an account"}
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  scroll: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radii.lg,
    padding: 26,
  },
  title: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 23,
    textAlign: "center",
    color: colors.ink,
  },
  subtitle: {
    fontSize: 13.5,
    color: colors.muted2,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 19,
  },
  field: { marginTop: 18 },
  label: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.faint,
    marginBottom: 7,
    fontFamily: fonts.sansSemiBold,
  },
  input: {
    height: 50,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.surface,
    color: colors.ink,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: fonts.sans,
  },
  errorBox: {
    marginTop: 16,
    backgroundColor: colors.amberBg,
    borderRadius: 10,
    padding: 12,
  },
  errorText: { color: colors.amberDeep, fontSize: 13, fontFamily: fonts.sans },
  switchText: {
    textAlign: "center",
    fontSize: 13.5,
    color: colors.muted2,
    marginTop: 20,
    fontFamily: fonts.sans,
  },
  switchLink: { color: colors.primary, fontFamily: fonts.sansSemiBold },
});
