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

  test("File Upload uploads a fixture file successfully", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "File Upload", exact: true }).click();
    await expect(page).toHaveURL(/\/upload$/);
    await expect(page.getByRole("heading", { name: "File Uploader" })).toBeVisible();

    const filePath = path.join(__dirname, "fixtures", "file_upload.txt");
    expect(fs.existsSync(filePath)).toBe(true);

    await page.locator("#file-upload").setInputFiles(filePath);
    await page.locator("#file-submit").click();

    await expect(page.getByRole("heading", { name: "File Uploaded!" })).toBeVisible();
    await expect(page.locator("#uploaded-files")).toHaveText("file_upload.txt");
  });

  test("Floating Menu stays visible while scrolling", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Floating Menu" }).click();
    await expect(page).toHaveURL(/\/floating_menu$/);
    await expect(page.getByRole("heading", { name: "Floating Menu" })).toBeVisible();

    const menu = page.locator("#menu");
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(menu.getByRole("link", { name: "News" })).toBeVisible();
    await expect(menu.getByRole("link", { name: "Contact" })).toBeVisible();
    await expect(menu.getByRole("link", { name: "About" })).toBeVisible();

    await page.mouse.wheel(0, 2000);

    await expect(menu).toBeVisible();
    await expect(menu.getByRole("link", { name: "Home" })).toBeVisible();

    await menu.getByRole("link", { name: "News" }).click();
    await expect(page).toHaveURL(/\/floating_menu#news$/);
  });

  test("Forgot Password submits email form", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Forgot Password" }).click();
    await expect(page).toHaveURL(/\/forgot_password$/);
    await expect(page.getByRole("heading", { name: "Forgot Password" })).toBeVisible();

    const email = page.locator("#email");
    const submit = page.locator("#form_submit");
    await expect(email).toBeVisible();
    await expect(submit).toBeVisible();

    await email.fill("yennhi.test@example.com");
    await expect(email).toHaveValue("yennhi.test@example.com");

    const [response] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().endsWith("/forgot_password") && r.request().method() === "POST",
      ),
      submit.click(),
    ]);

    expect([200, 500]).toContain(response.status());
  });

  test("Form Authentication logs in with valid credentials", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Form Authentication" }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Login Page" })).toBeVisible();

    await page.locator("#username").fill("tomsmith");
    await page.locator("#password").fill("SuperSecretPassword!");
    await page.getByRole("button", { name: /Login/i }).click();

    await expect(page).toHaveURL(/\/secure$/);
    await expect(page.locator("#flash")).toContainText("You logged into a secure area!");
    await expect(page.getByRole("heading", { name: "Secure Area", exact: true })).toBeVisible();

    await page.getByRole("link", { name: /Logout/i }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator("#flash")).toContainText("You logged out of the secure area!");
  });

  test("Form Authentication rejects invalid credentials", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Form Authentication" }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Login Page" })).toBeVisible();

    await page.locator("#username").fill("tomsmith");
    await page.locator("#password").fill("wrong-password");
    await page.getByRole("button", { name: /Login/i }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator("#flash")).toContainText("Your password is invalid!");

    await page.locator("#username").fill("not-a-user");
    await page.locator("#password").fill("anything");
    await page.getByRole("button", { name: /Login/i }).click();

    await expect(page.locator("#flash")).toContainText("Your username is invalid!");
  });

  test("Frames -> Nested Frames shows LEFT/MIDDLE/RIGHT/BOTTOM", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Frames", exact: true }).click();
    await expect(page).toHaveURL(/\/frames$/);

    await page.getByRole("link", { name: "Nested Frames" }).click();
    await expect(page).toHaveURL(/\/nested_frames$/);

    const top = page.frameLocator('frame[name="frame-top"]');
    await expect(top.frameLocator('frame[name="frame-left"]').locator("body")).toContainText("LEFT");
    await expect(top.frameLocator('frame[name="frame-middle"]').locator("body")).toContainText("MIDDLE");
    await expect(top.frameLocator('frame[name="frame-right"]').locator("body")).toContainText("RIGHT");

    await expect(
      page.frameLocator('frame[name="frame-bottom"]').locator("body"),
    ).toContainText("BOTTOM");
  });

  test("Frames -> iFrame opens TinyMCE editor page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Frames", exact: true }).click();
    await expect(page).toHaveURL(/\/frames$/);

    await page.getByRole("link", { name: "iFrame" }).click();
    await expect(page).toHaveURL(/\/iframe$/);
    await expect(
      page.getByRole("heading", { name: "An iFrame containing the TinyMCE WYSIWYG Editor" }),
    ).toBeVisible();

    await expect(page.locator("#mce_0_ifr")).toBeVisible();
    const editor = page.frameLocator("#mce_0_ifr").locator("#tinymce");
    await expect(editor).toContainText("Your content goes here.");
  });

  test("Geolocation shows latitude and longitude after granting permission", async ({ browser }) => {
    const latitude = 10.762622;
    const longitude = 106.660172;

    const context = await browser.newContext({
      baseURL: "https://the-internet.herokuapp.com",
      geolocation: { latitude, longitude },
      permissions: ["geolocation"],
    });
    const page = await context.newPage();

    await page.goto("/");
    await page.getByRole("link", { name: "Geolocation" }).click();
    await expect(page).toHaveURL(/\/geolocation$/);
    await expect(page.getByRole("heading", { name: "Geolocation" })).toBeVisible();

    await page.getByRole("button", { name: "Where am I?" }).click();

    await expect(page.locator("#lat-value")).toHaveText(String(latitude));
    await expect(page.locator("#long-value")).toHaveText(String(longitude));
    await expect(page.locator("#map-link a")).toHaveAttribute(
      "href",
      `http://maps.google.com/?q=${latitude},${longitude}`,
    );

    await context.close();
  });

  test("Horizontal Slider moves to value 3 using arrow keys", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Horizontal Slider" }).click();
    await expect(page).toHaveURL(/\/horizontal_slider$/);
    await expect(page.getByRole("heading", { name: "Horizontal Slider" })).toBeVisible();

    const slider = page.locator('input[type="range"]');
    const display = page.locator("#range");

    await expect(slider).toBeVisible();
    await expect(display).toHaveText("0");

    await slider.focus();
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("ArrowRight");
    }

    await expect(slider).toHaveValue("3");
    await expect(display).toHaveText("3");
  });

  test("Hovers shows user captions when hovering avatars", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Hovers" }).click();
    await expect(page).toHaveURL(/\/hovers$/);
    await expect(page.getByRole("heading", { name: "Hovers" })).toBeVisible();

    const figures = page.locator(".figure");
    await expect(figures).toHaveCount(3);

    for (let i = 0; i < 3; i++) {
      const figure = figures.nth(i);
      await figure.scrollIntoViewIfNeeded();
      await figure.locator("img").hover();

      await expect(figure.locator(".figcaption")).toBeVisible();
      await expect(figure.locator("h5")).toHaveText(`name: user${i + 1}`);
      await expect(figure.getByRole("link", { name: "View profile" })).toHaveAttribute(
        "href",
        `/users/${i + 1}`,
      );
    }
  });

  test("Infinite Scroll loads more content when scrolling down", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Infinite Scroll" }).click();
    await expect(page).toHaveURL(/\/infinite_scroll$/);
    await expect(page.getByRole("heading", { name: "Infinite Scroll" })).toBeVisible();

    const loadedBlocks = page.locator(".jscroll-added");
    const initialCount = await loadedBlocks.count();

    let previousCount = initialCount;
    let unchangedScrolls = 0;

    for (let i = 0; i < 10 && unchangedScrolls < 2; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1_000);

      const currentCount = await loadedBlocks.count();
      if (currentCount > previousCount) {
        previousCount = currentCount;
        unchangedScrolls = 0;
      } else {
        unchangedScrolls++;
      }
    }

    expect(previousCount).toBeGreaterThan(initialCount);
    await expect(loadedBlocks.last()).toContainText(/\w+/);
  });

  test("Inputs accepts numbers and arrow keys adjust value", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Inputs" }).click();
    await expect(page).toHaveURL(/\/inputs$/);
    await expect(page.getByRole("heading", { name: "Inputs" })).toBeVisible();

    const numberInput = page.locator('input[type="number"]');
    await expect(numberInput).toBeVisible();

    await numberInput.fill("42");
    await expect(numberInput).toHaveValue("42");

    await numberInput.press("ArrowUp");
    await numberInput.press("ArrowUp");
    await expect(numberInput).toHaveValue("44");

    await numberInput.press("ArrowDown");
    await expect(numberInput).toHaveValue("43");

    await numberInput.fill("");
    await numberInput.pressSequentially("abc");
    await expect(numberInput).toHaveValue("");
  });

  test("JQuery UI Menus opens downloads submenu and downloads CSV", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "JQuery UI Menus" }).click();
    await expect(page).toHaveURL(/\/jqueryui\/menu$/);
    await expect(page.getByRole("heading", { name: "JQueryUI - Menu" })).toBeVisible();

    const enabled = page.locator("#menu > li").nth(1);
    const downloads = enabled.locator("> ul > li").first();
    const pdf = page.locator('a[href$="menu.pdf"]');
    const csv = page.locator('a[href$="menu.csv"]');
    const excel = page.locator('a[href$="menu.xls"]');

    await enabled.hover();
    await expect(downloads.locator("> a")).toBeVisible();

    await downloads.hover();
    await expect(pdf).toBeVisible();
    await expect(csv).toBeVisible();
    await expect(excel).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      csv.click(),
    ]);

    expect(await download.failure()).toBeNull();
    expect(download.suggestedFilename()).toBe("menu.csv");
  });

  test("JavaScript Alerts handles alert confirm and prompt", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "JavaScript Alerts" }).click();
    await expect(page).toHaveURL(/\/javascript_alerts$/);
    await expect(page.getByRole("heading", { name: "JavaScript Alerts" })).toBeVisible();

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toBe("I am a JS Alert");
      await dialog.accept();
    });
    await page.getByRole("button", { name: "Click for JS Alert" }).click();
    await expect(page.locator("#result")).toHaveText("You successfully clicked an alert");

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toBe("I am a JS Confirm");
      await dialog.dismiss();
    });
    await page.getByRole("button", { name: "Click for JS Confirm" }).click();
    await expect(page.locator("#result")).toHaveText("You clicked: Cancel");

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toBe("I am a JS prompt");
      await dialog.accept("Xin chào Playwright");
    });
    await page.getByRole("button", { name: "Click for JS Prompt" }).click();
    await expect(page.locator("#result")).toHaveText("You entered: Xin chào Playwright");
  });

  test("JavaScript onload event error is reported on page load", async ({ page }) => {
    await page.goto("/");

    const pageErrorPromise = page.waitForEvent("pageerror");
    await page.getByRole("link", { name: "JavaScript onload event error" }).click();
    const error = await pageErrorPromise;

    await expect(page).toHaveURL(/\/javascript_error$/);
    await expect(page).toHaveTitle("Page with JavaScript errors on load");
    await expect(page.locator("body")).toContainText(
      "This page has a JavaScript error in the onload event.",
    );
    expect(error.message).toContain("Cannot read properties of undefined");
  });

  test("Key Presses shows the key entered", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Key Presses" }).click();
    await expect(page).toHaveURL(/\/key_presses$/);
    await expect(page.getByRole("heading", { name: "Key Presses" })).toBeVisible();

    const input = page.locator("#target");
    const result = page.locator("#result");
    await expect(input).toBeVisible();

    await input.press("A");
    await expect(result).toHaveText("You entered: A");

    await input.press("ArrowLeft");
    await expect(result).toHaveText("You entered: LEFT");

    await input.press("Escape");
    await expect(result).toHaveText("You entered: ESCAPE");
  });

  test("Large & Deep DOM renders deeply nested element", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Large & Deep DOM" }).click();
    await expect(page).toHaveURL(/\/large$/);
    await expect(page.getByRole("heading", { name: "Large & Deep DOM" })).toBeVisible();

    const noSiblings = page.locator("#no-siblings");
    await noSiblings.scrollIntoViewIfNeeded();
    await expect(noSiblings).toHaveText("No siblings");

    const lastCell = page.locator("#sibling-50\\.3");
    await lastCell.scrollIntoViewIfNeeded();
    await expect(lastCell).toContainText("50.3");
  });

  test("Multiple Windows opens new tab with greeting", async ({ page, context }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Multiple Windows" }).click();
    await expect(page).toHaveURL(/\/windows$/);
    await expect(page.getByRole("heading", { name: "Opening a new window" })).toBeVisible();

    const [newPage] = await Promise.all([
      context.waitForEvent("page"),
      page.getByRole("link", { name: "Click Here" }).click(),
    ]);

    await newPage.waitForLoadState();
    await expect(newPage).toHaveURL(/\/windows\/new$/);
    await expect(newPage.getByRole("heading", { name: "New Window" })).toBeVisible();

    await newPage.close();
    await expect(page).toHaveURL(/\/windows$/);
  });

  test("Nested Frames direct link from home shows all frame contents", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Nested Frames" }).click();
    await expect(page).toHaveURL(/\/nested_frames$/);

    const top = page.frameLocator('frame[name="frame-top"]');
    await expect(top.frameLocator('frame[name="frame-left"]').locator("body")).toContainText("LEFT");
    await expect(top.frameLocator('frame[name="frame-middle"]').locator("body")).toContainText("MIDDLE");
    await expect(top.frameLocator('frame[name="frame-right"]').locator("body")).toContainText("RIGHT");

    await expect(
      page.frameLocator('frame[name="frame-bottom"]').locator("body"),
    ).toContainText("BOTTOM");
  });

  test("Notification Messages shows a flash message after clicking", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Notification Messages" }).click();
    await expect(page).toHaveURL(/\/notification_message_rendered$/);
    await expect(page.getByRole("heading", { name: "Notification Message" })).toBeVisible();

    await page.getByRole("link", { name: "Click here" }).click();
    await expect(page).toHaveURL(/\/notification_message(_rendered)?$/);

    const flash = page.locator("#flash");
    await expect(flash).toBeVisible();
    await expect(flash).toContainText(
      /Action (successful|unsuccesful, please try again)/,
    );

    await flash.locator(".close").click();
    await expect(flash).toBeHidden();
  });

  test("Redirect Link redirects to status codes page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Redirect Link" }).click();
    await expect(page).toHaveURL(/\/redirector$/);
    await expect(page.getByRole("heading", { name: "Redirection" })).toBeVisible();

    await page.locator("#redirect").click();
    await expect(page).toHaveURL(/\/status_codes$/);
    await expect(page.getByRole("heading", { name: "Status Codes" })).toBeVisible();
  });

  test("Secure File Download requires basic auth and downloads a file", async ({ browser }) => {
    const context = await browser.newContext({
      baseURL: "https://the-internet.herokuapp.com",
      httpCredentials: { username: "admin", password: "admin" },
    });
    const page = await context.newPage();

    await page.goto("/");
    await page.getByRole("link", { name: "Secure File Download" }).click();
    await expect(page).toHaveURL(/\/download_secure$/);
    await expect(page.getByRole("heading", { name: "Secure File Downloader" })).toBeVisible();

    const links = page.locator('.example a[href^="download_secure/"]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    const link = links.nth(Math.floor(Math.random() * count));
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      link.click(),
    ]);

    expect(await download.failure()).toBeNull();
    expect(download.suggestedFilename().length).toBeGreaterThan(0);

    await context.close();
  });

  test("Secure File Download rejects access without credentials", async ({ playwright }) => {
    const request = await playwright.request.newContext({
      baseURL: "https://the-internet.herokuapp.com",
    });
    const response = await request.get("/download_secure");
    expect(response.status()).toBe(401);
    await request.dispose();
  });

  test("Shadow DOM exposes slotted content through shadow root", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Shadow DOM" }).click();
    await expect(page).toHaveURL(/\/shadowdom$/);
    await expect(page.getByRole("heading", { name: "Simple template" })).toBeVisible();

    const paragraphs = page.locator("my-paragraph");
    await expect(paragraphs).toHaveCount(2);
    await expect(paragraphs.first()).toContainText("Let's have some different text!");
    await expect(paragraphs.nth(1)).toContainText("In a list!");
  });

  test("Shifting Content opens menu element example", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Shifting Content", exact: true }).click();
    await expect(page).toHaveURL(/\/shifting_content$/);
    await expect(page.getByRole("heading", { name: "Shifting Content" })).toBeVisible();

    await page.getByRole("link", { name: "Example 1: Menu Element" }).click();
    await expect(page).toHaveURL(/\/shifting_content\/menu$/);
    await expect(
      page.getByRole("heading", { name: "Shifting Content: Menu Element" }),
    ).toBeVisible();

    const menu = page.locator(".example ul li");
    expect(await menu.count()).toBeGreaterThan(0);
    await expect(menu.first()).toBeVisible();
  });

  test("Slow Resources page loads main heading without waiting for slow asset", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Slow Resources" }).click();
    await expect(page).toHaveURL(/\/slow$/);
    await expect(page.getByRole("heading", { name: "Slow Resources" })).toBeVisible();
    await expect(page.locator(".example")).toContainText(
      "rogue GET request that takes 30 seconds to complete",
    );
  });

  test("Sortable Data Tables sort by Last Name ascending", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Sortable Data Tables" }).click();
    await expect(page).toHaveURL(/\/tables$/);
    await expect(page.getByRole("heading", { name: "Data Tables" })).toBeVisible();

    const table1 = page.locator("#table1");
    await table1.locator("thead th").first().click();

    const lastNames = await table1
      .locator("tbody tr td:nth-child(1)")
      .allTextContents();
    const sorted = [...lastNames].sort((a, b) => a.localeCompare(b));
    expect(lastNames).toEqual(sorted);
  });

  test("Status Codes navigates to 200 and 404 pages", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Status Codes" }).click();
    await expect(page).toHaveURL(/\/status_codes$/);
    await expect(page.getByRole("heading", { name: "Status Codes" })).toBeVisible();

    const response200 = await Promise.all([
      page.waitForResponse((r) => r.url().endsWith("/status_codes/200")),
      page.getByRole("link", { name: "200" }).click(),
    ]);
    expect(response200[0].status()).toBe(200);
    await expect(page).toHaveURL(/\/status_codes\/200$/);
    await expect(page.locator(".example")).toContainText("200 status code");

    await page.goBack();
    await expect(page).toHaveURL(/\/status_codes$/);

    const response404 = await Promise.all([
      page.waitForResponse((r) => r.url().endsWith("/status_codes/404")),
      page.getByRole("link", { name: "404" }).click(),
    ]);
    expect(response404[0].status()).toBe(404);
    await expect(page).toHaveURL(/\/status_codes\/404$/);
    await expect(page.locator(".example")).toContainText("404 status code");
  });

  test("Typos page loads with the example paragraph", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Typos" }).click();
    await expect(page).toHaveURL(/\/typos$/);
    await expect(page.getByRole("heading", { name: "Typos" })).toBeVisible();
    await expect(page.locator(".example")).toContainText(
      "This example demonstrates a typo being introduced.",
    );
  });

  test("WYSIWYG Editor opens TinyMCE editor page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "WYSIWYG Editor" }).click();
    await expect(page).toHaveURL(/\/tinymce$/);
    await expect(
      page.getByRole("heading", { name: "An iFrame containing the TinyMCE WYSIWYG Editor" }),
    ).toBeVisible();

    await expect(page.locator("#mce_0_ifr")).toBeVisible();
    await expect(page.frameLocator("#mce_0_ifr").locator("#tinymce")).toContainText(
      "Your content goes here.",
    );
  });
});
