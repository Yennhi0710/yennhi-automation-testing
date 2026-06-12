import * as fs from "node:fs";
import * as path from "node:path";
import type { FullResult, Reporter, TestCase, TestResult } from "@playwright/test/reporter";

const ALLURE_RESULTS_DIR = path.join(process.cwd(), "allure-results");
const KNOWN_BUG_LABEL = "known_bug";
const KNOWN_BUG_TAG = "Known Bug";

interface KnownBugRun {
  title: string;
  description: string;
  startTime: number;
}

interface AllureResultFile {
  uuid: string;
  name: string;
  status: string;
  start?: number;
  statusDetails?: { message?: string; trace?: string };
  labels?: Array<{ name: string; value: string }>;
}

/**
 * Playwright test.fail() + allure-playwright maps expected failures to status "passed".
 * Reporter này patch Allure JSON → status "broken" + label known_bug để phân biệt trên report.
 * CI vẫn xanh vì Playwright exit code không đổi.
 */
class AllureKnownBugReporter implements Reporter {
  private readonly knownBugs: KnownBugRun[] = [];

  onTestEnd(test: TestCase, result: TestResult): void {
    if (test.expectedStatus !== "failed") {
      return;
    }

    const bugAnnotation = [...test.annotations, ...result.annotations].find(
      (a) => a.type === "known_bug",
    );
    const description =
      bugAnnotation?.description ??
      "Bug đã ghi nhận — test fail đúng kỳ vọng (test.fail)";

    if (result.status === "failed") {
      this.knownBugs.push({
        title: test.title,
        description,
        startTime: result.startTime.getTime(),
      });
    }
  }

  async onEnd(_result: FullResult): Promise<void> {
    if (this.knownBugs.length === 0 || !fs.existsSync(ALLURE_RESULTS_DIR)) {
      return;
    }

    // Đợi allure-playwright ghi xong file (onEnd chạy sau reporter trước trong config).
    await new Promise((resolve) => setTimeout(resolve, 100));

    const files = fs.readdirSync(ALLURE_RESULTS_DIR).filter((f) => f.endsWith("-result.json"));

    for (const file of files) {
      const filePath = path.join(ALLURE_RESULTS_DIR, file);
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8")) as AllureResultFile;
      const bugRun = this.knownBugs.find(
        (b) =>
          b.title === data.name &&
          data.start !== undefined &&
          Math.abs(data.start - b.startTime) < 2000,
      );

      if (!bugRun) {
        continue;
      }

      // Chỉ patch lần chạy mới nhất: allure đánh passed khi fail đúng kỳ vọng.
      if (data.status !== "passed" && data.status !== "failed") {
        continue;
      }

      const errorDetail = data.statusDetails?.message ?? "";
      data.status = "broken";
      data.labels = data.labels ?? [];
      if (!data.labels.some((l) => l.name === KNOWN_BUG_LABEL)) {
        data.labels.push({ name: KNOWN_BUG_LABEL, value: "true" });
      }
      if (!data.labels.some((l) => l.name === "tag" && l.value === KNOWN_BUG_TAG)) {
        data.labels.push({ name: "tag", value: KNOWN_BUG_TAG });
      }

      data.statusDetails = {
        ...data.statusDetails,
        message: `[${KNOWN_BUG_TAG}] ${bugRun.description}${errorDetail ? `\n\n--- Chi tiết assert ---\n${errorDetail}` : ""}`,
      };

      fs.writeFileSync(filePath, JSON.stringify(data), "utf-8");
    }
  }
}

export default AllureKnownBugReporter;
