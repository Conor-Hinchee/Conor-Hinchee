import js from "@eslint/js";
import prettier from "eslint-config-prettier/flat";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/", "node_modules/", "playwright-report/", "test-results/"] },
  js.configs.recommended,
  tseslint.configs.recommended,
  prettier,
  {
    languageOptions: { globals: globals.browser },
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "double", { avoidEscape: true }],
    },
  },
  {
    files: [
      "*.config.ts",
      "vite.plugins.ts",
      "scripts/**/*.ts",
      "src/tests/**/*.ts",
      "src/Home/tests/**/*.ts",
    ],
    languageOptions: { globals: globals.node },
  },
);
