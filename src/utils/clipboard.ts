import { execSync } from "child_process";

export function copyToClipboard(text: string): void {
  try {
    // Check if we're in WSL/Windows environment
    if (process.platform === "linux" && process.env.WSL_DISTRO_NAME) {
      // Use Windows clip.exe in WSL
      execSync(`echo '${text.replace(/'/g, "'\\''")}' | clip.exe`, {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      });
      return;
    }

    // Check if clip.exe exists (Windows/WSL)
    try {
      execSync("which clip.exe", { stdio: "ignore" });
      execSync(`echo '${text.replace(/'/g, "'\\''")}' | clip.exe`, {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      });
      return;
    } catch {
      // clip.exe not available, continue to other methods
    }

    // Fallback to platform-specific clipboard commands
    if (process.platform === "win32") {
      // Native Windows - use PowerShell Set-Clipboard
      execSync(
        `powershell.exe -NoProfile -Command "Set-Clipboard -Value '${text.replace(
          /'/g,
          "''"
        )}'"`,
        {
          encoding: "utf8",
        }
      );
    } else if (process.platform === "darwin") {
      execSync(`echo '${text.replace(/'/g, "'\\''")}' | pbcopy`, {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      });
    } else if (process.platform === "linux") {
      // Try xclip first, then xsel
      try {
        execSync(
          `echo '${text.replace(/'/g, "'\\''")}' | xclip -selection clipboard`,
          {
            encoding: "utf8",
            stdio: ["pipe", "pipe", "pipe"],
          }
        );
      } catch {
        execSync(
          `echo '${text.replace(/'/g, "'\\''")}' | xsel --clipboard --input`,
          {
            encoding: "utf8",
            stdio: ["pipe", "pipe", "pipe"],
          }
        );
      }
    } else {
      throw new Error(
        `Clipboard not supported on platform: ${process.platform}`
      );
    }
  } catch (error) {
    throw new Error(
      `Failed to copy to clipboard: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
