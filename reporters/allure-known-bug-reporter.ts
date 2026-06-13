import * as fs from "node:fs";
import * as path from "node:path";
import type { FullResult, Reporter, TestCase, TestResult } from "@playwright/test/reporter";

const ALLURE_RESULTS_DIR = path.join(process.cwd(), "allure-results");
const KNOWN_BUG_LABEL = "known_bug";
const KNOWN_BUG_TAG = "Known Bug";

interface KnownBugRun {
  title: string;
  description: string;
}

interface AllureResultFile {
  uuid: string;
  name: string;
  status: string;
  start?: number;
  statusDetails?: { message?: string; trace?: string };
  labels?: Array<{ name: string; value: string }>;
}

class AllureKnownBugReporter implements Reporter {
  private readonly knownBugs: KnownBugRun[] = [];

  onTestEnd(test: TestCase, result: TestResult): void {
    if (test.expectedStatus !== "failed" || result.status !== "failed") {
      return;
    }

    const bugAnnotation = [...test.annotations, ...result.annotations].find(
      (a) => a.type === "known_bug",
    );

    this.knownBugs.push({
      title: test.title,
      description:
        bugAnnotation?.description ??
        "Bug đã ghi nhận — test fail đúng kỳ vọng (test.fail)",
    });
  }

  async onEnd(_result: FullResult): Promise<void> {
    if (this.knownBugs.length === 0 || !fs.existsSync(ALLURE_RESULTS_DIR)) {
      return;
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      if (this.patchAllureResults()) {
        break;
      }
    }
  }

  private patchAllureResults(): boolean {
    const files = fs
      .readdirSync(ALLURE_RESULTS_DIR)
      .filter((f) => f.endsWith("-result.json"));

    let patched = 0;

    for (const bugRun of this.knownBugs) {
      const candidates: Array<{ filePath: string; data: AllureResultFile }> = [];

      for (const file of files) {
        const filePath = path.join(ALLURE_RESULTS_DIR, file);
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8")) as AllureResultFile;

        if (data.name !== bugRun.title) {
          continue;
        }
        if (data.status !== "passed" && data.status !== "failed") {
          continue;
        }
        if (data.labels?.some((l) => l.name === KNOWN_BUG_LABEL)) {
          continue;
        }

        candidates.push({ filePath, data });
      }

      if (candidates.length === 0) {
        continue;
      }

      candidates.sort((a, b) => (b.data.start ?? 0) - (a.data.start ?? 0));
      const { filePath, data } = candidates[0];
      const errorDetail = data.statusDetails?.message ?? "";

      data.status = "failed";
      data.labels = data.labels ?? [];
      data.labels.push({ name: KNOWN_BUG_LABEL, value: "true" });
      data.labels.push({ name: "tag", value: KNOWN_BUG_TAG });

      data.statusDetails = {
        ...data.statusDetails,
        message: `[${KNOWN_BUG_TAG}] ${bugRun.description}${errorDetail ? `\n\n--- Chi tiết assert ---\n${errorDetail}` : ""}`,
      };

      fs.writeFileSync(filePath, JSON.stringify(data), "utf-8");
      patched++;
    }

    return patched === this.knownBugs.length;
  }
}

export default AllureKnownBugReporter;
