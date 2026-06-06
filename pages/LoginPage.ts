import type { Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  usernameField(): Locator {
    return this.page.getByTestId("username");
  }

  passwordField(): Locator {
    return this.page.getByTestId("password");
  }

  loginButton(): Locator {
    return this.page.getByTestId("login-button");
  }

  errorButton(): Locator {
    return this.page.locator(".error-button");
  }

  errorMessageContainer(): Locator {
    return this.page.locator(".error-message-container");
  }

  async open(): Promise<void> {
    await this.goto("/");
  }

  async fillUsername(username: string): Promise<void> {
    await this.usernameField().fill(username);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordField().fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton().click();
  }

  async dismissError(): Promise<void> {
    await this.errorButton().click();
  }

  async loginAs(username: string, password: string): Promise<void> {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLogin();
  }
}
