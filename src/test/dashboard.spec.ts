import { test, expect } from "@playwright/test";
import { Subscription, SubscriptionId } from "@/main/SubscriptionModel";

const loginApiEndpoint = "**/api/users/loggedIn";
const subscriptionEndpoint = "**/api/subscriptions";
const dashboardPage = "http://localhost:3000/dashboard";

test("redirects to home when user is not logged in", async ({ page }) => {
    await page.route(loginApiEndpoint, async (route) => {
        await route.fulfill({ status: 404 });
    });
    await page.goto(dashboardPage);
    await page.waitForURL("http://localhost:3000/");
});

test("has correct title and body", async ({ page }) => {
    await page.route(loginApiEndpoint, async (route) => {
        await route.fulfill({ json: { username: "cake_lier" } });
    });
    await page.route(subscriptionEndpoint, async (route) => {
        await route.fulfill({ json: { subscriptions: [] } });
    });
    await page.goto(dashboardPage);
    await expect(page).toHaveTitle("Raid bot");
    const subscriptionTable = page.getByRole("table");
    await expect(subscriptionTable.getByRole("columnheader")).toHaveText([
        "User id",
        "Chat id",
        "Username",
        "Delete?",
    ]);
});

test("logs out user when right button is clicked", async ({ page }) => {
    await page.route(loginApiEndpoint, async (route) => {
        await route.fulfill({ json: { username: "cake_lier" } });
    });
    await page.route(subscriptionEndpoint, async (route) => {
        await route.fulfill({ json: { subscriptions: [] } });
    });
    await page.goto(dashboardPage);
    await page.getByRole("button", { name: "Logout" }).click();
    await page.waitForURL("http://localhost:3000/");
});

test("deletes subscription when right button is clicked", async ({ page }) => {
    const userId = 1;
    const chatId = 2;
    const username = "cake_lier";
    await page.route(loginApiEndpoint, async (route) => {
        await route.fulfill({ json: { username: "cake_lier" } });
    });
    await page.route(subscriptionEndpoint, async (route) => {
        await route.fulfill({
            json: { subscriptions: [{ userId, chatId, username }] },
        });
    });
    await page.goto(dashboardPage);
    const subscriptionTable = page.getByRole("table");
    await expect(subscriptionTable.getByRole("cell")).toHaveText([
        userId.toString(),
        chatId.toString(),
        username,
        "",
    ]);
    const deleteButton = subscriptionTable.getByRole("cell").getByRole("button");
    await page.route(subscriptionEndpoint, async (route) => {
        const subscription = route.request().postDataJSON() as SubscriptionId;
        switch (route.request().method()) {
            case "GET":
                await route.fulfill({ json: { subscriptions: [] } });
                break;
            case "DELETE":
                expect(subscription.userId).toBe(userId);
                expect(subscription.chatId).toBe(chatId);
                await route.fulfill();
                break;
        }
    });
    await deleteButton.click();
    await expect(subscriptionTable.locator("tbody")).toHaveText("No available options");
});

test("add subscription when inserted", async ({ page }) => {
    const userId = 1;
    const chatId = 2;
    const username = "cake_lier";
    await page.route(loginApiEndpoint, async (route) => {
        await route.fulfill({ json: { username: "cake_lier" } });
    });
    await page.route(subscriptionEndpoint, async (route) => {
        const subscription = route.request().postDataJSON() as Subscription;
        switch (route.request().method()) {
            case "GET":
                await route.fulfill({ json: { subscriptions: [] } });
                break;
            case "PUT":
                expect(subscription.userId).toBe(userId);
                expect(subscription.chatId).toBe(chatId);
                expect(subscription.username).toBe(username);
                await route.fulfill({
                    json: { subscriptions: [{ userId, chatId, username }] },
                });
        }
    });
    await page.goto(dashboardPage);
    const subscriptionTable = page.getByRole("table");
    await expect(subscriptionTable.locator("tbody")).toHaveText("No available options");
    await page.locator('input[name="user_id"]').fill(userId.toString());
    await page.locator('input[name="chat_id"]').fill(chatId.toString());
    await page.locator('input[name="username"]').fill(username);
    await page.getByRole("button", { name: "Insert" }).click();
    await expect(subscriptionTable.getByRole("cell")).toHaveText([
        userId.toString(),
        chatId.toString(),
        username,
        "",
    ]);
});
