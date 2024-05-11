import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import tsEslint from "typescript-eslint";
import globals from "globals";
import reactRecommended from "eslint-plugin-react/configs/jsx-runtime.js";

export default tsEslint.config(
  eslint.configs.recommended,
  ...tsEslint.configs.recommended,
  reactRecommended,
  prettier,
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    plugins: {
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    ignores: [
      "**/node_modules/",
      "**/dist/",
      "**/*.config.*js",
      "!eslint.config.js",
      "test-results/*",
      "playwright-report/*",
      "playwright/*",
    ],
  },
);
