import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintConfigSonarJS from "eslint-plugin-sonarjs";

export default tseslint.config({
    files: ["**/*.ts"],
    extends: [
        eslint.configs.recommended,
        ...tseslint.configs.strictTypeChecked,
        ...tseslint.configs.stylisticTypeChecked,
        eslintConfigSonarJS.configs.recommended,
        eslintConfigPrettier,
    ],
    languageOptions: {
        parserOptions: {
            project: true,
            tsconfigRootDir: import.meta.dirname,
        },
    },
});
