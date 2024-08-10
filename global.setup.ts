import { GenericContainer, Wait } from "testcontainers";
import playwright from "@playwright/test/package.json";
import { config } from "dotenv";

export default async function globalSetup() {
    if (!process.env["CI"]) {
        process.env["PW_TEST_CONNECT_WS_ENDPOINT"] = "ws://127.0.0.1:3000/";
        const playwrightVersion = playwright.version;
        console.log("Running playwright container...");
        await new GenericContainer(`mcr.microsoft.com/playwright:v${playwrightVersion}`)
            .withNetworkMode("host")
            .withExposedPorts(3000)
            .withCommand([
                "/bin/sh",
                "-c",
                `cd /home/pwuser && npx -y playwright@${playwrightVersion} run-server --port 3000`,
            ])
            .start();
        config();
    }
    console.log("Building server image...");
    const builtServerContainer = await GenericContainer.fromDockerfile(process.cwd()).build();
    console.log("Running server container...");
    await builtServerContainer
        .withExposedPorts({ container: 10_000, host: 10_000 })
        .withEnvironment({
            DB_HOST: process.env["DB_HOST"] ?? "",
            DB_USERNAME: process.env["DB_USERNAME"] ?? "",
            DB_PASSWORD: process.env["DB_PASSWORD"] ?? "",
            APP_NAME: process.env["APP_NAME"] ?? "",
            DB_NAME: process.env["DB_NAME"] ?? "",
            BOT_TOKEN: process.env["BOT_TOKEN"] ?? "",
            SESSION_SECRET: process.env["SESSION_SECRET"] ?? "",
        })
        .withWaitStrategy(Wait.forHttp("/", 10_000))
        .start();
}
