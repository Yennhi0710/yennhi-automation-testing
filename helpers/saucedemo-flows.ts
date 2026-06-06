import { expect, type Page } from "@playwright/test";
import { products, users } from "../fixtures/test-data";
import { CartPage } from "../pages/CartPage";
import { CheckoutStepOnePage } from "../pages/CheckoutStepOnePage";
import { InventoryPage } from "../pages/InventoryPage";
import { LoginPage } from "../pages/LoginPage";

export async function loginUser(
  page: Page,
  username: string,
  password: string,
): Promise<void> {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.loginAs(username, password);
}

export async function loginStandard(page: Page): Promise<void> {
  await loginUser(page, users.standard.username, users.standard.password);
}

export async function addDefaultProducts(inventoryPage: InventoryPage): Promise<void> {
  await inventoryPage.addItemToCartBySlug(products.backpack.slug);
  await inventoryPage.expectItemAdded(products.backpack.slug);

  await inventoryPage.addItemToCartBySlug(products.bikeLight.slug);
  await inventoryPage.expectItemAdded(products.bikeLight.slug);
}

export async function goToCheckoutStepOneFromInventory(
  page: Page,
): Promise<CheckoutStepOnePage> {
  const inventoryPage = new InventoryPage(page);
  await expect(page).toHaveURL(/\/inventory\.html$/);

  await addDefaultProducts(inventoryPage);

  await inventoryPage.openCart();
  await expect(page).toHaveURL(/\/cart\.html$/);

  const cartPage = new CartPage(page);
  await cartPage.checkout();
  await expect(page).toHaveURL(/\/checkout-step-one\.html$/);

  return new CheckoutStepOnePage(page);
}
