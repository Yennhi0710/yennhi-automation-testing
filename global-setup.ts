import fs from "node:fs";
import path from "node:path";

export default async function globalSetup(): Promise<void> {
  fs.rmSync(path.join(process.cwd(), "allure-results"), { recursive: true, force: true });
}
