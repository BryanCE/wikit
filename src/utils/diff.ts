import type { DiffResult, InstanceDiffResult, PageComparisonResult } from "@/types";

export function compareObjects<T extends Record<string, unknown>>(
  obj1: T,
  obj2: T,
  category: string,
  _instance1Name = "Instance 1",
  _instance2Name = "Instance 2"
): InstanceDiffResult {
  const differences: DiffResult[] = [];

  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  for (const key of allKeys) {
    const value1 = obj1[key];
    const value2 = obj2[key];
    const isDifferent = !deepEqual(value1, value2);

    differences.push({
      field: key,
      instance1Value: value1,
      instance2Value: value2,
      isDifferent,
    });
  }

  return {
    category,
    differences,
    hasDifferences: differences.some((diff) => diff.isDifferent),
  };
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (a == null || b == null) return a === b;

  if (typeof a !== typeof b) return false;

  if (typeof a === "object") {
    if (Array.isArray(a) !== Array.isArray(b)) return false;

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => deepEqual(item, b[index]));
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    return keysA.every((key) =>
      deepEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key]
      )
    );
  }

  return false;
}

export function formatDifference(
  diff: DiffResult,
  instance1Name: string,
  instance2Name: string
): string {
  if (!diff.isDifferent) {
    return `${diff.field}: ${formatValue(diff.instance1Value)} (same)`;
  }

  return `${diff.field}: ${instance1Name}=${formatValue(
    diff.instance1Value
  )}, ${instance2Name}=${formatValue(diff.instance2Value)}`;
}

export function formatValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "function") return "[Function]";
  if (typeof value === "symbol") return value.toString();
  return `"${value as string}"`;
}

export function printComparison(
  result: InstanceDiffResult,
  instance1Name: string,
  instance2Name: string,
  showAll = false
): void {
  console.log(`\n📋 ${result.category} Comparison:`);

  if (!result.hasDifferences) {
    console.log("✅ All configurations match");
    return;
  }

  const differencesToShow = showAll
    ? result.differences
    : result.differences.filter((diff) => diff.isDifferent);

  differencesToShow.forEach((diff) => {
    const symbol = diff.isDifferent ? "❌" : "✅";
    console.log(
      `${symbol} ${formatDifference(diff, instance1Name, instance2Name)}`
    );
  });
}

export function comparePageLists(
  pages1: string[],
  pages2: string[],
  category = "Pages"
): PageComparisonResult {
  const set1 = new Set(pages1);
  const set2 = new Set(pages2);

  const instance1Only = pages1.filter((page) => !set2.has(page));
  const instance2Only = pages2.filter((page) => !set1.has(page));
  const commonPages = pages1.filter((page) => set2.has(page));

  return {
    category,
    instance1Count: pages1.length,
    instance2Count: pages2.length,
    instance1Only,
    instance2Only,
    commonPages,
    hasDifferences: instance1Only.length > 0 || instance2Only.length > 0,
  };
}

export function printPageComparison(
  result: PageComparisonResult,
  instance1Name: string,
  instance2Name: string,
  showDetails = false
): void {
  console.log(`\n📋 ${result.category}:`);
  console.log(`${instance1Name}: ${result.instance1Count} pages`);
  console.log(`${instance2Name}: ${result.instance2Count} pages`);
  console.log(`Common: ${result.commonPages.length} pages`);

  if (result.instance1Only.length > 0) {
    console.log(
      `❌ Only in ${instance1Name}: ${result.instance1Only.length} pages`
    );
    if (showDetails) {
      result.instance1Only.forEach((page) => console.log(`   - ${page}`));
    }
  }

  if (result.instance2Only.length > 0) {
    console.log(
      `❌ Only in ${instance2Name}: ${result.instance2Only.length} pages`
    );
    if (showDetails) {
      result.instance2Only.forEach((page) => console.log(`   - ${page}`));
    }
  }

  if (!result.hasDifferences) {
    console.log("✅ Page structures match");
  }
}
