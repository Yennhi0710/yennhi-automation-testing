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
  performance: { username: "performance_glitch_user", password: "secret_sauce" },
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

test.describe("Sauce — Test Manual TC 01 → TC 12", () => {
  test("TC 01 — Đăng nhập thành công", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await expect(page).toHaveTitle(/Swag Labs/i);

    await loginPage.loginAs(users.standard.username, users.standard.password);
    await expect(page).toHaveURL(/\/inventory\.html$/);

    const inventoryPage = new InventoryPage(page);
    await expect(page.locator(".title")).toHaveText("Products");
    await expect(page.locator(".inventory_item")).toHaveCount(6);
    await expect(inventoryPage.headerContainer()).toBeVisible();
    await expect(inventoryPage.cartLink()).toBeVisible();
    await expect(inventoryPage.cartBadge()).toHaveCount(0);
  });

  test("TC 02 — Đăng nhập – tài khoản bị khóa", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.loginAs(users.lockedOut.username, users.lockedOut.password);

    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.errorMessageContainer()).toBeVisible();
    await expect(loginPage.errorMessageContainer()).toContainText(
      "Epic sadface: Sorry, this user has been locked out.",
    );
    await expect(page.locator(".error-button")).toBeVisible();

    await page.locator(".error-button").click();
    await expect(loginPage.errorMessageContainer()).not.toContainText("Epic sadface:");
    await expect(page.getByTestId("username")).toHaveValue(users.lockedOut.username);
    await expect(page.getByTestId("password")).toHaveValue(users.lockedOut.password);
  });

  test("TC 03 — Đăng nhập – sai mật khẩu", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.loginAs(users.invalid.username, users.invalid.password);

    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.errorMessageContainer()).toBeVisible();
    await expect(loginPage.errorMessageContainer()).toContainText(
      "Epic sadface: Username and password do not match any user in this service",
    );

    await page.getByTestId("password").fill(users.standard.password);
    await page.getByTestId("login-button").click();
    await expect(page).toHaveURL(/\/inventory\.html$/);
  });

  test("TC 04 — Đăng nhập để trống Username/Password", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();

    await page.getByTestId("login-button").click();
    await expect(loginPage.errorMessageContainer()).toBeVisible();
    await expect(loginPage.errorMessageContainer()).toContainText("Username is required");

    await page.getByTestId("username").fill(users.standard.username);
    await page.getByTestId("login-button").click();
    await expect(loginPage.errorMessageContainer()).toContainText("Password is required");
  });

  test("TC 05 — Đăng nhập – Performance Glitch User", async ({ page }) => {
    test.setTimeout(90_000);
    const loginPage = new LoginPage(page);
    await loginPage.open();

    const startedAt = Date.now();
    await loginPage.loginAs(users.performance.username, users.performance.password);
    await expect(page).toHaveURL(/\/inventory\.html$/, { timeout: 60_000 });
    const elapsedMs = Date.now() - startedAt;
    expect(elapsedMs).toBeGreaterThanOrEqual(3000);
  });

  test("TC 06 — Đăng xuất", async ({ page }) => {
    await loginStandard(page);

    const inventoryPage = new InventoryPage(page);
    await expect(page).toHaveURL(/\/inventory\.html$/);

    await inventoryPage.logout();
    await expect(page).toHaveURL(/\/$/);
    await expect(new LoginPage(page).usernameField()).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
  });

  test("TC 07 — Thêm sản phẩm vào giỏ hàng", async ({ page }) => {
    await loginStandard(page);

    const inventoryPage = new InventoryPage(page);
    await expect(page).toHaveURL(/\/inventory\.html$/);

    await addDefaultProducts(inventoryPage);
    await expect(inventoryPage.cartBadge()).toHaveText("2");

    await inventoryPage.openCart();
    await expect(page).toHaveURL(/\/cart\.html$/);

    const cartPage = new CartPage(page);
    await expect(cartPage.cartItemNames()).toContainText([
      products.backpack.name,
      products.bikeLight.name,
    ]);
  });

  test("TC 08 — Xóa sản phẩm khỏi giỏ hàng", async ({ page }) => {
    await loginStandard(page);

    const inventoryPage = new InventoryPage(page);
    await expect(page).toHaveURL(/\/inventory\.html$/);

    await addDefaultProducts(inventoryPage);
    await expect(inventoryPage.cartBadge()).toHaveText("2");

    await inventoryPage.openCart();
    await expect(page).toHaveURL(/\/cart\.html$/);

    await page.getByTestId(`remove-${products.backpack.slug}`).click();
    await expect(page.getByTestId("shopping-cart-badge")).toHaveText("1");

    await page.getByTestId("continue-shopping").click();
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(page.getByTestId(`add-to-cart-${products.backpack.slug}`)).toBeVisible();
    await expect(page.getByTestId(`remove-${products.bikeLight.slug}`)).toBeVisible();
  });

  test("TC 09 — Hoàn tất checkout", async ({ page }) => {
    await loginStandard(page);

    const checkoutStepOnePage = await goToCheckoutStepOneFromInventory(page);
    await checkoutStepOnePage.fillCustomerInfo("John", "Doe", "10001");
    await checkoutStepOnePage.continue();

    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await new CheckoutStepTwoPage(page).finish();

    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(new CheckoutCompletePage(page).completeHeader()).toHaveText(
      "Thank you for your order!",
    );
  });

  test("TC 10 — Checkout thiếu thông tin", async ({ page }) => {
    await loginStandard(page);

    const checkoutStepOnePage = await goToCheckoutStepOneFromInventory(page);
    await checkoutStepOnePage.continue();
    await expect(checkoutStepOnePage.errorMessage()).toBeVisible();

    await checkoutStepOnePage.firstNameField().fill("Jane");
    await checkoutStepOnePage.continue();
    await expect(checkoutStepOnePage.errorMessage()).toBeVisible();

    await checkoutStepOnePage.lastNameField().fill("Smith");
    await checkoutStepOnePage.continue();
    await expect(checkoutStepOnePage.errorMessage()).toBeVisible();

    await checkoutStepOnePage.postalCodeField().fill("90210");
    await checkoutStepOnePage.continue();
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
  });

  test("TC 11 — Checkout khi giỏ hàng trống", async ({ page }) => {
    await loginStandard(page);
    await expect(page.getByTestId("shopping-cart-badge")).toHaveCount(0);

    await new InventoryPage(page).openCart();
    await expect(page).toHaveURL(/\/cart\.html$/);

    await new CartPage(page).checkout();

    await expect(page).toHaveURL(/\/cart\.html$/, { timeout: 2000 });
  });

  test("TC 12 — Sắp xếp sản phẩm theo giá", async ({ page }) => {
    await loginStandard(page);
    await expect(page).toHaveURL(/\/inventory\.html$/);

    const sort = page.getByTestId("product-sort-container");
    await expect(sort).toBeVisible();

    await sort.selectOption("lohi");
    const pricesText = await page.locator(".inventory_item_price").allTextContents();
    const prices = pricesText.map((t) => Number(t.replace("$", "")));
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });
});
