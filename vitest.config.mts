import { configDefaults, coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        exclude: [...configDefaults.exclude, "**/*.js"],
        coverage: {
            all: false,
            provider: "istanbul",
            reporter: ["text", "cobertura", "lcov"],
            exclude: [...coverageConfigDefaults.exclude, "**/index.ts"],
        },
    },
});
