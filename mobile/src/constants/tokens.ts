// Design tokens transcribed from the design handoff
// (design_handoff_consumer_rights_copilot/README.md § Design Tokens).
export const colors = {
  canvas: "#f4f1ea",
  surface: "#ffffff",
  warmOffWhite: "#fffdf9",

  ink: "#1c2620",
  ink2: "#33403a",
  muted: "#5d6b63",
  muted2: "#6a766e",
  faint: "#9aa49b",
  faint2: "#8a948b",

  primary: "#37624a",
  primaryDeep: "#274736",
  greenTintBg: "#eef3ee",
  greenTintBorder: "#d5e2d8",
  success: "#4d8a63",
  successLight: "#8fc2a0",

  cardBorder: "#ece7db",
  divider: "#e7e2d7",
  track: "#e2ddd0",
  inputBorder: "#ddd7c9",

  amber: "#a37a52",
  amberDeep: "#96602c",
  amberBg: "#f4e6d3",
  amberBg2: "#fbf7f0",
  amberBorder: "#ecdfcb",

  onDarkText: "#eef3ee",
  onDarkFaint: "#c7d6ca",
  onDarkFaint2: "#9fc0ac",

  continueDisabledBg: "#e0e4dd",
  continueDisabledText: "#a7b0a8",
  chipBg: "#f0ede4",
  chipBorder: "#e6e1d4",
  planUpcomingBg: "#f0ebe0",
};

// Family name strings must match the keys expo-font registers them under —
// see src/hooks/useAppFonts.ts.
export const fonts = {
  serif: "Newsreader_400Regular",
  serifMedium: "Newsreader_500Medium",
  serifSemiBold: "Newsreader_600SemiBold",
  sans: "HankenGrotesk_400Regular",
  sansMedium: "HankenGrotesk_500Medium",
  sansSemiBold: "HankenGrotesk_600SemiBold",
  sansBold: "HankenGrotesk_700Bold",
};

export const radii = {
  sm: 14,
  md: 18,
  lg: 22,
  pill: 9999,
  chip: 8,
  tile: 12,
};

export const shadow = {
  card: {
    shadowColor: "#1c2620",
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  elevated: {
    shadowColor: "#1c2620",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
} as const;
