import type { Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import { BaseInternetPage } from "./BaseInternetPage";

export class JavaScriptAlertsPage extends BaseInternetPage {
  resultText(): Locator {
    return this.page.locator("#result");
  }

  async open(): Promise<void> {
    await this.openPath("/javascript_alerts");
    await expect(this.page.getByRole("heading", { name: "JavaScript Alerts" })).toBeVisible();
  }

  async clickJsAlert(): Promise<void> {
    await this.page.getByRole("button", { name: "Click for JS Alert" }).click();
  }

  async clickJsConfirm(): Promise<void> {
    await this.page.getByRole("button", { name: "Click for JS Confirm" }).click();
  }

  async clickJsPrompt(): Promise<void> {
    await this.page.getByRole("button", { name: "Click for JS Prompt" }).click();
  }

  async expectAlertAndAccept(expectedMessage: string): Promise<void> {
    this.page.once("dialog", async (dialog) => {
      expect(dialog.message()).toBe(expectedMessage);
      await dialog.accept();
    });
  }

  async expectConfirmAndAccept(expectedMessage: string): Promise<void> {
    this.page.once("dialog", async (dialog) => {
      expect(dialog.message()).toBe(expectedMessage);
      await dialog.accept();
    });
  }

  async expectConfirmAndDismiss(expectedMessage: string): Promise<void> {
    this.page.once("dialog", async (dialog) => {
      expect(dialog.message()).toBe(expectedMessage);
      await dialog.dismiss();
    });
  }

  async expectPromptAndAccept(expectedMessage: string, input: string): Promise<void> {
    this.page.once("dialog", async (dialog) => {
      expect(dialog.message()).toBe(expectedMessage);
      await dialog.accept(input);
    });
  }
}
