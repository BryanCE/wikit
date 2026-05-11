# Drift Tracking

Pull live Wiki.js page edits into a local git repo so the repo stays current with what non-technical users have changed in the wiki UI.

Direction is **live → local only**. The wiki is source of truth for content; git is the audit trail. Nothing is ever written back to the wiki by this feature.

## Concept

- **Manifest.** Tracking lives in `<repoPath>/.wikit/tracking.json`, versioned alongside the files it describes. Each entry binds one wiki page to one local file.
- **One-to-one binding.** Each `(wikiPath, locale)` maps to exactly one local file. Re-bind with `retrack`; you do not edit JSON by hand for routine flows.
- **Drift signal.** Each manifest entry stores `lastSyncedHash`. `check` re-fetches the live hash and compares — cheap, no content read on the unchanged majority.
- **Auth modes.** `gh` (uses the GitHub CLI as a credential helper), `pat` (encrypted personal access token, injected at push time), or `manual` (wikit does diff/pull/commit; you run `git push` yourself).

## Setup

Run the TUI on first launch — the setup wizard adds a git step after instance configuration:

```bash
wikit tui
```

Wizard steps relevant to drift tracking:

1. **Git integration?** Yes / Skip. Skip is fine — you can rerun the wizard later.
2. **Repo mode.** Pick one:
   - **Existing repo** — point at an already-cloned `WikiFiles` checkout.
   - **Clone** — give a GitHub URL; wikit shells out to `git clone`.
   - **Init** — create a new empty repo at the given path.
3. **Auth mode.**
   - **gh** — wikit runs `gh auth status` to verify. If you are not logged in, exit the wizard and run `gh auth login`, then resume.
   - **pat** — paste a GitHub personal access token. Validated against `GET https://api.github.com/user`, then stored AES-GCM encrypted in `~/.config/wikit/config.json`. At push time wikit builds `https://<token>@github.com/...` on the fly — your stored remote URL is never rewritten.
   - **manual** — wikit will print the push command instead of running it.
4. **Branch + remote.** Autodetected from the repo. Override if needed.

Re-run the wizard any time to change auth mode or repo path.

## Daily workflow

The short version:

```bash
wikit pages check       # see what's drifted on the wiki side
wikit pages sync-all    # pull drift, commit, push — interactive confirmation
```

`check` is read-only and safe to run anywhere. `sync-all` chains `check → confirm → pull → commit → push`. Add `-y` to skip the confirmation when scripting; add `--dry-run` to preview without writing.

Per-step breakdown if you want finer control:

```bash
wikit pages check                       # list drift, exit 1 if any
wikit pages pull altering-payments      # overwrite local file, stage it
wikit pages pull --all                  # pull every drifted page
wikit pages commit -m "wiki sync"       # commit staged files
wikit pages push                        # push per configured auth mode
```

## Adding a tracked page

### CLI

```bash
wikit pages track <wikiPath> [localFile] [--locale en]
```

- Adds a manifest entry and seeds `lastSyncedHash` from the live page.
- If `localFile` is omitted, wikit prompts; if it does not exist on disk, wikit offers to seed it with the current live content and stage it.

Example:

```bash
wikit pages track altering-payments AlteringPayments/page.html
```

### TUI

1. Launch `wikit tui`.
2. Type `tracked` and press Enter to open the tracked-pages screen.
3. Press `p` (pick) — wikit opens a live-page browser.
4. Pick a wiki page; wikit opens the file browser scoped to the configured repo.
5. Pick the local file to bind. Manifest is written; entry appears in the tracked list.

## Switching which local file is the live one

Use `retrack` when an ad-hoc folder layout means the "live" file moved (e.g. `OldPage/page.html` → `OldPage/v2/page.html`):

```bash
wikit pages retrack past-due PastDue/v2/page.html
```

Manifest only — the old file is left on disk untouched. `lastSyncedHash` is re-seeded from live. Refuses if the new local file is already bound to a different wiki page.

To stop tracking entirely:

```bash
wikit pages untrack altering-payments
```

The local file is not deleted.

## Troubleshooting

| Message | Cause | Fix |
|---|---|---|
| `local-missing` (from `check` / `tracked`) | Manifest entry exists but the local file is gone | `wikit pages pull <wikiPath>` to recreate it from live, or `wikit pages untrack <wikiPath>` to drop the entry |
| `live-missing` (from `check` / `tracked`) | Wiki page was deleted or renamed | `wikit pages untrack <wikiPath>`, or `wikit pages track <newPath> <sameLocalFile>` after the rename |
| `pull` refused — unstaged WIP on target | The local file has uncommitted edits | Stash/commit your work, then retry. Or pass `--force` if you intend to overwrite it. |
| `PAT not set` / `PAT invalid` at push | Auth mode is `pat` but the token is missing or rejected by GitHub | Re-run the wizard's auth step, or switch auth mode to `gh` / `manual` |
| `not a git repository` at any command | `git.repoPath` in config points somewhere that is not a git repo | Re-run the wizard; or `cd` to the path and run `git init` / `git clone` yourself, then retry |
| `tracking.json` missing | No pages tracked yet on this checkout | Normal. `check` is a 0-exit no-op; `track` will create the file on first use |

Enable git debug logging by setting `WIKIT_DEBUG=1` — every shelled-out `git` / `gh` invocation is logged.

## What is NOT supported

- **Write-back to the wiki.** This feature is one-way (live → local). Edits made to local files are never pushed to Wiki.js by wikit.
- **Multi-file bundles per wiki path.** One wiki page maps to exactly one local file. If you keep `page.html` + `script.html` + `css.css` as a set, only one of them can be the tracked file. The others ride along as untracked siblings in the same folder.
- **`git push --force`, `git reset --hard`, `git stash`.** Wikit will never run these. If you need them, run them yourself.
