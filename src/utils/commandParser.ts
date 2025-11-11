export interface ParsedCommand {
  command: string;
  args: string;
  isComplete: boolean;
}

/**
 * Parse command input consistently across the application
 */
export function parseCommandInput(input: string): ParsedCommand | null {
  const trimmed = input.trim();

  if (!trimmed.startsWith("/")) {
    return null;
  }

  const withoutSlash = trimmed.slice(1);
  const [command, ...argParts] = withoutSlash.split(" ");

  if (!command) {
    return null;
  }

  return {
    command: command.toLowerCase(),
    args: argParts.join(" ").trim(),
    isComplete: !!command,
  };
}

/**
 * Get just the command part for filtering (before first space)
 */
export function getCommandPart(input: string): string {
  const parsed = parseCommandInput(input);
  return parsed?.command ?? "";
}

/**
 * Check if input has a valid command structure
 */
export function isValidCommandInput(input: string): boolean {
  const parsed = parseCommandInput(input);
  return parsed?.isComplete ?? false;
}
