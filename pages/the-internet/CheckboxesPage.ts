import type { Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import { BaseInternetPage } from "./BaseInternetPage";

export class CheckboxesPage extends BaseInternetPage {
  async open(): Promise<void> {
    await this.openPath("/checkboxes");
    await expect(this.page.getByRole("heading", { name: "Checkboxes" })).toBeVisible();
  }

  checkbox(index: number): Locator {
    return this.page.locator("#checkboxes input").nth(index);
  }

  async expectDefaultState(): Promise<void> {
    await expect(this.checkbox(0)).not.toBeChecked();
    await expect(this.checkbox(1)).toBeChecked();
  }

  async resetByReload(): Promise<void> {
    await this.page.reload();
    await this.expectDefaultState();
  }
}
