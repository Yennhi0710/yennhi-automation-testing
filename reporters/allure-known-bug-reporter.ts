import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { FullResult, Reporter, TestCase, TestResult } from "@playwright/test/reporter";

const ALLURE_RESULTS_DIR = path.join(process.cwd(), "allure-results");
const PLAYWRIGHT_REPORT_DIR = path.join(process.cwd(), "playwright-report");
const PLAYWRIGHT_INDEX_HTML = path.join(PLAYWRIGHT_REPORT_DIR, "index.html");
const PLAYWRIGHT_ZIP_MARKER =
  '<template id="playwrightReportBase64">data:application/zip;base64,';
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

interface HtmlStats {
  total: number;
  expected: number;
  skipped: number;
  unexpected: number;
  flaky: number;
  ok: boolean;
}

interface HtmlTestEntry {
  title: string;
  outcome: string;
  ok: boolean;
}

interface HtmlTestFile {
  tests: HtmlTestEntry[];
}

interface HtmlFileSummary {
  stats: HtmlStats;
  tests: HtmlTestEntry[];
}

interface HtmlReport {
  files: HtmlFileSummary[];
  stats: HtmlStats;
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
    if (this.knownBugs.length === 0) {
      return;
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const allureDone =
        !fs.existsSync(ALLURE_RESULTS_DIR) || this.patchAllureResults();
      const htmlDone = await this.patchPlaywrightHtmlReport();
      if (allureDone && htmlDone) {
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

  private async patchPlaywrightHtmlReport(): Promise<boolean> {
    if (!fs.existsSync(PLAYWRIGHT_INDEX_HTML)) {
      return true;
    }

    const html = fs.readFileSync(PLAYWRIGHT_INDEX_HTML, "utf-8");
    const zipStart = html.indexOf(PLAYWRIGHT_ZIP_MARKER);
    if (zipStart === -1) {
      return true;
    }

    const base64Start = zipStart + PLAYWRIGHT_ZIP_MARKER.length;
    const base64End = html.indexOf("</template>", base64Start);
    if (base64End === -1) {
      return false;
    }

    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "pw-report-"));
    const zipPath = path.join(tempRoot, "report.zip");
    const extractDir = path.join(tempRoot, "data");

    try {
      const zipBuffer = Buffer.from(html.slice(base64Start, base64End), "base64");
      fs.writeFileSync(zipPath, zipBuffer);
      fs.mkdirSync(extractDir, { recursive: true });

      const zipBundle = require("playwright-core/lib/zipBundle") as {
        extract: (zip: string, opts: { dir: string }) => Promise<void>;
        yazl: { ZipFile: new () => {
          addFile: (file: string, name: string) => void;
          end: (cb?: () => void) => void;
          outputStream: NodeJS.ReadableStream;
        } };
      };

      await zipBundle.extract(zipPath, { dir: extractDir });

      let patched = 0;
      for (const bugRun of this.knownBugs) {
        if (this.patchKnownBugInHtmlDir(extractDir, bugRun.title)) {
          patched++;
        }
      }

      if (patched !== this.knownBugs.length) {
        return false;
      }

      const zipFile = new zipBundle.yazl.ZipFile();
      for (const file of fs.readdirSync(extractDir)) {
        zipFile.addFile(path.join(extractDir, file), file);
      }

      const newBase64 = await new Promise<string>((resolve, reject) => {
        const chunks: Buffer[] = [];
        zipFile.outputStream.on("data", (chunk: Buffer) => chunks.push(chunk));
        zipFile.outputStream.on("error", reject);
        zipFile.outputStream.on("end", () => {
          resolve(Buffer.concat(chunks).toString("base64"));
        });
        zipFile.end();
      });

      const newHtml = html.slice(0, base64Start) + newBase64 + html.slice(base64End);
      fs.writeFileSync(PLAYWRIGHT_INDEX_HTML, newHtml, "utf-8");
      return true;
    } catch {
      return false;
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  }

  private patchKnownBugInHtmlDir(dir: string, title: string): boolean {
    let found = false;

    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".json")) {
        continue;
      }

      const filePath = path.join(dir, file);
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8")) as
        | HtmlReport
        | HtmlTestFile;

      if (file === "report.json") {
        const report = data as HtmlReport;
        for (const fileSummary of report.files) {
          if (this.patchTestsInSummary(fileSummary, title)) {
            found = true;
          }
        }
        report.stats = this.sumStats(report.files.map((f) => f.stats));
        fs.writeFileSync(filePath, JSON.stringify(report), "utf-8");
        continue;
      }

      const testFile = data as HtmlTestFile;
      if (!Array.isArray(testFile.tests)) {
        continue;
      }

      if (this.patchTestsInList(testFile.tests, title)) {
        found = true;
        fs.writeFileSync(filePath, JSON.stringify(testFile), "utf-8");
      }
    }

    return found;
  }

  private patchTestsInSummary(summary: HtmlFileSummary, title: string): boolean {
    return this.patchTestsInList(summary.tests, title, summary.stats);
  }

  private patchTestsInList(
    tests: HtmlTestEntry[],
    title: string,
    stats?: HtmlStats,
  ): boolean {
    let changed = false;

    for (const test of tests) {
      if (test.title !== title || test.outcome !== "expected") {
        continue;
      }

      test.outcome = "unexpected";
      test.ok = false;
      changed = true;
    }

    if (changed && stats) {
      stats.expected = Math.max(0, stats.expected - 1);
      stats.unexpected += 1;
      stats.ok = stats.unexpected + stats.flaky === 0;
    }

    return changed;
  }

  private sumStats(statsList: HtmlStats[]): HtmlStats {
    const total: HtmlStats = {
      total: 0,
      expected: 0,
      skipped: 0,
      unexpected: 0,
      flaky: 0,
      ok: true,
    };

    for (const stats of statsList) {
      total.total += stats.total;
      total.expected += stats.expected;
      total.skipped += stats.skipped;
      total.unexpected += stats.unexpected;
      total.flaky += stats.flaky;
      total.ok = total.ok && stats.ok;
    }

    return total;
  }
}

export default AllureKnownBugReporter;
