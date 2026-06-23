import { test, expect } from "@playwright/test";
import { products, users } from "../fixtures/test-data";
import { annotateKnownBug } from "../helpers/known-bug";
import { logStep } from "../helpers/test-logger";
import {
  goToCheckoutStepOneFromInventory,
  loginStandard,
  loginUser,
} from "../helpers/saucedemo-flows";
import { CartPage } from "../pages/CartPage";
import { CheckoutCompletePage } from "../pages/CheckoutCompletePage";
import { CheckoutStepOnePage } from "../pages/CheckoutStepOnePage";
import { CheckoutStepTwoPage } from "../pages/CheckoutStepTwoPage";
import { InventoryPage } from "../pages/InventoryPage";
import { LoginPage } from "../pages/LoginPage";

test.describe("Sauce — Test Manual TC 01 → TC 12", () => {
  test("TC 01 — Đăng nhập thành công", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await test.step("1) Truy cập https://www.saucedemo.com/", async () => {
      logStep("TC 01", 1, "Truy cập trang đăng nhập");
      await loginPage.open();
    });

    await test.step('2) Kiểm tra tiêu đề trang là "Swag Labs"', async () => {
      logStep("TC 01", 2, "Kiểm tra title Swag Labs");
      await expect(page).toHaveTitle(/Swag Labs/i);
    });

    await test.step("3) Nhập Username: standard_user", async () => {
      logStep("TC 01", 3, "Nhập username");
      await loginPage.fillUsername(users.standard.username);
    });

    await test.step("4) Nhập Password: secret_sauce", async () => {
      logStep("TC 01", 4, "Nhập password");
      await loginPage.fillPassword(users.standard.password);
    });

    await test.step('5) Click nút "Login"', async () => {
      logStep("TC 01", 5, "Click Login");
      await loginPage.clickLogin();
    });

    await test.step("6) Kiểm tra URL hiện tại", async () => {
      logStep("TC 01", 6, "Kiểm tra URL /inventory.html");
      await expect(page).toHaveURL(/\/inventory\.html$/);
    });

    await test.step("7) Kiểm tra trang danh sách sản phẩm", async () => {
      logStep("TC 01", 7, "Kiểm tra Products và 6 items");
      await expect(inventoryPage.productsTitle()).toHaveText("Products");
      await expect(inventoryPage.inventoryItems()).toHaveCount(6);
    });

    await test.step("8) Kiểm tra biểu tượng giỏ hàng trên header", async () => {
      logStep("TC 01", 8, "Kiểm tra giỏ hàng, badge trống");
      await expect(inventoryPage.headerContainer()).toBeVisible();
      await expect(inventoryPage.cartLink()).toBeVisible();
      await expect(inventoryPage.cartBadge()).toHaveCount(0);
    });
  });

  test("TC 02 — Đăng nhập – tài khoản bị khóa", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step("1) Truy cập https://www.saucedemo.com/", async () => {
      logStep("TC 02", 1, "Truy cập trang đăng nhập");
      await loginPage.open();
    });

    await test.step("2) Nhập Username: locked_out_user", async () => {
      logStep("TC 02", 2, "Nhập username locked_out_user");
      await loginPage.fillUsername(users.lockedOut.username);
    });

    await test.step("3) Nhập Password: secret_sauce", async () => {
      logStep("TC 02", 3, "Nhập password");
      await loginPage.fillPassword(users.lockedOut.password);
    });

    await test.step('4) Click nút "Login"', async () => {
      logStep("TC 02", 4, "Click Login");
      await loginPage.clickLogin();
    });

    await test.step("5) Kiểm tra thông báo lỗi", async () => {
      logStep("TC 02", 5, "Kiểm tra thông báo locked out");
      await expect(loginPage.errorMessageContainer()).toBeVisible();
      await expect(loginPage.errorMessageContainer()).toContainText(
        "Epic sadface: Sorry, this user has been locked out.",
      );
    });

    await test.step("6) Kiểm tra URL không thay đổi", async () => {
      logStep("TC 02", 6, "URL vẫn trang login");
      await expect(page).toHaveURL(/\/$/);
    });

    await test.step("7) Kiểm tra icon lỗi bên cạnh các trường", async () => {
      logStep("TC 02", 7, "Icon X hiển thị");
      await expect(loginPage.errorButton()).toBeVisible();
    });

    await test.step("8) Click icon X để xóa thông báo", async () => {
      logStep("TC 02", 8, "Dismiss thông báo lỗi");
      await loginPage.dismissError();
    });

    await test.step("9) Kiểm tra dữ liệu input sau khi xóa lỗi", async () => {
      logStep("TC 02", 9, "Input vẫn giữ giá trị");
      await expect(loginPage.errorMessageContainer()).not.toContainText("Epic sadface:");
      await expect(loginPage.usernameField()).toHaveValue(users.lockedOut.username);
      await expect(loginPage.passwordField()).toHaveValue(users.lockedOut.password);
    });
  });

  test("TC 03 — Đăng nhập – sai mật khẩu", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step("1) Truy cập https://www.saucedemo.com/", async () => {
      logStep("TC 03", 1, "Truy cập trang đăng nhập");
      await loginPage.open();
    });

    await test.step("2) Nhập Username: standard_user", async () => {
      logStep("TC 03", 2, "Nhập username sai");
      await loginPage.fillUsername(users.invalid.username);
    });

    await test.step("3) Nhập Password: wrong_password", async () => {
      logStep("TC 03", 3, "Nhập password sai");
      await loginPage.fillPassword(users.invalid.password);
    });

    await test.step('4) Click nút "Login"', async () => {
      logStep("TC 03", 4, "Click Login");
      await loginPage.clickLogin();
    });

    await test.step("5) Kiểm tra thông báo lỗi", async () => {
      logStep("TC 03", 5, "Thông báo không khớp user");
      await expect(page).toHaveURL(/\/$/);
      await expect(loginPage.errorMessageContainer()).toContainText(
        "Epic sadface: Username and password do not match any user in this service",
      );
    });

    await test.step("6) Kiểm tra URL không thay đổi", async () => {
      logStep("TC 03", 6, "Vẫn ở trang login");
      await expect(page).toHaveURL(/\/$/);
    });

    await test.step("7) Xóa Password và nhập lại secret_sauce", async () => {
      logStep("TC 03", 7, "Sửa password đúng");
      await loginPage.fillPassword(users.standard.password);
    });

    await test.step('8) Click nút "Login"', async () => {
      logStep("TC 03", 8, "Đăng nhập lại thành công");
      await loginPage.clickLogin();
      await expect(page).toHaveURL(/\/inventory\.html$/);
    });
  });

  test("TC 04 — Đăng nhập để trống Username/Password", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step("1) Truy cập https://www.saucedemo.com/", async () => {
      logStep("TC 04", 1, "Truy cập trang đăng nhập");
      await loginPage.open();
    });

    await test.step('2) Click nút "Login" khi để trống Username', async () => {
      logStep("TC 04", 2, "Click Login không nhập gì");
      await loginPage.clickLogin();
    });

    await test.step("3) Kiểm tra thông báo Username is required", async () => {
      logStep("TC 04", 3, "Báo lỗi Username is required");
      await expect(loginPage.errorMessageContainer()).toBeVisible();
      await expect(loginPage.errorMessageContainer()).toContainText("Username is required");
    });

    await test.step("4) Nhập Username: standard_user", async () => {
      logStep("TC 04", 4, "Nhập username");
      await loginPage.fillUsername(users.standard.username);
    });

    await test.step('5) Click nút "Login" khi để trống Password', async () => {
      logStep("TC 04", 5, "Click Login thiếu password");
      await loginPage.clickLogin();
    });

    await test.step("6) Kiểm tra thông báo Password is required", async () => {
      logStep("TC 04", 6, "Báo lỗi Password is required");
      await expect(loginPage.errorMessageContainer()).toContainText("Password is required");
    });
  });

  test("TC 05 — Đăng nhập – Performance Glitch User", async ({ page }) => {
    test.setTimeout(90_000);
    const loginPage = new LoginPage(page);

    await test.step("1) Truy cập https://www.saucedemo.com/", async () => {
      logStep("TC 05", 1, "Truy cập trang đăng nhập");
      await loginPage.open();
    });

    await test.step("2) Nhập credentials performance_glitch_user", async () => {
      logStep("TC 05", 2, "Nhập user performance");
      await loginPage.fillUsername(users.performance.username);
      await loginPage.fillPassword(users.performance.password);
    });

    await test.step('3) Click nút "Login" và đo thời gian', async () => {
      logStep("TC 05", 3, "Login chậm >= 3 giây");
      const startedAt = Date.now();
      await loginPage.clickLogin();
      await expect(page).toHaveURL(/\/inventory\.html$/, { timeout: 60_000 });
      expect(Date.now() - startedAt).toBeGreaterThanOrEqual(3000);
    });

    await test.step("4) Kiểm tra vào trang Products", async () => {
      logStep("TC 05", 4, "Vào inventory thành công");
      await expect(page).toHaveURL(/\/inventory\.html$/);
    });
  });

  test("TC 06 — Đăng xuất và Back sau khi đăng xuất", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await test.step("1) Đăng nhập standard_user", async () => {
      logStep("TC 06", 1, "Đăng nhập");
      await loginUser(page, users.standard.username, users.standard.password);
    });

    await test.step("2) Kiểm tra đang ở /inventory.html", async () => {
      logStep("TC 06", 2, "Xác nhận trang Products");
      await expect(page).toHaveURL(/\/inventory\.html$/);
    });

    await test.step('3) Mở menu và click "Logout"', async () => {
      logStep("TC 06", 3, "Đăng xuất");
      await inventoryPage.logout();
    });

    await test.step("4) Kiểm tra quay về trang login", async () => {
      logStep("TC 06", 4, "URL về / và form login hiển thị");
      await expect(page).toHaveURL(/\/$/);
      await expect(loginPage.usernameField()).toBeVisible();
    });

    await test.step("5) Nhấn Back trên trình duyệt", async () => {
      logStep("TC 06", 5, "Nhấn Back");
      await page.goBack();
    });

    await test.step("6) Kiểm tra vẫn ở trang login", async () => {
      logStep("TC 06", 6, "Không quay lại inventory");
      await expect(page).toHaveURL(/\/$/);
      await expect(loginPage.usernameField()).toBeVisible();
    });
  });

  test("TC 07 — Thêm sản phẩm vào giỏ hàng", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await test.step("1) Đăng nhập standard_user", async () => {
      logStep("TC 07", 1, "Đăng nhập");
      await loginStandard(page);
    });

    await test.step("2) Add Sauce Labs Backpack", async () => {
      logStep("TC 07", 2, "Thêm Backpack");
      await inventoryPage.addItemToCartBySlug(products.backpack.slug);
      await inventoryPage.expectItemAdded(products.backpack.slug);
    });

    await test.step("3) Add Sauce Labs Bike Light", async () => {
      logStep("TC 07", 3, "Thêm Bike Light");
      await inventoryPage.addItemToCartBySlug(products.bikeLight.slug);
      await inventoryPage.expectItemAdded(products.bikeLight.slug);
    });

    await test.step("4) Kiểm tra badge giỏ hàng = 2", async () => {
      logStep("TC 07", 4, "Badge hiển thị 2");
      await expect(inventoryPage.cartBadge()).toHaveText("2");
    });

    await test.step("5) Click icon giỏ hàng", async () => {
      logStep("TC 07", 5, "Mở giỏ hàng");
      await inventoryPage.openCart();
      await expect(page).toHaveURL(/\/cart\.html$/);
    });

    await test.step("6) Kiểm tra danh sách sản phẩm trong giỏ", async () => {
      logStep("TC 07", 6, "2 sản phẩm trong giỏ");
      await expect(cartPage.cartItemNames()).toContainText([
        products.backpack.name,
        products.bikeLight.name,
      ]);
    });

    await test.step("7) Kiểm tra nút Checkout", async () => {
      logStep("TC 07", 7, "Nút Checkout hiển thị");
      await expect(cartPage.checkoutButton()).toBeVisible();
    });
  });

  test("TC 08 — Xóa sản phẩm khỏi giỏ hàng", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await test.step("1) Đăng nhập và thêm 2 sản phẩm", async () => {
      logStep("TC 08", 1, "Login + add 2 SP");
      await loginStandard(page);
      await inventoryPage.addItemToCartBySlug(products.backpack.slug);
      await inventoryPage.addItemToCartBySlug(products.bikeLight.slug);
      await expect(inventoryPage.cartBadge()).toHaveText("2");
    });

    await test.step("2) Mở giỏ hàng", async () => {
      logStep("TC 08", 2, "Vào /cart.html");
      await inventoryPage.openCart();
      await expect(page).toHaveURL(/\/cart\.html$/);
    });

    await test.step("3) Xóa Sauce Labs Backpack", async () => {
      logStep("TC 08", 3, "Remove Backpack");
      await cartPage.removeItem(products.backpack.slug);
      await expect(cartPage.cartBadge()).toHaveText("1");
    });

    await test.step("4) Click Continue Shopping", async () => {
      logStep("TC 08", 4, "Quay lại inventory");
      await cartPage.continueShopping();
      await expect(page).toHaveURL(/\/inventory\.html$/);
    });

    await test.step("5) Kiểm tra nút Add/Remove đúng trạng thái", async () => {
      logStep("TC 08", 5, "Backpack Add, Bike Light Remove");
      await expect(inventoryPage.addToCartBtn(products.backpack.slug)).toBeVisible();
      await expect(inventoryPage.removeFromCartButton(products.bikeLight.slug)).toBeVisible();
    });
  });

  test("TC 09 — Hoàn tất checkout", async ({ page }) => {
    const checkoutStepOnePage = new CheckoutStepOnePage(page);

    await test.step("1) Đăng nhập standard_user", async () => {
      logStep("TC 09", 1, "Đăng nhập");
      await loginStandard(page);
    });

    await test.step("2) Thêm sản phẩm và vào checkout step one", async () => {
      logStep("TC 09", 2, "Add 2 SP + checkout");
      await goToCheckoutStepOneFromInventory(page);
    });

    await test.step("3) Nhập thông tin giao hàng", async () => {
      logStep("TC 09", 3, "Điền First/Last/Zip");
      await checkoutStepOnePage.fillCustomerInfo("John", "Doe", "10001");
    });

    await test.step('4) Click "Continue"', async () => {
      logStep("TC 09", 4, "Sang checkout step two");
      await checkoutStepOnePage.continue();
      await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    });

    await test.step('5) Click "Finish"', async () => {
      logStep("TC 09", 5, "Hoàn tất đơn hàng");
      await new CheckoutStepTwoPage(page).finish();
      await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    });

    await test.step("6) Kiểm tra thông báo Thank you", async () => {
      logStep("TC 09", 6, "Thank you for your order!");
      await expect(new CheckoutCompletePage(page).completeHeader()).toHaveText(
        "Thank you for your order!",
      );
    });
  });

  test("TC 10 — Validation form checkout", async ({ page }) => {
    const checkoutStepOnePage = new CheckoutStepOnePage(page);

    await test.step("1) Vào checkout step one", async () => {
      logStep("TC 10", 1, "Login + checkout");
      await loginStandard(page);
      await goToCheckoutStepOneFromInventory(page);
    });

    await test.step('2) Click "Continue" không nhập gì', async () => {
      logStep("TC 10", 2, "Continue trống form");
      await checkoutStepOnePage.continue();
      await expect(checkoutStepOnePage.errorMessage()).toBeVisible();
    });

    await test.step("3) Chỉ nhập First Name", async () => {
      logStep("TC 10", 3, "Nhập First Name, thiếu Last/Zip");
      await checkoutStepOnePage.firstNameField().fill("Jane");
      await checkoutStepOnePage.continue();
      await expect(checkoutStepOnePage.errorMessage()).toBeVisible();
    });

    await test.step("4) Nhập First + Last, thiếu Zip", async () => {
      logStep("TC 10", 4, "Nhập First/Last, thiếu Zip");
      await checkoutStepOnePage.lastNameField().fill("Smith");
      await checkoutStepOnePage.continue();
      await expect(checkoutStepOnePage.errorMessage()).toBeVisible();
    });

    await test.step("5) Nhập đủ First, Last, Zip", async () => {
      logStep("TC 10", 5, "Điền đủ thông tin");
      await checkoutStepOnePage.postalCodeField().fill("90210");
      await checkoutStepOnePage.continue();
      await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    });
  });

  test.fail("TC 11 — Checkout khi giỏ hàng trống", async ({ page }, testInfo) => {
    annotateKnownBug(testInfo, "App cho checkout khi giỏ hàng trống — không chặn như expected");
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await test.step("1) Đăng nhập standard_user", async () => {
      logStep("TC 11", 1, "Đăng nhập");
      await loginStandard(page);
    });

    await test.step("2) Kiểm tra giỏ hàng trống", async () => {
      logStep("TC 11", 2, "Badge = 0");
      await expect(inventoryPage.cartBadge()).toHaveCount(0);
    });

    await test.step("3) Mở giỏ và click Checkout", async () => {
      logStep("TC 11", 3, "Checkout giỏ trống");
      await inventoryPage.openCart();
      await expect(page).toHaveURL(/\/cart\.html$/);
      await cartPage.checkout();
    });

    await test.step("4) Kiểm tra vẫn ở trang cart", async () => {
      logStep("TC 11", 4, "Kỳ vọng chặn checkout — vẫn /cart.html");
      await expect(page).toHaveURL(/\/cart\.html$/, { timeout: 2000 });
    });
  });

  test("TC 12 — Sắp xếp sản phẩm theo giá", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await test.step("1) Đăng nhập standard_user", async () => {
      logStep("TC 12", 1, "Đăng nhập");
      await loginStandard(page);
      await expect(page).toHaveURL(/\/inventory\.html$/);
    });

    await test.step("2) Chọn sort Price (low to high)", async () => {
      logStep("TC 12", 2, "Sort lohi");
      await expect(inventoryPage.sortDropdown()).toBeVisible();
      await inventoryPage.sortByPriceLowToHigh();
    });

    await test.step("3) Đọc danh sách giá", async () => {
      logStep("TC 12", 3, "Lấy giá sản phẩm");
      const prices = await inventoryPage.getPrices();
      const sorted = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sorted);
    });
  });
});
