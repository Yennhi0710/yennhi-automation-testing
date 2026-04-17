import { defineConfig, devices } from "@playwright/test";

const headless = Boolean(process.env.CI);

function slowMoMs(): number | undefined {
  if (process.env.CI) return 0;
  if (process.env.SLOW_MO !== undefined) {
    const n = Number(process.env.SLOW_MO);
    return Number.isFinite(n) ? n : undefined;
  }
  return 800;
}

const slowMo = slowMoMs();

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    headless,
    ...(slowMo ? { launchOptions: { slowMo } } : {}),
    testIdAttribute: "data-test",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "chromium-saucedemo",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "https://www.saucedemo.com",
        headless,
        viewport: { width: 1600, height: 900 },
      },
      testMatch: "**/saucedemo.smoke.spec.ts",
    },
    {
      name: "chromium-the-internet",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "https://the-internet.herokuapp.com",
        headless,
        viewport: { width: 1600, height: 900 },
      },
      testMatch: "**/the-internet.smoke.spec.ts",
    },
  ],
});
