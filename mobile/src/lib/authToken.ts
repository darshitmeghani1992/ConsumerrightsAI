import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const KEY = "cra_session_token";

// SecureStore wraps the iOS Keychain / Android Keystore — it has no real web
// equivalent, so this app's actual target (native) uses it, and web (used
// only for local smoke-testing in development, never shipped) falls back to
// localStorage.
export async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") return globalThis.localStorage?.getItem(KEY) ?? null;
  return SecureStore.getItemAsync(KEY);
}

export async function setToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    globalThis.localStorage?.setItem(KEY, token);
    return;
  }
  await SecureStore.setItemAsync(KEY, token);
}

export async function clearToken(): Promise<void> {
  if (Platform.OS === "web") {
    globalThis.localStorage?.removeItem(KEY);
    return;
  }
  await SecureStore.deleteItemAsync(KEY);
}
