import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
    await page.goto(`http://localhost:10000/`);
    await expect(page).toHaveTitle("Raid bot");
});
