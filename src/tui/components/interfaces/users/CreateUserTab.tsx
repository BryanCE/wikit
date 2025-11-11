import React from "react";
import { UserCreateForm } from "./UserCreateForm";

interface CreateUserTabProps {
  instance: string | null;
  onStatusChange: (message: string) => void;
  onSuccess: () => void;
  onCancel: () => void;
  isActiveTab: boolean;
  inCreateForm: boolean;
  onExitForm: () => void;
}

export function CreateUserTab({
  instance,
  onStatusChange,
  onSuccess,
  onCancel: _onCancel,
  isActiveTab,
  inCreateForm,
  onExitForm,
}: CreateUserTabProps) {
  // Only render if active (for performance)
  if (!isActiveTab) return null;

  return (
    <UserCreateForm
      instance={instance ?? undefined}
      onSuccess={onSuccess}
      onStatusChange={onStatusChange}
      inCreateForm={inCreateForm}
      onExitForm={onExitForm}
    />
  );
}
