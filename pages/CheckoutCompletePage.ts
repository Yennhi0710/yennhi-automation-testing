import type { Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class CheckoutCompletePage extends BasePage {
  completeHeader(): Locator {
    return this.page.getByTestId("complete-header");
  }
}

