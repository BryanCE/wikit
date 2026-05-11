import type { Command } from "commander";
import { listPages } from "@/commands/listPages";
import { deletePages } from "@/commands/deletePages";
import {
  exportPagesCommand,
  movePageCommand,
  convertPageCommand,
  renderPageCommand,
  migrateLocaleCommand,
  rebuildTreeCommand,
} from "@/commands/pages";
import { trackForCli } from "@/commands/pages/track";
import { retrackForCli } from "@/commands/pages/retrack";
import { untrackForCli } from "@/commands/pages/untrack";
import { listTrackedForCli } from "@/commands/pages/listTracked";
import { checkForCli } from "@/commands/pages/check";
import { pullForCli } from "@/commands/pages/pull";
import { commitForCli } from "@/commands/pages/commit";
import { pushForCli } from "@/commands/pages/push";
import { syncAllForCli } from "@/commands/pages/syncAll";
import type { ListOptions, DeleteOptions } from "@/types";

export function register(program: Command) {
  const pagesCommand = program
    .command("pages")
    .description("Page operations");

  pagesCommand
    .command("list")
    .description("List pages under a prefix")
    .argument("[prefix]", "Path prefix (e.g. /en/tls) - optional if using --search")
    .option("-l, --limit <number>", "Limit number of results (0 = all)", "0")
    .option("--all", "Show all pages if no matches found")
    .option(
      "-r, --recursive",
      "Include nested pages (default: only direct children)"
    )
    .option("-s, --search <query>", "Search pages by title or path")
    .action(async (prefix: string | undefined, options: ListOptions & { search?: string }) => {
      await listPages(prefix ?? "", {
        limit: parseInt(options.limit),
        showAll: Boolean(options.all),
        recursive: Boolean(options.recursive),
        search: options.search,
      });
    });

  pagesCommand
    .command("delete")
    .description("Delete pages under a prefix")
    .argument("<prefix>", "Path prefix (e.g. /en/tls)")
    .option("-f, --force", "Skip confirm prompt")
    .action(async (prefix: string, options: DeleteOptions) => {
      await deletePages(prefix, options);
    });

  pagesCommand
    .command("move")
    .description("Move page to different path/locale")
    .argument("<id>", "Page ID")
    .argument("<destination>", "Destination path")
    .option("-l, --locale <locale>", "Destination locale", "en")
    .action(async (id: string, destination: string, options: { locale?: string }) => {
      await movePageCommand(parseInt(id), destination, {
        locale: options.locale,
      });
    });

  pagesCommand
    .command("convert")
    .description("Convert page to different editor")
    .argument("<id>", "Page ID")
    .argument("<editor>", "Editor type (markdown, wysiwyg, etc.)")
    .action(async (id: string, editor: string) => {
      await convertPageCommand(parseInt(id), editor);
    });

  pagesCommand
    .command("render")
    .description("Force re-render of page")
    .argument("<id>", "Page ID")
    .action(async (id: string) => {
      await renderPageCommand(parseInt(id));
    });

  pagesCommand
    .command("migrate-locale")
    .description("Bulk migrate pages between locales")
    .argument("<source>", "Source locale")
    .argument("<target>", "Target locale")
    .action(async (source: string, target: string) => {
      await migrateLocaleCommand(source, target);
    });

  pagesCommand
    .command("rebuild-tree")
    .description("Rebuild navigation tree")
    .action(async () => {
      await rebuildTreeCommand();
    });

  pagesCommand
    .command("export")
    .description("Export all pages to JSON file")
    .argument("<file>", "Output file path")
    .option("--with-content", "Include page content in export (increases file size)")
    .action(async (file: string, options: { withContent?: boolean }) => {
      await exportPagesCommand(file, {
        includeContent: options.withContent,
      });
    });

  pagesCommand
    .command("track")
    .description("Track a wiki page against a local file")
    .argument("<wikiPath>", "Wiki page path (e.g. altering-payments)")
    .argument("[localFile]", "Local file relative to repo root")
    .option("-l, --locale <locale>", "Page locale", "en")
    .option("-y, --yes", "Skip seed prompt; auto-confirm")
    .action(async (wikiPath: string, localFile: string | undefined, options: { locale?: string; yes?: boolean }) => {
      await trackForCli(wikiPath, localFile, {
        locale: options.locale,
        yes: options.yes,
      });
    });

  pagesCommand
    .command("retrack")
    .description("Rebind tracked wiki page to a different local file")
    .argument("<wikiPath>", "Wiki page path")
    .argument("<newLocalFile>", "New local file path relative to repo root")
    .option("-l, --locale <locale>", "Page locale", "en")
    .action(async (wikiPath: string, newLocalFile: string, options: { locale?: string }) => {
      await retrackForCli(wikiPath, newLocalFile, { locale: options.locale });
    });

  pagesCommand
    .command("untrack")
    .description("Remove a wiki page from tracking (local file untouched)")
    .argument("<wikiPath>", "Wiki page path")
    .option("-l, --locale <locale>", "Page locale", "en")
    .action(async (wikiPath: string, options: { locale?: string }) => {
      await untrackForCli(wikiPath, { locale: options.locale });
    });

  pagesCommand
    .command("tracked")
    .description("List tracked pages with sync status")
    .action(async () => {
      await listTrackedForCli({});
    });

  pagesCommand
    .command("check")
    .description("Scan tracked pages for drift (read-only)")
    .option("--details", "Print unified diff for drifted pages")
    .option("--json", "Emit machine-readable JSON")
    .action(async (options: { details?: boolean; json?: boolean }) => {
      await checkForCli({ details: options.details, json: options.json });
    });

  pagesCommand
    .command("pull")
    .description("Pull drifted live pages into local files")
    .argument("[wikiPaths...]", "Wiki paths to pull (omit with --all)")
    .option("-l, --locale <locale>", "Page locale", "en")
    .option("--dry-run", "Print diff without writing")
    .option("--force", "Overwrite local WIP changes")
    .option("--all", "Pull every tracked page")
    .action(async (wikiPaths: string[], options: { locale?: string; dryRun?: boolean; force?: boolean; all?: boolean }) => {
      await pullForCli(wikiPaths, {
        locale: options.locale,
        dryRun: options.dryRun,
        force: options.force,
        all: options.all,
      });
    });

  pagesCommand
    .command("commit")
    .description("Commit staged drift changes")
    .option("-m, --message <msg>", "Commit message (skips auto-message)")
    .action(async (options: { message?: string }) => {
      await commitForCli({ message: options.message });
    });

  pagesCommand
    .command("push")
    .description("Push tracked changes to remote (per configured auth mode)")
    .action(async () => {
      await pushForCli();
    });

  pagesCommand
    .command("sync-all")
    .description("Catch up all tracked pages: check → pull → commit → push")
    .option("-y, --yes", "Skip confirm prompt")
    .option("--dry-run", "Print diffs without writing")
    .option("--skip-push", "Stop before pushing to remote")
    .action(async (options: { yes?: boolean; dryRun?: boolean; skipPush?: boolean }) => {
      await syncAllForCli({
        yes: options.yes,
        dryRun: options.dryRun,
        skipPush: options.skipPush,
      });
    });
}
