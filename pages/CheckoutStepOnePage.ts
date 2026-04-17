import type { Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class CheckoutStepOnePage extends BasePage {
  firstNameField(): Locator {
    return this.page.getByTestId("firstName");
  }

  lastNameField(): Locator {
    return this.page.getByTestId("lastName");
  }

  postalCodeField(): Locator {
    return this.page.getByTestId("postalCode");
  }

  continueButton(): Locator {
    return this.page.getByTestId("continue");
  }

  async fillCustomerInfo(
    firstName: string,
    lastName: string,
    postalCode: string,
  ): Promise<void> {
    await this.firstNameField().fill(firstName);
    await this.lastNameField().fill(lastName);
    await this.postalCodeField().fill(postalCode);
  }

  async continue(): Promise<void> {
    await this.continueButton().click();
  }
}

