import { test, expect } from "@playwright/test";

const homePage = "http://localhost:3000/";
const loginApiEndpoint = "**/api/users/loggedIn";
const passwordSelector = 'input[name="password"]';

test("has correct title and body", async ({ page }) => {
    await page.route(loginApiEndpoint, async (route) => {
        await route.fulfill({ status: 404 });
    });
    await page.goto(homePage);
    await expect(page).toHaveTitle("Raid bot");
    await expect(page.locator(passwordSelector)).toHaveAttribute("type", "password");
});

test("can fill login with wrong username or password", async ({ page }) => {
    await page.route(loginApiEndpoint, async (route) => {
        switch (route.request().method()) {
            case "GET":
                await route.fulfill({ status: 404 });
                break;
            case "POST":
                await route.fulfill({ status: 401 });
                break;
            default:
        }
    });
    await page.goto(homePage);
    await page.locator('input[name="username"]').fill("cake_lier");
    await page.locator(passwordSelector).fill("password");
    const loginButton = page.getByRole("button", { name: "Login" });
    await loginButton.click();
    await loginButton.isDisabled();
    await loginButton.isEnabled();
    await expect(page.getByText("Username or password were invalid.")).toBeVisible();
});

test("can fill login with right username and password", async ({ page }) => {
    const username = "cake_lier";
    const password = "password";
    await page.route(loginApiEndpoint, async (route) => {
        switch (route.request().method()) {
            case "GET":
                await route.fulfill({ status: 404 });
                break;
            case "POST":
                await route.fulfill({ json: { username } });
                break;
            default:
        }
    });
    await page.goto(homePage);
    await page.locator('input[name="username"]').fill(username);
    await page.locator(passwordSelector).fill(password);
    const loginButton = page.getByRole("button", { name: "Login" });
    await loginButton.click();
    await page.waitForURL(/^.*\/dashboard$/);
});

test("redirects to dashboard when user is logged in", async ({ page }) => {
    await page.route(loginApiEndpoint, async (route) => {
        await route.fulfill({ json: { username: "cake_lier" } });
    });
    await page.goto(homePage);
    await page.waitForURL(/^.*\/dashboard$/);
});
