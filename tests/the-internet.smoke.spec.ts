import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
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

  test("opens context menu alert", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Context Menu" }).click();
    await expect(page).toHaveURL(/\/context_menu$/);

    const dialogPromise = page.waitForEvent("dialog");
    await page.locator("#hot-spot").click({ button: "right" });
    const dialog = await dialogPromise;

    expect(dialog.message()).toContain("You selected a context menu");
    await dialog.accept();
  });

  test("navigates to Digest Auth with admin/admin", async ({ browser }) => {
    const context = await browser.newContext({
      httpCredentials: { username: "admin", password: "admin" },
    });
    const page = await context.newPage();

    await page.goto("/");
    await page.getByRole("link", { name: /Digest Authentication/i }).click();

    await expect(page.getByRole("heading", { name: "Digest Auth" })).toBeVisible();
    await expect(page.locator("#content")).toContainText(
      "Congratulations! You must have the proper credentials.",
    );

    await page.waitForTimeout(1500);
    await context.close();
  });

  test("rejects Digest Auth with invalid credentials", async ({ browser }) => {
    const context = await browser.newContext({
      httpCredentials: { username: "admin", password: "wrong" },
    });
    const page = await context.newPage();

    const response = await page.goto("/digest_auth");
    expect(response?.status()).toBe(401);

    await context.close();
  });

  test("Disappearing Elements then Home returns to main page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Disappearing Elements" }).click();
    await expect(page).toHaveURL(/\/disappearing_elements$/);
    await expect(
      page.getByRole("heading", { name: "Disappearing Elements" }),
    ).toBeVisible();

    await page.locator('a[href="/"]').filter({ hasText: "Home" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole("heading", { name: "Welcome to the-internet" }),
    ).toBeVisible();
  });

  test("Drag and Drop swaps column A and B", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Drag and Drop" }).click();
    await expect(page).toHaveURL(/\/drag_and_drop$/);
    await expect(page.getByRole("heading", { name: "Drag and Drop" })).toBeVisible();

    const columnA = page.locator("#column-a");
    const columnB = page.locator("#column-b");
    await expect(columnA.locator("header")).toHaveText("A");
    await expect(columnB.locator("header")).toHaveText("B");

    await columnA.dragTo(columnB);

    await expect(columnA.locator("header")).toHaveText("B");
    await expect(columnB.locator("header")).toHaveText("A");
  });

  test("Dropdown selects Option 1 then Option 2", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Dropdown" }).click();
    await expect(page).toHaveURL(/\/dropdown$/);
    await expect(page.getByRole("heading", { name: "Dropdown List" })).toBeVisible();

    const dropdown = page.locator("#dropdown");
    await dropdown.selectOption("1");
    await expect(dropdown).toHaveValue("1");

    await dropdown.selectOption("2");
    await expect(dropdown).toHaveValue("2");
  });

  test("Dynamic Content click here switches to static copy", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Dynamic Content" }).click();
    await expect(page).toHaveURL(/\/dynamic_content$/);
    await expect(page.getByRole("heading", { name: "Dynamic Content" })).toBeVisible();

    const firstParagraph = page
      .locator(".example div.large-10.columns.large-centered .row")
      .filter({ has: page.locator("img[src*='avatars']") })
      .first()
      .locator("> .large-10");
    await expect(firstParagraph).toBeVisible();
    const textBefore = await firstParagraph.innerText();

    await page.getByRole("link", { name: /click here/i }).click();
    await expect(page).toHaveURL(/dynamic_content\?with_content=static/);

    await expect(firstParagraph).not.toHaveText(textBefore);
    await expect(
      page.locator(".example img[src*='avatars']").first(),
    ).toBeVisible();
  });

  test("Entry Ad shows modal or re-enable then modal", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Entry Ad" }).click();
    await expect(page).toHaveURL(/\/entry_ad$/);
    await expect(page.getByRole("heading", { name: "Entry Ad" })).toBeVisible();

    const modal = page.locator("#modal");
    const restartAd = page.locator("#restart-ad");

    const modalAppeared = await modal
      .waitFor({ state: "visible", timeout: 5_000 })
      .then(() => true)
      .catch(() => false);

    if (!modalAppeared) {
      await restartAd.click();
      await page.waitForLoadState("load");
    }

    await expect(modal).toBeVisible();
    await expect(modal.locator(".modal-title h3")).toHaveText("This is a modal window");
    await expect(modal.locator(".modal-body")).toContainText(
      "commonly used to encourage a user to take an action",
    );
    await expect(modal.locator(".modal-footer p")).toHaveText("Close");
  });

  test("Exit Intent shows modal when mouse leaves toward top", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Exit Intent" }).click();
    await expect(page).toHaveURL(/\/exit_intent$/);
    await expect(page.getByRole("heading", { name: "Exit Intent" })).toBeVisible();

    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();
    const midX = viewport!.width / 2;

    await page.mouse.move(midX, viewport!.height / 2);
    await page.mouse.move(midX, 5);
    await page.mouse.move(midX, -30);

    const modal = page.locator("#ouibounce-modal");
    await expect(modal).toBeVisible({ timeout: 10_000 });
    await expect(modal.locator(".modal-title h3")).toHaveText("This is a modal window");
    await expect(modal.locator(".modal-body")).toContainText(
      "give their e-mail address to sign up for something",
    );
    await expect(modal.locator(".modal-footer p")).toHaveText("Close");
  });

  test("File Download picks a random link and completes download", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "File Download", exact: true }).click();
    await expect(page).toHaveURL(/\/download$/);
    await expect(page.getByRole("heading", { name: "File Downloader" })).toBeVisible();

    const links = page.locator('.example a[href^="download/"]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    const index = Math.floor(Math.random() * count);
    const link = links.nth(index);
    const name = (await link.textContent())?.trim() ?? "";
    expect(name.length).toBeGreaterThan(0);

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      link.click(),
    ]);

    expect(await download.failure()).toBeNull();
    expect(download.suggestedFilename().length).toBeGreaterThan(0);

    const target = path.join(os.tmpdir(), `playwright-download-${Date.now()}-${download.suggestedFilename()}`);
    await download.saveAs(target);
    expect(fs.existsSync(target)).toBe(true);
    expect(fs.statSync(target).size).toBeGreaterThanOrEqual(0);
  });
});
