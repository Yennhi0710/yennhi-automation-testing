import { test, expect } from "@playwright/test";

test.describe("Sauce Demo smoke", () => {
  test("opens login page and shows username field", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Swag Labs/i);
    await expect(page.getByPlaceholder("Username")).toBeVisible();
  });
});
