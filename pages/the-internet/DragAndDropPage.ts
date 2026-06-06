import type { Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import { BaseInternetPage } from "./BaseInternetPage";

export class DragAndDropPage extends BaseInternetPage {
  columnA(): Locator {
    return this.page.locator("#column-a");
  }

  columnB(): Locator {
    return this.page.locator("#column-b");
  }

  async open(): Promise<void> {
    await this.openPath("/drag_and_drop");
    await expect(this.page.getByRole("heading", { name: "Drag and Drop" })).toBeVisible();
  }

  async expectInitialOrder(): Promise<void> {
    await expect(this.columnA().locator("header")).toHaveText("A");
    await expect(this.columnB().locator("header")).toHaveText("B");
  }

  async swapColumns(): Promise<void> {
    await this.columnA().dragTo(this.columnB());
    await expect(this.columnA().locator("header")).toHaveText("B");
    await expect(this.columnB().locator("header")).toHaveText("A");
  }

  async restoreOrder(): Promise<void> {
    await this.columnA().dragTo(this.columnB());
    await expect(this.columnA().locator("header")).toHaveText("A");
    await expect(this.columnB().locator("header")).toHaveText("B");
  }
}
