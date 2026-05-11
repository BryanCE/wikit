import { createPatch } from "diff";
import chalk from "chalk";

export function hasDifferences(oldStr: string, newStr: string): boolean {
  return oldStr !== newStr;
}

export function renderUnifiedDiff(
  oldStr: string,
  newStr: string,
  fileLabel: string
): string {
  const patch = createPatch(fileLabel, oldStr, newStr, "live", "local", {
    context: 3,
  });
  return patch
    .split("\n")
    .map((line: string) => colorLine(line))
    .join("\n");
}

function colorLine(line: string): string {
  if (line.startsWith("+++") || line.startsWith("---")) {
    return chalk.bold(line);
  }
  if (line.startsWith("@@")) {
    return chalk.cyan(line);
  }
  if (line.startsWith("+")) {
    return chalk.green(line);
  }
  if (line.startsWith("-")) {
    return chalk.red(line);
  }
  return line;
}

export function summarizeDiff(
  oldStr: string,
  newStr: string
): { added: number; removed: number } {
  if (!hasDifferences(oldStr, newStr)) return { added: 0, removed: 0 };
  const patch = createPatch("x", oldStr, newStr, "", "", { context: 0 });
  let added = 0;
  let removed = 0;
  for (const line of patch.split("\n")) {
    if (line.startsWith("+++") || line.startsWith("---")) continue;
    if (line.startsWith("+")) added++;
    else if (line.startsWith("-")) removed++;
  }
  return { added, removed };
}
