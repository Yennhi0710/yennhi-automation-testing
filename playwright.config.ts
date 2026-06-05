import { defineConfig, devices } from "@playwright/test";

const headless = Boolean(process.env.CI);

function slowMoMs(): number | undefined {
  if (process.env.CI) return 0;
  if (process.env.SLOW_MO !== undefined) {
    const n = Number(process.env.SLOW_MO);
    return Number.isFinite(n) ? n : undefined;
  }
  return 1500;
}

const slowMo = slowMoMs();

const viewport = { width: 1400, height: 700 };

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ["./reporters/concise-reporter.ts"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
    ["allure-playwright", { resultsDir: "allure-results" }],
  ],
  timeout: 60_000,
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
        viewport,
      },
      testMatch: "**/saucedemo.smoke.spec.ts",
    },
    {
      name: "chromium-the-internet",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "https://the-internet.herokuapp.com",
        headless,
        viewport,
      },
      testMatch: "**/the-internet.smoke.spec.ts",
    },
  ],
});
