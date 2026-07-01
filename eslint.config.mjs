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
  ]),
  {
    // Pola yang disengaja & aman di app ini → turunkan ke warning (tetap terlihat,
    // tapi tidak memblok CI): hidrasi tema via effect + skrip Snap Midtrans.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "@next/next/no-sync-scripts": "warn",
    },
  },
]);

export default eslintConfig;
