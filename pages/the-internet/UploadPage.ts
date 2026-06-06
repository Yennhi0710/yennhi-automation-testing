import type { Locator, Response } from "@playwright/test";
import { expect } from "@playwright/test";
import { BaseInternetPage } from "./BaseInternetPage";

export class UploadPage extends BaseInternetPage {
  heading(): Locator {
    return this.page.getByRole("heading", { name: "File Uploader" });
  }

  fileInput(): Locator {
    return this.page.locator("#file-upload");
  }

  submitButton(): Locator {
    return this.page.locator("#file-submit");
  }

  uploadedFiles(): Locator {
    return this.page.locator("#uploaded-files");
  }

  successHeading(): Locator {
    return this.page.getByRole("heading", { name: "File Uploaded!" });
  }

  async open(): Promise<void> {
    await this.openPath("/upload");
    await expect(this.heading()).toBeVisible();
  }

  async uploadFile(filePath: string): Promise<void> {
    await this.fileInput().setInputFiles(filePath);
  }

  async submit(): Promise<void> {
    await this.submitButton().click();
  }

  async uploadAndSubmit(filePath: string): Promise<void> {
    await this.uploadFile(filePath);
    await this.submit();
  }

  async submitAndWaitForResponse(): Promise<Response> {
    const [response] = await Promise.all([
      this.page.waitForResponse((r) => r.url().endsWith("/upload"), { timeout: 30_000 }),
      this.submitButton().click(),
    ]);
    return response;
  }

  async expectUploadSuccess(filename: string): Promise<void> {
    await expect(this.successHeading()).toBeVisible();
    await expect(this.uploadedFiles()).toHaveText(filename);
  }

  async expectUploadRejected(): Promise<void> {
    await expect(this.successHeading()).toHaveCount(0);
  }
}
