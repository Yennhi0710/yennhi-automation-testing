import type { Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class CartPage extends BasePage {
  checkoutButton(): Locator {
    return this.page.getByTestId("checkout");
  }

  cartItemNames(): Locator {
    return this.page.locator(".cart_item .inventory_item_name");
  }

  async checkout(): Promise<void> {
    await this.checkoutButton().click();
  }
}

