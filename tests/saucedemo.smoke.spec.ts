import { test, expect, type Page } from "@playwright/test";
import { CartPage } from "../pages/CartPage";
import { CheckoutCompletePage } from "../pages/CheckoutCompletePage";
import { CheckoutStepOnePage } from "../pages/CheckoutStepOnePage";
import { CheckoutStepTwoPage } from "../pages/CheckoutStepTwoPage";
import { InventoryPage } from "../pages/InventoryPage";
import { LoginPage } from "../pages/LoginPage";

const users = {
  standard: { username: "standard_user", password: "secret_sauce" },
  lockedOut: { username: "locked_out_user", password: "secret_sauce" },
  invalid: { username: "standard_user", password: "wrong_password" },
};

const products = {
  backpack: { name: "Sauce Labs Backpack", slug: "sauce-labs-backpack" },
  bikeLight: { name: "Sauce Labs Bike Light", slug: "sauce-labs-bike-light" },
};

async function loginStandard(page: Page): Promise<void> {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.loginAs(users.standard.username, users.standard.password);
}

test.describe("Sauce — Authentication", () => {
  test("loads login page", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await expect(page).toHaveTitle(/Swag Labs/i);
    await expect(loginPage.usernameField()).toBeVisible();
  });

  test("login succeeds with standard_user and logs out", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.loginAs(users.standard.username, users.standard.password);

    const inventoryPage = new InventoryPage(page);
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.headerContainer()).toBeVisible();

    await inventoryPage.logout();

    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.usernameField()).toBeVisible();
  });

  test("login fails with invalid password", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.loginAs(users.invalid.username, users.invalid.password);

    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.errorMessageContainer()).toBeVisible();
  });

  test("login fails for locked_out_user", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.loginAs(users.lockedOut.username, users.lockedOut.password);

    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.errorMessageContainer()).toBeVisible();
  });

  
});

test.describe("Sauce — Inventory & Cart", () => {
  test("adds 2 products to cart successfully", async ({ page }) => {
    await loginStandard(page);

    const inventoryPage = new InventoryPage(page);
    await expect(page).toHaveURL(/\/inventory\.html$/);

    await inventoryPage.addItemToCartBySlug(products.backpack.slug);
    await inventoryPage.expectItemAdded(products.backpack.slug);

    await inventoryPage.addItemToCartBySlug(products.bikeLight.slug);
    await inventoryPage.expectItemAdded(products.bikeLight.slug);

    await expect(inventoryPage.cartBadge()).toHaveText("2");

    await inventoryPage.openCart();
    await expect(page).toHaveURL(/\/cart\.html$/);

    const cartPage = new CartPage(page);
    await expect(cartPage.checkoutButton()).toBeVisible();
    await expect(cartPage.cartItemNames()).toContainText([
      products.backpack.name,
      products.bikeLight.name,
    ]);
  });

  test("checks out successfully", async ({ page }) => {
    await loginStandard(page);

    const inventoryPage = new InventoryPage(page);
    await expect(page).toHaveURL(/\/inventory\.html$/);

    await inventoryPage.addItemToCartBySlug(products.backpack.slug);
    await inventoryPage.expectItemAdded(products.backpack.slug);

    await inventoryPage.addItemToCartBySlug(products.bikeLight.slug);
    await inventoryPage.expectItemAdded(products.bikeLight.slug);

    await expect(inventoryPage.cartBadge()).toHaveText("2");

    await inventoryPage.openCart();
    await expect(page).toHaveURL(/\/cart\.html$/);

    const cartPage = new CartPage(page);
    await cartPage.checkout();
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);

    const checkoutStepOnePage = new CheckoutStepOnePage(page);
    await checkoutStepOnePage.fillCustomerInfo("Yen", "Nhi", "700000");
    await checkoutStepOnePage.continue();

    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    const checkoutStepTwoPage = new CheckoutStepTwoPage(page);
    await checkoutStepTwoPage.finish();

    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    const checkoutCompletePage = new CheckoutCompletePage(page);
    await expect(checkoutCompletePage.completeHeader()).toHaveText(
      "Thank you for your order!",
    );
  });
});
