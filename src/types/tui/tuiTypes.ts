export type FocusMode = "input" | "menu" | "commands";

export type UsersInterfaceMode =
  | "list"
  | "menu"
  | "detail"
  | "edit"
  | "create"
  | "selectReplacement"
  | "confirmDelete"
  | "action"
  | "confirm"
  | "delete";

export interface HeaderData {
  title?: string | null;
  metadata?: string | null;
}
