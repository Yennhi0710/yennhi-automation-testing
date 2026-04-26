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
  problem: { username: "problem_user", password: "secret_sauce" },
  performance: { username: "performance_glitch_user", password: "secret_sauce" },
  error: { username: "error_user", password: "secret_sauce" },
};

const products = {
  backpack: { name: "Sauce Labs Backpack", slug: "sauce-labs-backpack" },
  bikeLight: { name: "Sauce Labs Bike Light", slug: "sauce-labs-bike-light" },
};

async function loginUser(page: Page, username: string, password: string): Promise<void> {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.loginAs(username, password);
}

async function loginStandard(page: Page): Promise<void> {
  await loginUser(page, users.standard.username, users.standard.password);
}

async function addDefaultProducts(inventoryPage: InventoryPage): Promise<void> {
  await inventoryPage.addItemToCartBySlug(products.backpack.slug);
  await inventoryPage.expectItemAdded(products.backpack.slug);

  await inventoryPage.addItemToCartBySlug(products.bikeLight.slug);
  await inventoryPage.expectItemAdded(products.bikeLight.slug);
}

async function goToCheckoutStepOneFromInventory(page: Page): Promise<CheckoutStepOnePage> {
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

    await addDefaultProducts(inventoryPage);

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
    const checkoutStepOnePage = await goToCheckoutStepOneFromInventory(page);
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

test.describe("Sauce — Special Users", () => {
  test("problem_user shows duplicated product images", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.loginAs(users.problem.username, users.problem.password);

    const inventoryPage = new InventoryPage(page);
    await expect(page).toHaveURL(/\/inventory\.html$/);

    const images = inventoryPage.inventoryItemImages();
    await expect(images.first()).toBeVisible();

    const src0 = await images.nth(0).getAttribute("src");
    const src1 = await images.nth(1).getAttribute("src");

    expect(src0).toBeTruthy();
    expect(src1).toBeTruthy();
    expect(src0).toBe(src1);
  });

  test("problem_user cannot input last name on checkout step one", async ({ page }) => {
    await loginUser(page, users.problem.username, users.problem.password);
    const checkoutStepOnePage = await goToCheckoutStepOneFromInventory(page);
    await checkoutStepOnePage.firstNameField().fill("Yen");
    await checkoutStepOnePage.lastNameField().fill("Nhi");
    await checkoutStepOnePage.postalCodeField().fill("700000");

    await checkoutStepOnePage.continue();
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
    await expect(checkoutStepOnePage.errorMessage()).toContainText(
      "Last Name is required",
    );
  });

  test("performance_glitch_user eventually loads inventory page", async ({ page }) => {
    test.setTimeout(90_000);

    const loginPage = new LoginPage(page);
    await loginPage.open();

    const startedAt = Date.now();
    await loginPage.loginAs(users.performance.username, users.performance.password);

    await expect(page).toHaveURL(/\/inventory\.html$/, { timeout: 60_000 });

    const inventoryPage = new InventoryPage(page);
    await expect(inventoryPage.headerContainer()).toBeVisible({ timeout: 60_000 });

    expect(Date.now() - startedAt).toBeGreaterThanOrEqual(0);
  });

  test("error_user can continue checkout step one without last name", async ({ page }) => {
    await loginUser(page, users.error.username, users.error.password);
    const checkoutStepOnePage = await goToCheckoutStepOneFromInventory(page);
    await checkoutStepOnePage.firstNameField().fill("Yen");
    await checkoutStepOnePage.postalCodeField().fill("700000");
    await checkoutStepOnePage.continue();

    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(checkoutStepOnePage.errorMessage()).toBeHidden();
  });
});
