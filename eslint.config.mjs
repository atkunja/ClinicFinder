// eslint.config.mjs
import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import ts from "typescript-eslint";

export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  nextPlugin.configs["core-web-vitals"],

  {
    rules: {
      // Prevent TS `any` complaints from blocking builds:
      "@typescript-eslint/no-explicit-any": "off",
      // Warn for unused vars but allow underscores
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
      // Downgrade prefer-const to warning
      "prefer-const": "warn",
    },
  },
];
