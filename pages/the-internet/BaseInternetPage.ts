import { BasePage } from "../BasePage";

export class BaseInternetPage extends BasePage {
  protected async openPath(path: string): Promise<void> {
    await this.goto(path);
  }
}
