import {configDefaults, coverageConfigDefaults, defineConfig} from "vitest/config";

export default defineConfig({
    test: {
        exclude: [...configDefaults.exclude, "**/*.js"],
        coverage: {
            reporter: ["text", "html"]
        },
    },
});