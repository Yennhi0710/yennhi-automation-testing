import { test, expect } from "@playwright/test";

test.describe("The Internet — Home", () => {
  test("loads home page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/The Internet/i);
    await expect(
      page.getByRole("heading", { name: "Welcome to the-internet" }),
    ).toBeVisible();
  });
});
