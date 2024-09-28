import { configDefaults, coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        exclude: [...configDefaults.exclude, "**/*.js"],
        coverage: {
            all: true,
            provider: "istanbul",
            reporter: ["text", "cobertura", "lcov"],
            exclude: [...coverageConfigDefaults.exclude, "*.js", "**/index.ts", "**/Controller.ts"],
        },
    },
});
