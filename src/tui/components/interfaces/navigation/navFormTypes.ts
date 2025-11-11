export interface FormData {
  kind: "link" | "header" | "divider";
  label: string;
  target: string;
  targetType: "page" | "external" | "externalblank" | "home";
  icon: string;
  insertAfterId: string;
}

export interface FormFieldConfig {
  key: keyof FormData;
  label: string;
  placeholder: string;
  isSelect?: boolean;
}

export const FORM_FIELDS: FormFieldConfig[] = [
  {
    key: "kind",
    label: "Kind",
    placeholder: "link/header/divider",
    isSelect: true,
  },
  { key: "label", label: "Label", placeholder: "Enter item label" },
  { key: "target", label: "Target", placeholder: "Page path or URL" },
  {
    key: "targetType",
    label: "Target Type",
    placeholder: "page/external/externalblank/home",
    isSelect: true,
  },
  { key: "icon", label: "Icon", placeholder: "Optional icon (e.g., mdi-home)" },
  {
    key: "insertAfterId",
    label: "Insert After",
    placeholder: "(beginning)",
    isSelect: true,
  },
];

export const KIND_TYPES = ["link", "header", "divider"] as const;
export const TARGET_TYPES = ["page", "external", "externalblank", "home"] as const;

export type ActionButton = "save" | "cancel";

export const PREVIEW_INPUT_HANDLER = (
  key: { return?: boolean; leftArrow?: boolean; rightArrow?: boolean },
  selectedButton: "confirm" | "back",
  onConfirm: () => void,
  onCancel: () => void,
  onNavigate: (direction: "left" | "right") => void
) => {
  if (key.return) {
    if (selectedButton === "confirm") {
      onConfirm();
    } else {
      onCancel();
    }
  } else if (key.leftArrow) {
    onNavigate("left");
  } else if (key.rightArrow) {
    onNavigate("right");
  }
};
