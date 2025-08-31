import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    basedirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "next/typescript"),

    // ✅ ADD THIS OBJECT FOR YOUR CUSTOM RULES
    {
        rules: {
            // This will turn the 'any' type error into a warning, so the build won't fail
            "@typescript-eslint/no-explicit-any": "warn"
        }
    },

    {
        ignores: [
            "node_modules/**",
            ".next/**",
            "out/**",
            "build/**",
            "next-env.d.ts",
        ]
    },
];

export default eslintConfig;