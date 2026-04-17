import type { Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class CheckoutStepTwoPage extends BasePage {
  finishButton(): Locator {
    return this.page.getByTestId("finish");
  }

  async finish(): Promise<void> {
    await this.finishButton().click();
  }
}

