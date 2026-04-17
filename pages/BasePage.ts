import type { Page } from "@playwright/test";

export class BasePage {
  constructor(protected readonly page: Page) {}

  protected async goto(urlPath: string): Promise<void> {
    await this.page.goto(urlPath);
  }
}
