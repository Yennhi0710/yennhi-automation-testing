import type { Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class CartPage extends BasePage {
  checkoutButton(): Locator {
    return this.page.getByTestId("checkout");
  }

  cartItemNames(): Locator {
    return this.page.locator(".cart_item .inventory_item_name");
  }

  cartBadge(): Locator {
    return this.page.getByTestId("shopping-cart-badge");
  }

  async removeItem(productSlug: string): Promise<void> {
    await this.page.getByTestId(`remove-${productSlug}`).click();
  }

  async continueShopping(): Promise<void> {
    await this.page.getByTestId("continue-shopping").click();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton().click();
  }
}

