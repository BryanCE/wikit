import { getAllPages } from "@/api/pages";
import { type Page } from "@/types";

interface ListOptions {
  limit?: number;
  showAll?: boolean;
  recursive?: boolean;
  search?: string;
}

function filterPages(allPages: Page[], pathPrefix: string, recursive = false): Page[] {
  let results: Page[];

  if (pathPrefix === "/") {
    // Root level - show only pages without slashes (unless recursive)
    results = recursive
      ? allPages
      : allPages.filter((p) => !p.path.includes("/"));
  } else {
    // Specific prefix
    const matchingPages = allPages.filter((p) => p.path.startsWith(pathPrefix));

    if (!recursive) {
      // Only direct children - filter out deeper nested paths
      const prefixDepth = pathPrefix.split("/").length;
      results = matchingPages.filter((p) => {
        const pathDepth = p.path.split("/").length;
        return pathDepth === prefixDepth + 1 || pathDepth === prefixDepth;
      });
    } else {
      results = matchingPages;
    }
  }

  return results;
}

export async function listPages(pathPrefix: string, options: ListOptions = {}) {
  console.log(`Querying Wiki.js pages...`);

  const allPages = await getAllPages();

  // If search is provided, filter by search query
  let results: Page[];
  if (options.search) {
    const query = options.search.toLowerCase();
    results = allPages.filter((p) =>
      p.title.toLowerCase().includes(query) ||
      p.path.toLowerCase().includes(query)
    );

    // Apply limit to results
    const limitedResults = options.limit && options.limit > 0
      ? results.slice(0, options.limit)
      : results;

    if (!results.length) {
      console.log(`No pages found matching search: "${options.search}"`);
      return;
    }

    console.log(`Found ${results.length} page(s) matching "${options.search}"${options.limit ? ` (showing first ${options.limit})` : ''}:`);
    limitedResults.forEach((p) =>
      console.log(`${p.id} | ${p.path} | ${p.title} [${p.locale}]`)
    );
    return;
  }

  // Otherwise use prefix filtering
  results = filterPages(allPages, pathPrefix, options.recursive);

  // Apply limit to results
  const limitedResults = options.limit && options.limit > 0
    ? results.slice(0, options.limit)
    : results;

  if (!results.length) {
    console.log(`No pages found under '${pathPrefix}'`);

    if (options.showAll) {
      const displayPages = options.limit && options.limit > 0
        ? allPages.slice(0, options.limit)
        : allPages;

      console.log(`All ${allPages.length} pages${options.limit ? ` (showing first ${options.limit})` : ''}:`);
      displayPages.forEach((p) =>
        console.log(`${p.id} | ${p.path} | ${p.title} [${p.locale}]`)
      );
    }
    return;
  }

  console.log(`Found ${results.length} page(s)${options.limit ? ` (showing first ${options.limit})` : ''}:`);
  limitedResults.forEach((p) =>
    console.log(`${p.id} | ${p.path} | ${p.title} [${p.locale}]`)
  );
}

export async function getPages(pathPrefix = "", options: ListOptions & { silent?: boolean } = {}): Promise<Page[]> {
  const allPages = await getAllPages();
  const results = filterPages(allPages, pathPrefix, options.recursive);

  return options.limit && options.limit > 0 ? results.slice(0, options.limit) : results;
}
