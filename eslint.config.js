import js from "@eslint/js";
import globals from "globals";
import reactPlugin from "@eslint-react/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";

const baseConfig = [
  js.configs.recommended,
  {
    files: ["src/**/*.{js,jsx}"],
    ...reactPlugin.configs.recommended,
    plugins: {
      ...reactPlugin.configs.recommended.plugins,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^[A-Z]" },
      ],
      "@eslint-react/dom-no-dangerously-set-innerhtml": "off",
      "no-console": "warn",
    },
  },
];

const testConfig = {
  files: ["src/**/__tests__/**/*.{js,jsx}", "src/**/*.test.{js,jsx}"],
  languageOptions: {
    globals: {
      ...globals.jest,
    },
  },
};

export default [...baseConfig, testConfig];
