import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./src/test",
    testMatch: "*.spec.ts",
    fullyParallel: true,
    forbidOnly: !!process.env["CI"],
    retries: 0,
    workers: process.env["CI"] ? 1 : "50%",
    reporter: "html",
    use: {
        trace: "on-first-retry",
    },
    globalSetup: require.resolve("./global.setup"),
    globalTeardown: require.resolve("./global.teardown"),
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
        {
            name: "firefox",
            use: { ...devices["Desktop Firefox"] },
        },
        {
            name: "webkit",
            use: { ...devices["Desktop Safari"] },
        },
    ],
    webServer: {
        command: "npm run next:dev",
        url: "http://localhost:3000/",
        reuseExistingServer: !process.env["CI"],
    },
});
