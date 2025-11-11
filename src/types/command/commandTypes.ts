export interface Command {
  name: string;
  description: string;
  aliases?: string[];
  args?: string;
  category?: "pages" | "configuration" | "multi-instance" | "general" | "users";
  quickAction?: boolean;
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  color: string;
}

export interface GlobalOptions {
  instance: string;
}

export interface ListOptions {
  limit: string;
  all?: boolean;
  recursive?: boolean;
}

export interface DeleteOptions {
  force?: boolean;
}
