import type { Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import { BaseInternetPage } from "./BaseInternetPage";

export class DynamicLoadingPage extends BaseInternetPage {
  finishElement(): Locator {
    return this.page.locator("#finish");
  }

  loadingElement(): Locator {
    return this.page.locator("#loading");
  }

  async open(): Promise<void> {
    await this.openPath("/dynamic_loading");
  }

  async openExample1(): Promise<void> {
    await this.open();
    await expect(
      this.page.getByRole("link", { name: "Example 1: Element on page that is hidden" }),
    ).toBeVisible();
    await this.page
      .getByRole("link", { name: "Example 1: Element on page that is hidden" })
      .click();
    await expect(this.page).toHaveURL(/\/dynamic_loading\/1$/);
  }

  async openExample2(): Promise<void> {
    await this.open();
    await this.page
      .getByRole("link", { name: "Example 2: Element rendered after the fact" })
      .click();
    await expect(this.page).toHaveURL(/\/dynamic_loading\/2$/);
  }

  async startAndWaitForFinish(): Promise<void> {
    await expect(this.finishElement()).toBeHidden();
    await this.page.getByRole("button", { name: "Start" }).click();
    await expect(this.loadingElement()).toBeVisible();
    await expect(this.loadingElement()).toBeHidden({ timeout: 10_000 });
    await expect(this.finishElement()).toBeVisible();
    await expect(this.finishElement()).toHaveText("Hello World!");
  }
}
