import { defineConfig } from "eslint/config";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

// Shared settings
const sharedLanguageOptions = {
    globals: {
        ...globals.browser,
    },
    ecmaVersion: "latest",
    sourceType: "module",
};

const sharedPlugins = {
    react: fixupPluginRules(react),
    "react-hooks": fixupPluginRules(reactHooks),
};

export default defineConfig([
    // ⛔ Ignore build/output folders
    {
        ignores: [
            "renderer/.next/**",
            "app/**",
            "app/*",
            "node_modules/**",
            "dist/**",
            "build/**",
        ],
    },

    // 🧠 JavaScript and JSX files
    {
        files: ["**/*.js", "**/*.jsx"],
        extends: fixupConfigRules(compat.extends(
            "eslint:recommended",
            "plugin:react/recommended",
            "plugin:react-hooks/recommended",
        )),
        languageOptions: {
            ...sharedLanguageOptions,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            ...sharedPlugins,
        },
        rules: {
            // Additional JS-specific rules can go here
        },
        settings: {
            react: {
                version: "detect", // 👈 Auto-detect React version
            },
        },
    },

    // 🧠 TypeScript and TSX files
    {
        files: ["**/*.ts", "**/*.tsx"],
        extends: [
            ...fixupConfigRules(compat.extends(
                "plugin:react/recommended",
                "plugin:react-hooks/recommended",
            )),
            ...tseslint.configs.recommended, // 🧩 TypeScript recommended rules
        ],
        languageOptions: {
            ...sharedLanguageOptions,
            parser: tseslint.parser,
            parserOptions: {
                project: "./tsconfig.json", // Make sure you have this!
                tsconfigRootDir: __dirname,
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            ...sharedPlugins,
            "@typescript-eslint": tseslint.plugin,
        },
        rules: {
            "@typescript-eslint/consistent-type-imports": "warn",
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            // Additional TypeScript-specific rules can go here
        },
        settings: {
            react: {
                version: "detect", // 👈 Auto-detect React version
            },
        },
    },
]);
