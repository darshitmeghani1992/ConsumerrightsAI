import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { colors, radii, shadow } from "@/constants/tokens";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
};

export default function Card({ children, style, radius = radii.md }: Props) {
  return <View style={[styles.card, { borderRadius: radius }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    ...shadow.card,
  },
});
