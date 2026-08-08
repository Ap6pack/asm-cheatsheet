import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// eslint-config-next 16 ships flat config directly, so the FlatCompat shim
// used under v15 is no longer needed (and no longer works).
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // `next lint` used to supply these; the ESLint CLI needs them explicitly.
    ignores: [".next/**", "out/**", "node_modules/**"],
  },
  {
    rules: {
      // next/core-web-vitals alone does not flag unused declarations, which is
      // how dead code reached main. Underscore-prefixed names stay exempt.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
];

export default eslintConfig;
