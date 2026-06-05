import * as fs from "node:fs";
import * as path from "node:path";
import { test, expect } from "@playwright/test";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

test.describe("The Internet — TC 13 → TC 20", () => {
  test("TC 13 — Upload file thành công", async ({ page }) => {
    await page.goto("/upload");
    await expect(page.getByRole("heading", { name: "File Uploader" })).toBeVisible();

    const imagePath = path.join(FIXTURES_DIR, "test_image.png");
    expect(fs.existsSync(imagePath)).toBe(true);

    await page.locator("#file-upload").setInputFiles(imagePath);
    await page.locator("#file-submit").click();

    await expect(page.getByRole("heading", { name: "File Uploaded!" })).toBeVisible();
    await expect(page.locator("#uploaded-files")).toHaveText("test_image.png");

    await page.goto("/upload");
    await expect(page.getByRole("heading", { name: "File Uploader" })).toBeVisible();

    const textPath = path.join(FIXTURES_DIR, "file_upload.txt");
    expect(fs.existsSync(textPath)).toBe(true);

    await page.locator("#file-upload").setInputFiles(textPath);
    await page.locator("#file-submit").click();

    await expect(page.getByRole("heading", { name: "File Uploaded!" })).toBeVisible();
    await expect(page.locator("#uploaded-files")).toHaveText("file_upload.txt");
  });

  test.fail("TC 14 — Upload file > 5MB", async ({ page }) => {
    await page.goto("/upload");
    await expect(page.getByRole("heading", { name: "File Uploader" })).toBeVisible();

    const largePath = path.join(FIXTURES_DIR, "large_video.mp4");
    expect(fs.existsSync(largePath)).toBe(true);
    expect(fs.statSync(largePath).size).toBeGreaterThan(5 * 1024 * 1024);

    await page.locator("#file-upload").setInputFiles(largePath);

    const [response] = await Promise.all([
      page.waitForResponse((r) => r.url().endsWith("/upload"), { timeout: 30_000 }),
      page.locator("#file-submit").click(),
    ]);

    expect(response.status()).toBeGreaterThanOrEqual(400);
    await expect(
      page.getByRole("heading", { name: "File Uploaded!" }),
    ).toHaveCount(0);

    await page.goto("/upload");
    const smallPath = path.join(FIXTURES_DIR, "file_upload.txt");
    await page.locator("#file-upload").setInputFiles(smallPath);
    await page.locator("#file-submit").click();
    await expect(page.getByRole("heading", { name: "File Uploaded!" })).toBeVisible();
    await expect(page.locator("#uploaded-files")).toHaveText("file_upload.txt");
  });

  test.fail("TC 15 — Upload file sai định dạng (.exe)", async ({ page }) => {
    await page.goto("/upload");
    await expect(page.getByRole("heading", { name: "File Uploader" })).toBeVisible();

    const exePath = path.join(FIXTURES_DIR, "malicious_test.exe");
    expect(fs.existsSync(exePath)).toBe(true);

    await page.locator("#file-upload").setInputFiles(exePath);
    await page.locator("#file-submit").click();

    await expect(
      page.getByRole("heading", { name: "File Uploaded!" }),
      "Server phải từ chối file .exe, KHÔNG được hiển thị 'File Uploaded!'",
    ).toHaveCount(0);
    await expect(
      page.locator("#uploaded-files"),
      "Tên file .exe KHÔNG được xuất hiện trong kết quả upload",
    ).not.toHaveText("malicious_test.exe");
  });

  test("TC 16 — Dynamic Loading", async ({ page }) => {
    await page.goto("/dynamic_loading");
    await expect(
      page.getByRole("link", { name: "Example 1: Element on page that is hidden" }),
    ).toBeVisible();

    await page
      .getByRole("link", { name: "Example 1: Element on page that is hidden" })
      .click();
    await expect(page).toHaveURL(/\/dynamic_loading\/1$/);

    const finishOne = page.locator("#finish");
    await expect(finishOne).toBeHidden();

    await page.getByRole("button", { name: "Start" }).click();
    await expect(page.locator("#loading")).toBeVisible();
    await expect(page.locator("#loading")).toBeHidden({ timeout: 10_000 });
    await expect(finishOne).toBeVisible();
    await expect(finishOne).toHaveText("Hello World!");

    await page.goto("/dynamic_loading");
    await page
      .getByRole("link", { name: "Example 2: Element rendered after the fact" })
      .click();
    await expect(page).toHaveURL(/\/dynamic_loading\/2$/);

    await page.getByRole("button", { name: "Start" }).click();
    await expect(page.locator("#loading")).toBeVisible();
    await expect(page.locator("#loading")).toBeHidden({ timeout: 10_000 });

    const finishTwo = page.locator("#finish");
    await expect(finishTwo).toBeVisible();
    await expect(finishTwo).toHaveText("Hello World!");
  });

  test("TC 17 — Drag and Drop", async ({ page }) => {
    await page.goto("/drag_and_drop");
    await expect(page.getByRole("heading", { name: "Drag and Drop" })).toBeVisible();

    const columnA = page.locator("#column-a");
    const columnB = page.locator("#column-b");
    await expect(columnA.locator("header")).toHaveText("A");
    await expect(columnB.locator("header")).toHaveText("B");

    await columnA.dragTo(columnB);
    await expect(columnA.locator("header")).toHaveText("B");
    await expect(columnB.locator("header")).toHaveText("A");

    await columnA.dragTo(columnB);
    await expect(columnA.locator("header")).toHaveText("A");
    await expect(columnB.locator("header")).toHaveText("B");
  });

  test("TC 18 — JavaScript Alerts", async ({ page }) => {
    await page.goto("/javascript_alerts");
    await expect(page.getByRole("heading", { name: "JavaScript Alerts" })).toBeVisible();

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toBe("I am a JS Alert");
      await dialog.accept();
    });
    await page.getByRole("button", { name: "Click for JS Alert" }).click();
    await expect(page.locator("#result")).toHaveText("You successfully clicked an alert");

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toBe("I am a JS Confirm");
      await dialog.accept();
    });
    await page.getByRole("button", { name: "Click for JS Confirm" }).click();
    await expect(page.locator("#result")).toHaveText("You clicked: Ok");

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toBe("I am a JS Confirm");
      await dialog.dismiss();
    });
    await page.getByRole("button", { name: "Click for JS Confirm" }).click();
    await expect(page.locator("#result")).toHaveText("You clicked: Cancel");

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toBe("I am a JS prompt");
      await dialog.accept("Hello QA");
    });
    await page.getByRole("button", { name: "Click for JS Prompt" }).click();
    await expect(page.locator("#result")).toHaveText("You entered: Hello QA");
  });

  test("TC 19 — Checkboxes", async ({ page }) => {
    await page.goto("/checkboxes");
    await expect(page.getByRole("heading", { name: "Checkboxes" })).toBeVisible();

    const checkbox1 = page.locator("#checkboxes input").nth(0);
    const checkbox2 = page.locator("#checkboxes input").nth(1);

    await expect(checkbox1).not.toBeChecked();
    await expect(checkbox2).toBeChecked();

    await checkbox1.click();
    await expect(checkbox1).toBeChecked();

    await checkbox1.click();
    await expect(checkbox1).not.toBeChecked();

    await checkbox2.click();
    await expect(checkbox2).not.toBeChecked();

    await expect(checkbox1).not.toBeChecked();
    await expect(checkbox2).not.toBeChecked();

    await checkbox1.click();
    await checkbox2.click();
    await expect(checkbox1).toBeChecked();
    await expect(checkbox2).toBeChecked();

    await page.reload();
    await expect(page.locator("#checkboxes input").nth(0)).not.toBeChecked();
    await expect(page.locator("#checkboxes input").nth(1)).toBeChecked();
  });

  test("TC 20 — Dropdown Selection", async ({ page }) => {
    await page.goto("/dropdown");
    await expect(page.getByRole("heading", { name: "Dropdown List" })).toBeVisible();

    const dropdown = page.locator("#dropdown");
    await expect(dropdown).toHaveValue("");

    const optionValues = await dropdown.locator("option").evaluateAll(
      (options) => options.map((o) => (o as HTMLOptionElement).value),
    );
    expect(optionValues).toEqual(["", "1", "2"]);

    await dropdown.selectOption("1");
    await expect(dropdown).toHaveValue("1");

    await dropdown.selectOption("2");
    await expect(dropdown).toHaveValue("2");

    const option1Selected = await dropdown
      .locator('option[value="1"]')
      .evaluate((o) => (o as HTMLOptionElement).selected);
    expect(option1Selected).toBe(false);

    await page.reload();
    await expect(page.locator("#dropdown")).toHaveValue("");
  });
});
