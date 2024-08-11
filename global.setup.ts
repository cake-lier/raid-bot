import { GenericContainer, Wait } from "testcontainers";
import playwright from "@playwright/test/package.json";

export default async function globalSetup() {
    if (!process.env["CI"]) {
        process.env["PW_TEST_CONNECT_WS_ENDPOINT"] = "ws://127.0.0.1:3030/";
        const playwrightVersion = playwright.version;
        console.log("Starting playwright container...");
        const playwrightContainer = await new GenericContainer(
            `mcr.microsoft.com/playwright:v${playwrightVersion}`,
        )
            .withNetworkMode("host")
            .withCommand([
                "/bin/sh",
                "-c",
                `cd /home/pwuser && npx -y playwright@${playwrightVersion} run-server --port 3030`,
            ])
            .withWaitStrategy(Wait.forLogMessage("Listening on ws://localhost:3030/"))
            .start();
        console.log("Playwright container started!");
        process.env["PLAYWRIGHT_CONTAINER_ID"] = playwrightContainer.getId();
    }
}
