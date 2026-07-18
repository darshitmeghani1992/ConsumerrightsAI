import { Pressable, Text, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { colors, fonts, radii } from "@/constants/tokens";

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function PrimaryButton({ title, onPress, disabled, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.btn, disabled && styles.btnDisabled, style]}
    >
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: {
    backgroundColor: colors.continueDisabledBg,
  },
  label: {
    color: colors.onDarkText,
    fontSize: 15,
    fontFamily: fonts.sansSemiBold,
  },
  labelDisabled: {
    color: colors.continueDisabledText,
  },
});
