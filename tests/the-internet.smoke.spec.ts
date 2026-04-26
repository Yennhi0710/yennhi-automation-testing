import { test, expect } from "@playwright/test";

test.describe("The Internet — Home", () => {
  test("loads home page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/The Internet/i);
    await expect(
      page.getByRole("heading", { name: "Welcome to the-internet" }),
    ).toBeVisible();
  });

  test("navigates to A/B Testing page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "A/B Testing" }).click();
    await expect(page).toHaveURL(/\/abtest$/);
  });

  test("adds and removes elements", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Add/Remove Elements" }).click();
    await expect(page).toHaveURL(/\/add_remove_elements\/$/);

    const addButton = page.getByRole("button", { name: "Add Element" });
    const deleteButtons = page.getByRole("button", { name: "Delete" });

    for (let i = 0; i < 5; i++) {
      await addButton.click();
    }

    await expect(deleteButtons).toHaveCount(5);

    while ((await deleteButtons.count()) > 0) {
      await deleteButtons.first().click();
    }

    await expect(deleteButtons).toHaveCount(0);
  });

  test("navigates to Basic Auth with admin/admin", async ({ browser }) => {
    const context = await browser.newContext({
      httpCredentials: { username: "admin", password: "admin" },
    });
    const page = await context.newPage();

    await page.goto("/");
    await page.getByRole("link", { name: /Basic Auth/i }).click();

    await expect(page.getByRole("heading", { name: "Basic Auth" })).toBeVisible();
    await expect(page.locator("#content")).toContainText(
      "Congratulations! You must have the proper credentials.",
    );

    await page.waitForTimeout(1500);
    await context.close();
  });

  test("rejects Basic Auth with invalid credentials", async ({ browser }) => {
    const context = await browser.newContext({
      httpCredentials: { username: "admin", password: "wrong" },
    });
    const page = await context.newPage();

    const response = await page.goto("/basic_auth");
    expect(response?.status()).toBe(401);

    await context.close();
  });

  test("navigates to Broken Images page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Broken Images" }).click();
    await expect(page).toHaveURL(/\/broken_images$/);
  });

  test("toggles checkboxes", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Checkboxes" }).click();
    await expect(page).toHaveURL(/\/checkboxes$/);

    const checkbox1 = page.locator("#checkboxes input").nth(0);
    const checkbox2 = page.locator("#checkboxes input").nth(1);

    await checkbox1.check();
    await expect(checkbox1).toBeChecked();

    await checkbox2.uncheck();
    await expect(checkbox2).not.toBeChecked();
  });
});
