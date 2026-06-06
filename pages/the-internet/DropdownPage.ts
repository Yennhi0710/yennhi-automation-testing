import type { Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import { BaseInternetPage } from "./BaseInternetPage";

export class DropdownPage extends BaseInternetPage {
  dropdown(): Locator {
    return this.page.locator("#dropdown");
  }

  async open(): Promise<void> {
    await this.openPath("/dropdown");
    await expect(this.page.getByRole("heading", { name: "Dropdown List" })).toBeVisible();
  }

  async expectDefaultValue(): Promise<void> {
    await expect(this.dropdown()).toHaveValue("");
  }

  async getOptionValues(): Promise<string[]> {
    return this.dropdown().locator("option").evaluateAll(
      (options) => options.map((o) => (o as HTMLOptionElement).value),
    );
  }

  async selectOption(value: string): Promise<void> {
    await this.dropdown().selectOption(value);
  }

  async expectValue(value: string): Promise<void> {
    await expect(this.dropdown()).toHaveValue(value);
  }

  async expectOptionNotSelected(value: string): Promise<void> {
    const selected = await this.dropdown()
      .locator(`option[value="${value}"]`)
      .evaluate((o) => (o as HTMLOptionElement).selected);
    expect(selected).toBe(false);
  }

  async resetByReload(): Promise<void> {
    await this.page.reload();
    await this.expectDefaultValue();
  }
}
