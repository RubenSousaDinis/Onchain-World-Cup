import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

const eslintConfig = [
  ...tseslint.configs.recommended,
  {
    ignores: [
      ".next/**",
      ".turbo/**",
      "node_modules/**",
      "artifacts/**",
      "cache/**",
      "dist/**",
      "build/**",
      "typechain-types/**",
      "coverage/**",
    ],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
      "react": reactPlugin,
      "react-hooks": hooksPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "off",
    },
  },
  // Allow require() in .js files, test files, script files, and config files
  {
    files: [
      "**/*.js",
      "**/*.cjs",
      "**/*.mjs",
      "test/**/*.{js,ts}",
      "scripts/**/*.{js,ts}",
      "hardhat.config.js",
      "hardhat.config.ts",
    ],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-expressions": "off", // For Chai assertions in tests
      "@typescript-eslint/no-unused-vars": "off", // Allow unused vars in test files
    },
  },
];

export default eslintConfig;
