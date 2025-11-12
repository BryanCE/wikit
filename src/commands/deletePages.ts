import { deletePage, getAllPages } from "@/api/pages";

export async function deletePages(
  pathPrefix: string,
  options: { force?: boolean }
) {
  console.log(`🔍 Fetching pages under '${pathPrefix}'...`);

  const allPages = await getAllPages();
  const matches = allPages.filter((p) => p.path.startsWith(pathPrefix));

  if (!matches.length) {
    console.log(`⚠️ No matching pages.`);
    return;
  }

  console.log(`👉 Will delete ${matches.length} page(s):`);
  matches.forEach((p) => console.log(`${p.id}: ${p.path} (${p.title})`));

  if (!options.force) {
    process.stdout.write("⚠️ Type 'yes' to confirm: ");
    process.stdin.setRawMode(false);
    const input = await new Promise<string>((resolve) => {
      const handler = (data: Buffer) => {
        process.stdin.off("data", handler);
        resolve(data.toString().trim());
      };
      process.stdin.once("data", handler);
    });
    if (input.toLowerCase() !== "yes") {
      console.log("❌ Aborted");
      return;
    }
  }

  let deletedCount = 0;
  const errors: string[] = [];

  for (const page of matches) {
    try {
      const result = await deletePage(page.id);

      if (result.succeeded) {
        console.log(`✔ Deleted ${page.path}`);
        deletedCount++;
      } else {
        const errorMsg = result.message ?? `Error code: ${result.errorCode}`;
        console.error(`❌ Failed ${page.path}: ${errorMsg}`);
        errors.push(`Failed to delete ${page.path}: ${errorMsg}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed ${page.path}: ${errorMsg}`);
      errors.push(`Failed to delete ${page.path}: ${errorMsg}`);
    }
  }

  if (errors.length === 0) {
    console.log(
      `✅ Successfully deleted ${deletedCount}/${matches.length} pages`
    );
  } else {
    console.log(
      `⚠️ Deleted ${deletedCount}/${matches.length} pages with ${errors.length} errors`
    );
  }
}
