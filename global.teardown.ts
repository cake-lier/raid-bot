import { getContainerRuntimeClient } from "testcontainers";

export default async function globalTeardown() {
    if (process.env["PLAYWRIGHT_CONTAINER_ID"]) {
        const client = await getContainerRuntimeClient();
        await client.container.getById(process.env["PLAYWRIGHT_CONTAINER_ID"]).stop();
    }
}
