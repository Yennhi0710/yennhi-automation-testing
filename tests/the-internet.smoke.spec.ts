import { test, expect } from "@playwright/test";

test.describe("The Internet smoke", () => {
  test("opens home page and shows welcome heading", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/The Internet/i);
    await expect(
      page.getByRole("heading", { name: "Welcome to the-internet" }),
    ).toBeVisible();
  });
});
