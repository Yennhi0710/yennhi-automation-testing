import type { Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class InventoryPage extends BasePage {
  headerContainer(): Locator {
    return this.page.locator(".header_container");
  }

  inventoryItemImages(): Locator {
    return this.page.locator(".inventory_item_img img");
  }

  cartLink(): Locator {
    return this.page.getByTestId("shopping-cart-link");
  }

  cartBadge(): Locator {
    return this.page.getByTestId("shopping-cart-badge");
  }

  private itemCard(productName: string): Locator {
    return this.page.locator(".inventory_item").filter({ hasText: productName });
  }

  private addToCartButton(productSlug: string): Locator {
    return this.page.getByTestId(`add-to-cart-${productSlug}`);
  }

  private removeButton(productSlug: string): Locator {
    return this.page.getByTestId(`remove-${productSlug}`);
  }

  private menuButton(): Locator {
    return this.page.locator("#react-burger-menu-btn");
  }

  private logoutLink(): Locator {
    return this.page.getByTestId("logout-sidebar-link");
  }

  async addItemToCart(productName: string): Promise<void> {
    await this.itemCard(productName).getByRole("button", { name: "Add to cart" }).click();
  }

  async addItemToCartBySlug(productSlug: string): Promise<void> {
    await this.addToCartButton(productSlug).click();
  }

  async expectItemAdded(productSlug: string): Promise<void> {
    await this.removeButton(productSlug).waitFor();
  }

  async openCart(): Promise<void> {
    await this.cartLink().click();
  }

  async logout(): Promise<void> {
    await this.menuButton().click();
    await this.logoutLink().click();
  }

  productsTitle(): Locator {
    return this.page.locator(".title");
  }

  inventoryItems(): Locator {
    return this.page.locator(".inventory_item");
  }

  sortDropdown(): Locator {
    return this.page.getByTestId("product-sort-container");
  }

  removeFromCartButton(productSlug: string): Locator {
    return this.removeButton(productSlug);
  }

  addToCartBtn(productSlug: string): Locator {
    return this.addToCartButton(productSlug);
  }

  async removeFromCart(productSlug: string): Promise<void> {
    await this.removeButton(productSlug).click();
  }

  async continueShopping(): Promise<void> {
    await this.page.getByTestId("continue-shopping").click();
  }

  async sortByPriceLowToHigh(): Promise<void> {
    await this.sortDropdown().selectOption("lohi");
  }

  async getPrices(): Promise<number[]> {
    const pricesText = await this.page.locator(".inventory_item_price").allTextContents();
    return pricesText.map((t) => Number(t.replace("$", "")));
  }
}
