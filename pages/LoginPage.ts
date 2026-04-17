import type { Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  usernameField(): Locator {
    return this.page.getByTestId("username");
  }

  private passwordField(): Locator {
    return this.page.getByTestId("password");
  }

  private loginButton(): Locator {
    return this.page.getByTestId("login-button");
  }

  errorMessageContainer(): Locator {
    return this.page.locator(".error-message-container");
  }

  async open(): Promise<void> {
    await this.goto("/");
  }

  async loginAs(username: string, password: string): Promise<void> {
    await this.usernameField().fill(username);
    await this.passwordField().fill(password);
    await this.loginButton().click();
  }
}
