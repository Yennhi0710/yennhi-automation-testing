import * as fs from "node:fs";
import * as path from "node:path";

const FIXTURES_DIR = path.join(__dirname, "..", "tests", "fixtures");

export function getFixturePath(filename: string): string {
  return path.join(FIXTURES_DIR, filename);
}

export function assertFixtureExists(filename: string): string {
  const filePath = getFixturePath(filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Fixture không tồn tại: ${filePath}`);
  }
  return filePath;
}

export function assertFixtureMinSize(filename: string, minBytes: number): string {
  const filePath = assertFixtureExists(filename);
  if (fs.statSync(filePath).size < minBytes) {
    throw new Error(`Fixture ${filename} nhỏ hơn ${minBytes} bytes`);
  }
  return filePath;
}
