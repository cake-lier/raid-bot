import { configDefaults, coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        exclude: [...configDefaults.exclude, "**/*.js"],
        coverage: {
            all: false,
            provider: "istanbul",
            reporter: ["text", "html", "cobertura"],
            exclude: [...coverageConfigDefaults.exclude, "**/index.ts"],
        },
    },
});
