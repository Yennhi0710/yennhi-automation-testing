import type { TestInfo } from "@playwright/test";

export function annotateKnownBug(testInfo: TestInfo, description: string): void {
  testInfo.annotations.push({ type: "known_bug", description });
}
