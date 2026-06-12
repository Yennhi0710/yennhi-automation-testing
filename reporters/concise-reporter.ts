import type {
  FullResult,
  Reporter,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";

const useColor =
  process.env.NO_COLOR === undefined &&
  process.env.FORCE_COLOR !== "0" &&
  (process.stdout.isTTY || (process.env.FORCE_COLOR !== undefined && process.env.FORCE_COLOR !== "0"));

const paint = (code: string, text: string): string =>
  useColor ? `\x1b[${code}m${text}\x1b[0m` : text;

const green = (text: string): string => paint("32", text);
const red = (text: string): string => paint("31", text);
const yellow = (text: string): string => paint("33", text);
const dim = (text: string): string => paint("2", text);
const bold = (text: string): string => paint("1", text);

class ConciseReporter implements Reporter {
  private passed = 0;
  private failed: string[] = [];
  private knownBugs: string[] = [];
  private skipped = 0;

  onTestEnd(test: TestCase, result: TestResult): void {
    const title = test.title;
    const isExpectedFail = test.expectedStatus === "failed" && result.status === "failed";

    if (isExpectedFail) {
      this.knownBugs.push(title);
      process.stdout.write(`  ${yellow("⚠")}  ${dim(`${title} (known bug)`)}\n`);
    } else if (result.status === "passed") {
      this.passed++;
      process.stdout.write(`  ${green("✓")}  ${title}\n`);
    } else if (result.status === "skipped") {
      this.skipped++;
      process.stdout.write(`  ${yellow("-")}  ${dim(`${title} (skipped)`)}\n`);
    } else {
      this.failed.push(title);
      process.stdout.write(`  ${red("✘")}  ${title}\n`);
    }
  }

  onEnd(_result: FullResult): void {
    process.stdout.write("\n");
    const parts = [green(`${this.passed} passed`)];
    if (this.knownBugs.length > 0) {
      parts.push(yellow(`${this.knownBugs.length} known bug`));
    }
    if (this.failed.length > 0) parts.push(red(`${this.failed.length} failed`));
    if (this.skipped > 0) parts.push(yellow(`${this.skipped} skipped`));
    process.stdout.write(`${bold("Total:")} ${parts.join(", ")}\n`);

    if (this.failed.length > 0) {
      process.stdout.write(`\n${bold("Failed tests:")}\n`);
      for (const name of this.failed) {
        process.stdout.write(`  ${red("✘")} ${name}\n`);
      }
      process.stdout.write(
        dim("\nMở HTML report để xem chi tiết: npx playwright show-report\n"),
      );
    }
  }
}

export default ConciseReporter;
