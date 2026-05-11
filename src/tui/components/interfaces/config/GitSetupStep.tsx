import React, { useEffect, useState } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import { existsSync } from "fs";
import { mkdir } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useHeaderData } from "@/tui/contexts/HeaderContext";
import { useFooterHelp, useFooterStatus } from "@/tui/contexts/FooterContext";
import { useEscape } from "@/tui/contexts/EscapeContext";
import { COMMON_HELP_PATTERNS, HELP_TEXT, formatHelpText } from "@/tui/constants/keyboard";
import { configManager } from "@/config/configManager";
import {
  addRemote,
  cloneRepo,
  ghAuthStatus,
  ghIsInstalled,
  getCurrentBranch,
  initRepo,
  isGitRepo,
  listRemotes,
} from "@/utils/git";
import type { GitAuthMode, GitConfig } from "@/types/config/configTypes";
import { PatInput } from "./PatInput";

export type GitWizardStep =
  | "git-prompt"
  | "git-repo-mode"
  | "git-repo-existing"
  | "git-repo-clone"
  | "git-repo-init"
  | "git-auth-mode"
  | "git-pat-input"
  | "git-branch-remote"
  | "git-verify";

type RepoMode = "existing" | "clone" | "init";

interface GitSetupStepProps {
  step: GitWizardStep;
  setStep: (next: GitWizardStep) => void;
  onComplete: () => void;
  onSkip: () => void;
}

const AUTH_MODES: GitAuthMode[] = ["gh", "pat", "manual"];

export function GitSetupStep({
  step,
  setStep,
  onComplete,
  onSkip,
}: GitSetupStepProps) {
  const [repoPath, setRepoPath] = useState<string>("");
  const [authMode, setAuthMode] = useState<GitAuthMode>("gh");
  const [branch, setBranch] = useState<string>("main");
  const [remote, setRemote] = useState<string>("origin");
  const [status, setStatus] = useState<string>("");
  useFooterStatus(status);

  switch (step) {
    case "git-prompt":
      return (
        <GitPrompt
          onYes={() => setStep("git-repo-mode")}
          onNo={onSkip}
        />
      );
    case "git-repo-mode":
      return (
        <RepoModeStep
          onPick={(mode) => {
            if (mode === "existing") setStep("git-repo-existing");
            else if (mode === "clone") setStep("git-repo-clone");
            else setStep("git-repo-init");
          }}
          onBack={() => setStep("git-prompt")}
        />
      );
    case "git-repo-existing":
      return (
        <RepoPathStep
          initial={repoPath || defaultRepoPath()}
          onSubmit={(p) => {
            setRepoPath(p);
            setStep("git-auth-mode");
          }}
          onBack={() => setStep("git-repo-mode")}
          onStatus={setStatus}
        />
      );
    case "git-repo-clone":
      return (
        <CloneRepoStep
          defaultTarget={defaultRepoPath()}
          onDone={(p) => {
            setRepoPath(p);
            setStep("git-auth-mode");
          }}
          onBack={() => setStep("git-repo-mode")}
          onStatus={setStatus}
        />
      );
    case "git-repo-init":
      return (
        <InitRepoStep
          defaultTarget={defaultRepoPath()}
          onDone={(p) => {
            setRepoPath(p);
            setStep("git-auth-mode");
          }}
          onBack={() => setStep("git-repo-mode")}
          onStatus={setStatus}
        />
      );
    case "git-auth-mode":
      return (
        <AuthModeStep
          selected={authMode}
          onSelect={async (mode) => {
            setAuthMode(mode);
            if (mode === "gh") {
              await verifyGhAndAdvance(setStatus, () =>
                setStep("git-branch-remote")
              );
            } else if (mode === "pat") {
              setStep("git-pat-input");
            } else {
              setStep("git-branch-remote");
            }
          }}
          onBack={() => setStep("git-repo-mode")}
        />
      );
    case "git-pat-input":
      return (
        <PatInput
          onSubmit={async (token) => {
            const ok = await validatePat(token, setStatus);
            if (!ok) return;
            try {
              await configManager.setGitConfig({
                repoPath,
                remote,
                branch,
                authMode: "pat",
              });
              await configManager.setGitPat(token);
              setStep("git-branch-remote");
            } catch (e) {
              setStatus(
                `Failed to save PAT: ${e instanceof Error ? e.message : "?"}`
              );
            }
          }}
          onCancel={() => setStep("git-auth-mode")}
        />
      );
    case "git-branch-remote":
      return (
        <BranchRemoteStep
          repoPath={repoPath}
          branch={branch}
          remote={remote}
          setBranch={setBranch}
          setRemote={setRemote}
          onSubmit={() => setStep("git-verify")}
          onBack={() => setStep("git-auth-mode")}
          onStatus={setStatus}
        />
      );
    case "git-verify":
      return (
        <VerifyStep
          summary={{ repoPath, remote, branch, authMode }}
          onSave={async () => {
            try {
              await configManager.setGitConfig({
                repoPath,
                remote,
                branch,
                authMode,
              });
              setStatus("Git config saved.");
              onComplete();
            } catch (e) {
              setStatus(
                `Save failed: ${e instanceof Error ? e.message : "?"}`
              );
            }
          }}
          onBack={() => setStep("git-branch-remote")}
        />
      );
  }
}

function defaultRepoPath(): string {
  return join(homedir(), "Documents", "WikiFiles");
}

async function verifyGhAndAdvance(
  setStatus: (s: string) => void,
  advance: () => void
): Promise<void> {
  const installed = await ghIsInstalled();
  if (!installed) {
    setStatus("`gh` CLI not installed. Install it or pick a different mode.");
    return;
  }
  const auth = await ghAuthStatus();
  if (!auth.loggedIn) {
    setStatus("`gh` not logged in. Run `gh auth login`, then retry.");
    return;
  }
  setStatus(`Authenticated as ${auth.user ?? "github user"}.`);
  advance();
}

async function validatePat(
  token: string,
  setStatus: (s: string) => void
): Promise<boolean> {
  if (token.length < 20) {
    setStatus("PAT too short.");
    return false;
  }
  setStatus("Validating PAT…");
  try {
    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
    if (!res.ok) {
      setStatus(`PAT invalid (HTTP ${res.status}).`);
      return false;
    }
    const data = (await res.json()) as { login?: string };
    setStatus(`PAT valid (user: ${data.login ?? "?"}).`);
    return true;
  } catch (e) {
    setStatus(`PAT check failed: ${e instanceof Error ? e.message : "?"}`);
    return false;
  }
}

function GitPrompt({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  const { theme } = useTheme();
  useHeaderData({ title: "Git Tracking", metadata: "Optional setup" });
  useFooterHelp(formatHelpText(HELP_TEXT.ENTER_CONFIRM, HELP_TEXT.CANCEL));
  useEscape("git-prompt", onNo);
  useInput((_input, key) => {
    if (key.return) onYes();
  });
  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          Set up git tracking?
        </Text>
      </Box>
      <Box marginBottom={1}>
        <Text color={theme.colors.text}>
          Track live wiki pages against local files in a git repo so drift can
          be pulled and committed.
        </Text>
      </Box>
      <Box>
        <Text color={theme.colors.muted}>
          Enter to continue • Esc to skip
        </Text>
      </Box>
    </Box>
  );
}

const REPO_MODES: { value: RepoMode; label: string }[] = [
  { value: "existing", label: "Use existing local directory" },
  { value: "clone", label: "Clone an existing GitHub repo" },
  { value: "init", label: "Initialize a new empty repo" },
];

function RepoModeStep({
  onPick,
  onBack,
}: {
  onPick: (m: RepoMode) => void;
  onBack: () => void;
}) {
  const { theme } = useTheme();
  const [idx, setIdx] = useState(0);
  useHeaderData({ title: "WikiFiles Repo", metadata: "Pick how to set up" });
  useFooterHelp(COMMON_HELP_PATTERNS.MENU);
  useEscape("git-repo-mode", onBack);
  useInput((_input, key) => {
    if (key.upArrow) setIdx((i) => Math.max(0, i - 1));
    else if (key.downArrow) setIdx((i) => Math.min(REPO_MODES.length - 1, i + 1));
    else if (key.return) onPick(REPO_MODES[idx]!.value);
  });
  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          Where should tracked files live?
        </Text>
      </Box>
      {REPO_MODES.map((m, i) => (
        <Box key={m.value}>
          <Text
            color={i === idx ? theme.colors.accent : theme.colors.text}
            bold={i === idx}
          >
            {i === idx ? "▶ " : "  "}
            {m.label}
          </Text>
        </Box>
      ))}
    </Box>
  );
}

function RepoPathStep({
  initial,
  onSubmit,
  onBack,
  onStatus,
}: {
  initial: string;
  onSubmit: (path: string) => void;
  onBack: () => void;
  onStatus: (s: string) => void;
}) {
  const { theme } = useTheme();
  const [value, setValue] = useState(initial);
  useHeaderData({ title: "Repo Path", metadata: "Existing local directory" });
  useFooterHelp(
    formatHelpText("Type to edit", HELP_TEXT.ENTER_SUBMIT, HELP_TEXT.BACK)
  );
  useEscape("git-repo-existing", onBack);

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      onStatus("Repo path required.");
      return;
    }
    onStatus("Checking repo…");
    const ok = await isGitRepo(trimmed);
    if (!ok) {
      onStatus(`${trimmed} is not a git repo.`);
      return;
    }
    onStatus(`Repo OK: ${trimmed}`);
    onSubmit(trimmed);
  };

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          WikiFiles repo path
        </Text>
      </Box>
      <Box>
        <Text color={theme.colors.text}>Path: </Text>
        <TextInput
          value={value}
          onChange={setValue}
          onSubmit={() => void handleSubmit()}
          focus
          showCursor
        />
      </Box>
    </Box>
  );
}

function AuthModeStep({
  selected,
  onSelect,
  onBack,
}: {
  selected: GitAuthMode;
  onSelect: (mode: GitAuthMode) => void | Promise<void>;
  onBack: () => void;
}) {
  const { theme } = useTheme();
  const [idx, setIdx] = useState(AUTH_MODES.indexOf(selected));
  useHeaderData({ title: "Auth Mode", metadata: "How to push" });
  useFooterHelp(COMMON_HELP_PATTERNS.MENU);
  useEscape("git-auth-mode", onBack);
  useInput((_input, key) => {
    if (key.upArrow) setIdx((i) => Math.max(0, i - 1));
    else if (key.downArrow)
      setIdx((i) => Math.min(AUTH_MODES.length - 1, i + 1));
    else if (key.return) void onSelect(AUTH_MODES[idx]!);
  });

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          Pick auth mode
        </Text>
      </Box>
      {AUTH_MODES.map((mode, i) => (
        <Box key={mode}>
          <Text
            color={i === idx ? theme.colors.accent : theme.colors.text}
            bold={i === idx}
          >
            {i === idx ? "▶ " : "  "}
            {labelFor(mode)}
          </Text>
        </Box>
      ))}
    </Box>
  );
}

function labelFor(mode: GitAuthMode): string {
  if (mode === "gh") return "gh CLI (recommended — uses gh as credential helper)";
  if (mode === "pat") return "PAT (encrypted, used at push time)";
  return "manual (wikit prints push command for you to run)";
}

interface FormFieldDef {
  key: string;
  label: string;
}

interface MultiFieldFormProps {
  fields: FormFieldDef[];
  values: Record<string, string>;
  setValue: (key: string, v: string) => void;
  submitLabel: string;
  onSubmit: () => void;
  onBack: () => void;
  escapeId: string;
  headerTitle: string;
  headerMeta: string;
  busy?: boolean;
}

function MultiFieldForm({
  fields,
  values,
  setValue,
  submitLabel,
  onSubmit,
  onBack,
  escapeId,
  headerTitle,
  headerMeta,
  busy,
}: MultiFieldFormProps) {
  const { theme } = useTheme();
  const items = [...fields.map((f) => f.key), "__submit__"];
  const [focusIdx, setFocusIdx] = useState(0);
  const [editing, setEditing] = useState(false);
  const [buf, setBuf] = useState("");

  useHeaderData({ title: headerTitle, metadata: headerMeta });
  useFooterHelp(
    editing
      ? COMMON_HELP_PATTERNS.FORM_EDITING
      : COMMON_HELP_PATTERNS.FORM_SELECT_FIELD
  );
  useEscape(escapeId, () => {
    if (editing) {
      setEditing(false);
      return;
    }
    onBack();
  });

  useInput((_input, key) => {
    if (busy) return;
    if (editing) {
      if (key.return) {
        const focusedKey = items[focusIdx]!;
        setValue(focusedKey, buf);
        setEditing(false);
      }
      return;
    }
    if (key.upArrow) setFocusIdx((i) => Math.max(0, i - 1));
    else if (key.downArrow) setFocusIdx((i) => Math.min(items.length - 1, i + 1));
    else if (key.return) {
      const focusedKey = items[focusIdx]!;
      if (focusedKey === "__submit__") onSubmit();
      else {
        setBuf(values[focusedKey] ?? "");
        setEditing(true);
      }
    }
  });

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          {headerTitle}
        </Text>
      </Box>
      {fields.map((f, i) => {
        const focused = focusIdx === i;
        const editingThis = editing && focused;
        return (
          <Box key={f.key}>
            <Box width={14}>
              <Text color={focused ? theme.colors.accent : theme.colors.text}>
                {focused ? "▶ " : "  "}
                {f.label}:
              </Text>
            </Box>
            {editingThis ? (
              <TextInput value={buf} onChange={setBuf} focus showCursor />
            ) : (
              <Text color={theme.colors.text}>{values[f.key] ?? ""}</Text>
            )}
          </Box>
        );
      })}
      <Box marginTop={1}>
        <Text
          color={
            focusIdx === items.length - 1
              ? theme.colors.accent
              : theme.colors.muted
          }
          bold={focusIdx === items.length - 1}
        >
          {focusIdx === items.length - 1 ? "▶ " : "  "}[{busy ? "…" : submitLabel}]
        </Text>
      </Box>
    </Box>
  );
}

function CloneRepoStep({
  defaultTarget,
  onDone,
  onBack,
  onStatus,
}: {
  defaultTarget: string;
  onDone: (path: string) => void;
  onBack: () => void;
  onStatus: (s: string) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({
    url: "",
    target: defaultTarget,
  });
  const [busy, setBusy] = useState(false);

  const setValue = (k: string, v: string) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const runClone = async () => {
    const url = (values.url ?? "").trim();
    const target = (values.target ?? "").trim();
    if (!url || !target) {
      onStatus("URL and target both required.");
      return;
    }
    if (existsSync(target)) {
      onStatus(`${target} already exists. Pick a fresh path or use "existing".`);
      return;
    }
    setBusy(true);
    onStatus(`Cloning ${url} → ${target}…`);
    try {
      await mkdir(dirnameOf(target), { recursive: true }).catch(() => undefined);
      await cloneRepo(url, target);
      onStatus(`Cloned to ${target}.`);
      onDone(target);
    } catch (e) {
      onStatus(`Clone failed: ${e instanceof Error ? e.message : "?"}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <MultiFieldForm
      fields={[
        { key: "url", label: "Repo URL" },
        { key: "target", label: "Target" },
      ]}
      values={values}
      setValue={setValue}
      submitLabel="Clone"
      onSubmit={() => void runClone()}
      onBack={onBack}
      escapeId="git-repo-clone"
      headerTitle="Clone GitHub Repo"
      headerMeta="URL + target"
      busy={busy}
    />
  );
}

function InitRepoStep({
  defaultTarget,
  onDone,
  onBack,
  onStatus,
}: {
  defaultTarget: string;
  onDone: (path: string) => void;
  onBack: () => void;
  onStatus: (s: string) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({
    path: defaultTarget,
    remoteUrl: "",
  });
  const [busy, setBusy] = useState(false);

  const setValue = (k: string, v: string) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const runInit = async () => {
    const path = (values.path ?? "").trim();
    const remoteUrl = (values.remoteUrl ?? "").trim();
    if (!path) {
      onStatus("Target path required.");
      return;
    }
    setBusy(true);
    onStatus(`Initializing ${path}…`);
    try {
      await mkdir(path, { recursive: true });
      await initRepo(path);
      if (remoteUrl) {
        await addRemote(path, "origin", remoteUrl);
        onStatus(`Initialized at ${path} with remote origin.`);
      } else {
        onStatus(
          `Initialized at ${path} (no remote — push will fail until you add one).`
        );
      }
      onDone(path);
    } catch (e) {
      onStatus(`Init failed: ${e instanceof Error ? e.message : "?"}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <MultiFieldForm
      fields={[
        { key: "path", label: "Path" },
        { key: "remoteUrl", label: "Remote URL" },
      ]}
      values={values}
      setValue={setValue}
      submitLabel="Initialize"
      onSubmit={() => void runInit()}
      onBack={onBack}
      escapeId="git-repo-init"
      headerTitle="Initialize New Repo"
      headerMeta="Path + optional remote"
      busy={busy}
    />
  );
}

function BranchRemoteStep({
  repoPath,
  branch,
  remote,
  setBranch,
  setRemote,
  onSubmit,
  onBack,
  onStatus,
}: {
  repoPath: string;
  branch: string;
  remote: string;
  setBranch: (b: string) => void;
  setRemote: (r: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  onStatus: (s: string) => void;
}) {
  useEffect(() => {
    void autoDetect();
  }, []);

  const autoDetect = async () => {
    try {
      const [b, remotes] = await Promise.all([
        getCurrentBranch(repoPath).catch(() => "main"),
        listRemotes(repoPath).catch(() => []),
      ]);
      if (b) setBranch(b);
      if (remotes.length > 0 && remotes[0]) setRemote(remotes[0].name);
      onStatus(`Detected branch=${b}, remotes=${remotes.length}`);
    } catch (e) {
      onStatus(`Autodetect failed: ${e instanceof Error ? e.message : "?"}`);
    }
  };

  return (
    <MultiFieldForm
      fields={[
        { key: "remote", label: "Remote" },
        { key: "branch", label: "Branch" },
      ]}
      values={{ remote, branch }}
      setValue={(k, v) => (k === "remote" ? setRemote(v) : setBranch(v))}
      submitLabel="Continue"
      onSubmit={onSubmit}
      onBack={onBack}
      escapeId="git-branch-remote"
      headerTitle="Remote & Branch"
      headerMeta="Autodetected"
    />
  );
}

function VerifyStep({
  summary,
  onSave,
  onBack,
}: {
  summary: GitConfig;
  onSave: () => void | Promise<void>;
  onBack: () => void;
}) {
  const { theme } = useTheme();
  useHeaderData({ title: "Verify Git Setup", metadata: "Review and save" });
  useFooterHelp(
    formatHelpText(HELP_TEXT.ENTER_SAVE, HELP_TEXT.BACK)
  );
  useEscape("git-verify", onBack);
  useInput((_input, key) => {
    if (key.return) void onSave();
  });
  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>
          Confirm git config
        </Text>
      </Box>
      <Text color={theme.colors.text}>repoPath: {summary.repoPath}</Text>
      <Text color={theme.colors.text}>remote:   {summary.remote}</Text>
      <Text color={theme.colors.text}>branch:   {summary.branch}</Text>
      <Text color={theme.colors.text}>authMode: {summary.authMode}</Text>
    </Box>
  );
}

function dirnameOf(p: string): string {
  const norm = p.replace(/\\/g, "/");
  const idx = norm.lastIndexOf("/");
  return idx <= 0 ? "." : norm.slice(0, idx);
}
