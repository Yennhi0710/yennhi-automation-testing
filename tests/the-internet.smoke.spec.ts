import { expect, test } from "@playwright/test";
import { logStep } from "../helpers/test-logger";
import {
  assertFixtureExists,
  assertFixtureMinSize,
} from "../helpers/the-internet-fixtures";
import { CheckboxesPage } from "../pages/the-internet/CheckboxesPage";
import { DragAndDropPage } from "../pages/the-internet/DragAndDropPage";
import { DropdownPage } from "../pages/the-internet/DropdownPage";
import { DynamicLoadingPage } from "../pages/the-internet/DynamicLoadingPage";
import { JavaScriptAlertsPage } from "../pages/the-internet/JavaScriptAlertsPage";
import { UploadPage } from "../pages/the-internet/UploadPage";

test.describe("The Internet — TC 13 → TC 20", () => {
  test("TC 13a — Upload file PNG thành công", async ({ page }) => {
    const uploadPage = new UploadPage(page);

    await test.step("1) Truy cập trang File Upload", async () => {
      logStep("TC 13a", 1, "Mở /upload");
      await uploadPage.open();
    });

    await test.step("2) Chọn file test_image.png", async () => {
      logStep("TC 13a", 2, "Chọn file PNG");
      const imagePath = assertFixtureExists("test_image.png");
      await uploadPage.uploadFile(imagePath);
    });

    await test.step('3) Click nút "Upload"', async () => {
      logStep("TC 13a", 3, "Submit upload");
      await uploadPage.submit();
    });

    await test.step("4) Kiểm tra upload thành công", async () => {
      logStep("TC 13a", 4, "File Uploaded! test_image.png");
      await uploadPage.expectUploadSuccess("test_image.png");
    });
  });

  test("TC 13b — Upload file TXT thành công", async ({ page }) => {
    const uploadPage = new UploadPage(page);

    await test.step("1) Truy cập trang File Upload", async () => {
      logStep("TC 13b", 1, "Mở /upload");
      await uploadPage.open();
    });

    await test.step("2) Chọn file file_upload.txt", async () => {
      logStep("TC 13b", 2, "Chọn file TXT");
      const textPath = assertFixtureExists("file_upload.txt");
      await uploadPage.uploadFile(textPath);
    });

    await test.step('3) Click nút "Upload"', async () => {
      logStep("TC 13b", 3, "Submit upload");
      await uploadPage.submit();
    });

    await test.step("4) Kiểm tra upload thành công", async () => {
      logStep("TC 13b", 4, "File Uploaded! file_upload.txt");
      await uploadPage.expectUploadSuccess("file_upload.txt");
    });
  });

  test.fail("TC 14 — Upload file > 5MB", async ({ page }) => {
    const uploadPage = new UploadPage(page);

    await test.step("1) Truy cập trang File Upload", async () => {
      logStep("TC 14", 1, "Mở /upload");
      await uploadPage.open();
    });

    await test.step("2) Chọn file large_video.mp4 (> 5MB)", async () => {
      logStep("TC 14", 2, "Chọn file lớn");
      const largePath = assertFixtureMinSize("large_video.mp4", 5 * 1024 * 1024);
      await uploadPage.uploadFile(largePath);
    });

    await test.step('3) Click "Upload" và kiểm tra server từ chối', async () => {
      logStep("TC 14", 3, "Kỳ vọng HTTP >= 400");
      const response = await uploadPage.submitAndWaitForResponse();
      expect(response.status()).toBeGreaterThanOrEqual(400);
      await uploadPage.expectUploadRejected();
    });
  });

  test.fail("TC 15 — Upload file sai định dạng (.exe)", async ({ page }) => {
    const uploadPage = new UploadPage(page);

    await test.step("1) Truy cập trang File Upload", async () => {
      logStep("TC 15", 1, "Mở /upload");
      await uploadPage.open();
    });

    await test.step("2) Chọn file malicious_test.exe", async () => {
      logStep("TC 15", 2, "Chọn file .exe");
      const exePath = assertFixtureExists("malicious_test.exe");
      await uploadPage.uploadFile(exePath);
    });

    await test.step('3) Click "Upload"', async () => {
      logStep("TC 15", 3, "Submit file .exe");
      await uploadPage.submit();
    });

    await test.step("4) Kiểm tra server từ chối file .exe", async () => {
      logStep("TC 15", 4, "Không hiển thị File Uploaded!");
      await uploadPage.expectUploadRejected();
      await expect(uploadPage.uploadedFiles()).not.toHaveText("malicious_test.exe");
    });
  });

  test("TC 16a — Dynamic Loading Example 1", async ({ page }) => {
    const dynamicPage = new DynamicLoadingPage(page);

    await test.step("1) Truy cập Dynamic Loading", async () => {
      logStep("TC 16a", 1, "Mở /dynamic_loading");
      await dynamicPage.open();
    });

    await test.step("2) Mở Example 1: hidden element", async () => {
      logStep("TC 16a", 2, "Vào example 1");
      await dynamicPage.openExample1();
    });

    await test.step('3) Click "Start" và chờ loading', async () => {
      logStep("TC 16a", 3, "Start + chờ finish");
      await dynamicPage.startAndWaitForFinish();
    });
  });

  test("TC 16b — Dynamic Loading Example 2", async ({ page }) => {
    const dynamicPage = new DynamicLoadingPage(page);

    await test.step("1) Truy cập Dynamic Loading", async () => {
      logStep("TC 16b", 1, "Mở /dynamic_loading");
      await dynamicPage.open();
    });

    await test.step("2) Mở Example 2: rendered after", async () => {
      logStep("TC 16b", 2, "Vào example 2");
      await dynamicPage.openExample2();
    });

    await test.step('3) Click "Start" và chờ loading', async () => {
      logStep("TC 16b", 3, "Start + chờ finish");
      await dynamicPage.startAndWaitForFinish();
    });
  });

  test("TC 17 — Drag and Drop", async ({ page }) => {
    const dragPage = new DragAndDropPage(page);

    await test.step("1) Truy cập Drag and Drop", async () => {
      logStep("TC 17", 1, "Mở /drag_and_drop");
      await dragPage.open();
    });

    await test.step("2) Kiểm tra vị trí ban đầu A trái, B phải", async () => {
      logStep("TC 17", 2, "Vị trí ban đầu");
      await dragPage.expectInitialOrder();
    });

    await test.step("3) Drag cột A sang vị trí cột B", async () => {
      logStep("TC 17", 3, "Hoán đổi A và B");
      await dragPage.swapColumns();
    });

    await test.step("4) Drag lại về vị trí ban đầu", async () => {
      logStep("TC 17", 4, "Khôi phục A trái, B phải");
      await dragPage.restoreOrder();
    });
  });

  test("TC 18a — JavaScript Alert", async ({ page }) => {
    const alertsPage = new JavaScriptAlertsPage(page);

    await test.step("1) Truy cập JavaScript Alerts", async () => {
      logStep("TC 18a", 1, "Mở /javascript_alerts");
      await alertsPage.open();
    });

    await test.step('2) Click "Click for JS Alert"', async () => {
      logStep("TC 18a", 2, "Trigger JS Alert");
      await alertsPage.expectAlertAndAccept("I am a JS Alert");
      await alertsPage.clickJsAlert();
    });

    await test.step("3) Kiểm tra result text", async () => {
      logStep("TC 18a", 3, "You successfully clicked an alert");
      await expect(alertsPage.resultText()).toHaveText("You successfully clicked an alert");
    });
  });

  test("TC 18b — JavaScript Confirm (OK)", async ({ page }) => {
    const alertsPage = new JavaScriptAlertsPage(page);

    await test.step("1) Truy cập JavaScript Alerts", async () => {
      logStep("TC 18b", 1, "Mở /javascript_alerts");
      await alertsPage.open();
    });

    await test.step('2) Click "Click for JS Confirm" và OK', async () => {
      logStep("TC 18b", 2, "Confirm + OK");
      await alertsPage.expectConfirmAndAccept("I am a JS Confirm");
      await alertsPage.clickJsConfirm();
    });

    await test.step("3) Kiểm tra result text", async () => {
      logStep("TC 18b", 3, "You clicked: Ok");
      await expect(alertsPage.resultText()).toHaveText("You clicked: Ok");
    });
  });

  test("TC 18c — JavaScript Confirm (Cancel)", async ({ page }) => {
    const alertsPage = new JavaScriptAlertsPage(page);

    await test.step("1) Truy cập JavaScript Alerts", async () => {
      logStep("TC 18c", 1, "Mở /javascript_alerts");
      await alertsPage.open();
    });

    await test.step('2) Click "Click for JS Confirm" và Cancel', async () => {
      logStep("TC 18c", 2, "Confirm + Cancel");
      await alertsPage.expectConfirmAndDismiss("I am a JS Confirm");
      await alertsPage.clickJsConfirm();
    });

    await test.step("3) Kiểm tra result text", async () => {
      logStep("TC 18c", 3, "You clicked: Cancel");
      await expect(alertsPage.resultText()).toHaveText("You clicked: Cancel");
    });
  });

  test("TC 18d — JavaScript Prompt", async ({ page }) => {
    const alertsPage = new JavaScriptAlertsPage(page);

    await test.step("1) Truy cập JavaScript Alerts", async () => {
      logStep("TC 18d", 1, "Mở /javascript_alerts");
      await alertsPage.open();
    });

    await test.step('2) Click "Click for JS Prompt" và nhập Hello QA', async () => {
      logStep("TC 18d", 2, "Prompt + nhập Hello QA");
      await alertsPage.expectPromptAndAccept("I am a JS prompt", "Hello QA");
      await alertsPage.clickJsPrompt();
    });

    await test.step("3) Kiểm tra result text", async () => {
      logStep("TC 18d", 3, "You entered: Hello QA");
      await expect(alertsPage.resultText()).toHaveText("You entered: Hello QA");
    });
  });

  test("TC 19 — Checkboxes", async ({ page }) => {
    const checkboxesPage = new CheckboxesPage(page);

    await test.step("1) Truy cập Checkboxes", async () => {
      logStep("TC 19", 1, "Mở /checkboxes");
      await checkboxesPage.open();
    });

    await test.step("2) Kiểm tra trạng thái mặc định", async () => {
      logStep("TC 19", 2, "Checkbox 1 off, 2 on");
      await checkboxesPage.expectDefaultState();
    });

    await test.step("3) Click Checkbox 1", async () => {
      logStep("TC 19", 3, "Bật checkbox 1");
      await checkboxesPage.checkbox(0).click();
      await expect(checkboxesPage.checkbox(0)).toBeChecked();
    });

    await test.step("4) Click Checkbox 1 lần nữa", async () => {
      logStep("TC 19", 4, "Tắt checkbox 1");
      await checkboxesPage.checkbox(0).click();
      await expect(checkboxesPage.checkbox(0)).not.toBeChecked();
    });

    await test.step("5) Click Checkbox 2", async () => {
      logStep("TC 19", 5, "Tắt checkbox 2");
      await checkboxesPage.checkbox(1).click();
      await expect(checkboxesPage.checkbox(1)).not.toBeChecked();
    });

    await test.step("6) Click cả 2 checkbox", async () => {
      logStep("TC 19", 6, "Bật cả hai");
      await checkboxesPage.checkbox(0).click();
      await checkboxesPage.checkbox(1).click();
      await expect(checkboxesPage.checkbox(0)).toBeChecked();
      await expect(checkboxesPage.checkbox(1)).toBeChecked();
    });

    await test.step("7) Refresh trang", async () => {
      logStep("TC 19", 7, "Reset về mặc định");
      await checkboxesPage.resetByReload();
    });
  });

  test("TC 20 — Dropdown Selection", async ({ page }) => {
    const dropdownPage = new DropdownPage(page);

    await test.step("1) Truy cập Dropdown", async () => {
      logStep("TC 20", 1, "Mở /dropdown");
      await dropdownPage.open();
    });

    await test.step("2) Kiểm tra giá trị mặc định", async () => {
      logStep("TC 20", 2, "Please select an option");
      await dropdownPage.expectDefaultValue();
    });

    await test.step("3) Kiểm tra số lượng tùy chọn", async () => {
      logStep("TC 20", 3, "3 options: default, 1, 2");
      const values = await dropdownPage.getOptionValues();
      expect(values).toEqual(["", "1", "2"]);
    });

    await test.step('4) Chọn "Option 1"', async () => {
      logStep("TC 20", 4, "Select Option 1");
      await dropdownPage.selectOption("1");
      await dropdownPage.expectValue("1");
    });

    await test.step('5) Chọn "Option 2"', async () => {
      logStep("TC 20", 5, "Select Option 2");
      await dropdownPage.selectOption("2");
      await dropdownPage.expectValue("2");
    });

    await test.step('6) Kiểm tra "Option 1" không còn selected', async () => {
      logStep("TC 20", 6, "Option 1 không selected");
      await dropdownPage.expectOptionNotSelected("1");
    });

    await test.step("7) Refresh trang", async () => {
      logStep("TC 20", 7, "Reset dropdown");
      await dropdownPage.resetByReload();
    });
  });
});
