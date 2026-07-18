import { Text, StyleSheet, TextStyle, StyleProp } from "react-native";
import { colors, fonts } from "@/constants/tokens";

export default function MicroLabel({
  children,
  color = colors.faint,
  style,
}: {
  children: React.ReactNode;
  color?: string;
  style?: StyleProp<TextStyle>;
}) {
  return <Text style={[styles.label, { color }, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontSize: 10.5,
    letterSpacing: 1.3,
    fontFamily: fonts.sansSemiBold,
    textTransform: "uppercase",
  },
});
