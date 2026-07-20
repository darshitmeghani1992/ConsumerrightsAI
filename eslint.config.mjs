import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // mobile/ is a separate Expo project with its own dependencies and lint
    // setup — it must never be picked up by the root Next.js build/lint.
    "mobile/**",
    // Reference-only design prototype files, not part of the shipped app.
    "design_handoff_consumer_rights_copilot/**",
  ]),
]);

export default eslintConfig;
