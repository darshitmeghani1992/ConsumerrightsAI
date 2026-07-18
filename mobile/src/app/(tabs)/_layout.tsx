import { Tabs } from "expo-router";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { colors } from "@/constants/tokens";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.faint,
        tabBarStyle: {
          backgroundColor: colors.canvas,
          borderTopColor: colors.divider,
          borderTopWidth: 1,
          height: 88,
          paddingTop: 10,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Cases",
          tabBarIcon: ({ color }) => (
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Rect x="4" y="5" width="16" height="15" rx="2.5" stroke={color} strokeWidth={1.9} />
              <Path d="M8 10h8M8 14h5" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
            </Svg>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="12" r="3.2" stroke={color} strokeWidth={1.9} />
              <Path
                d="M12 3v3M12 18v3M21 12h-3M6 12H3M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1M18.4 18.4l-2.1-2.1M7.7 7.7 5.6 5.6"
                stroke={color}
                strokeWidth={1.7}
                strokeLinecap="round"
              />
            </Svg>
          ),
        }}
      />
    </Tabs>
  );
}
