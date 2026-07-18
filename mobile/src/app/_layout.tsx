import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useAppFonts } from "@/hooks/useAppFonts";
import { useSessionBootstrap } from "@/hooks/useSessionBootstrap";
import { colors } from "@/constants/tokens";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useAppFonts();
  const checkingSession = useSessionBootstrap();
  const ready = fontsLoaded && !checkingSession;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.canvas }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="intake" options={{ animation: "slide_from_bottom" }} />
      <Stack.Screen name="case/[id]" />
    </Stack>
  );
}
