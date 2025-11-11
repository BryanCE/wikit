import { useState } from "react";
import * as userApi from "@/api/users";
import type { UserMinimal, User, UsersInterfaceMode } from "@/types";
import { getProviderName } from "@/utils/users";

interface UseUserActionsProps {
  instance: string | null;
  onStatusChange: (message: string) => void;
  onModeChange: (mode: UsersInterfaceMode) => void;
  onUserUpdate: () => void;
}

export function useUserActions({
  instance,
  onStatusChange,
  onModeChange,
  onUserUpdate,
}: UseUserActionsProps) {
  const [pendingAction, setPendingAction] = useState<{
    action: string;
    user: UserMinimal;
  } | null>(null);
  const [fullUser, setFullUser] = useState<User | null>(null);
  const [currentAction, setCurrentAction] = useState<string | null>(null);

  const getConfirmationMessage = (
    action: string,
    userName: string
  ): { title: string; message: string; isDestructive: boolean } => {
    switch (action) {
      case "deactivate":
        return {
          title: "⚠️ CONFIRM USER DEACTIVATION",
          message: `Are you sure you want to deactivate user "${userName}"?\n\nThey will no longer be able to log in.`,
          isDestructive: true,
        };
      case "verify":
        return {
          title: "Confirm User Verification",
          message: `Are you sure you want to verify user "${userName}"?\n\nThis will mark their account as verified.`,
          isDestructive: false,
        };
      case "disable2fa":
        return {
          title: "⚠️ CONFIRM 2FA DISABLE",
          message: `Are you sure you want to disable 2FA for user "${userName}"?\n\nThis will reduce their account security.`,
          isDestructive: true,
        };
      case "resetPassword":
        return {
          title: "Confirm Password Reset",
          message: `Are you sure you want to send a password reset email to "${userName}"?`,
          isDestructive: false,
        };
      default:
        return {
          title: "Confirm Action",
          message: `Are you sure you want to perform this action on "${userName}"?`,
          isDestructive: false,
        };
    }
  };

  const handleAction = async (action: string, user: UserMinimal) => {
    setCurrentAction(action);

    const dangerousActions = [
      "deactivate",
      "disable2fa",
      "resetPassword",
      "verify",
    ];
    if (dangerousActions.includes(action)) {
      setPendingAction({ action, user });
      onModeChange("confirm");
      return;
    }

    if (action === "view") {
      try {
        const fullUserData = await userApi.getUser(
          user.id,
          instance ?? undefined
        );
        setFullUser(fullUserData);
        onModeChange("detail");
      } catch (error) {
        onStatusChange(
          `Error loading user details: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    } else if (action === "edit") {
      try {
        const fullUserData = await userApi.getUser(
          user.id,
          instance ?? undefined
        );
        setFullUser(fullUserData);
        onModeChange("edit");
      } catch (error) {
        onStatusChange(
          `Error loading user: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    } else if (action === "delete") {
      onStatusChange(`Opening delete dialog for ${user.name}...`);
      onModeChange("delete");
    } else if (action === "activate") {
      try {
        const response = await userApi.activateUser(
          user.id,
          instance ?? undefined
        );
        if (response.responseResult.succeeded) {
          onStatusChange(`User ${user.name} activated successfully!`);
          onUserUpdate();
          onModeChange("list");
        } else {
          onStatusChange(
            `Failed to activate user: ${response.responseResult.message}`
          );
        }
      } catch (error) {
        onStatusChange(
          `Error activating user: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    } else if (action === "enable2fa") {
      // Only allow 2FA management for local authentication users
      if (user.providerKey !== "local") {
        const providerDisplay = getProviderName(user.providerKey);
        onStatusChange(
          `Cannot manage 2FA for user authenticated via external provider (${providerDisplay}). 2FA is managed through their authentication provider.`
        );
        onModeChange("list");
        return;
      }

      try {
        const response = await userApi.enable2FA(
          user.id,
          instance ?? undefined
        );
        if (response.responseResult.succeeded) {
          onStatusChange(`2FA enabled for user ${user.name}!`);
          onUserUpdate();
          onModeChange("list");
        } else {
          onStatusChange(
            `Failed to enable 2FA: ${response.responseResult.message}`
          );
        }
      } catch (error) {
        onStatusChange(
          `Error enabling 2FA: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }
  };

  const executeConfirmedAction = async () => {
    if (!pendingAction) return;

    const { action, user } = pendingAction;

    if (action === "deactivate") {
      try {
        const response = await userApi.deactivateUser(
          user.id,
          instance ?? undefined
        );
        if (response.responseResult.succeeded) {
          onStatusChange(`User ${user.name} deactivated successfully!`);
          onUserUpdate();
          onModeChange("list");
        } else {
          onStatusChange(
            `Failed to deactivate user: ${response.responseResult.message}`
          );
        }
      } catch (error) {
        onStatusChange(
          `Error deactivating user: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    } else if (action === "verify") {
      // Only allow manual verification for local authentication users
      if (user.providerKey !== "local") {
        const providerDisplay = getProviderName(user.providerKey);
        onStatusChange(
          `User is already verified by external provider (${providerDisplay}). Manual verification is not needed.`
        );
        onModeChange("list");
        setPendingAction(null);
        return;
      }

      try {
        const response = await userApi.verifyUser(
          user.id,
          instance ?? undefined
        );
        if (response.responseResult.succeeded) {
          onStatusChange(`User ${user.name} verified successfully!`);
          onUserUpdate();
          onModeChange("list");
        } else {
          onStatusChange(
            `Failed to verify user: ${response.responseResult.message}`
          );
        }
      } catch (error) {
        onStatusChange(
          `Error verifying user: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    } else if (action === "disable2fa") {
      // Only allow 2FA management for local authentication users
      if (user.providerKey !== "local") {
        const providerDisplay = getProviderName(user.providerKey);
        onStatusChange(
          `Cannot manage 2FA for user authenticated via external provider (${providerDisplay}). 2FA is managed through their authentication provider.`
        );
        onModeChange("list");
        setPendingAction(null);
        return;
      }

      try {
        const response = await userApi.disable2FA(
          user.id,
          instance ?? undefined
        );
        if (response.responseResult.succeeded) {
          onStatusChange(`2FA disabled for user ${user.name}!`);
          onUserUpdate();
          onModeChange("list");
        } else {
          onStatusChange(
            `Failed to disable 2FA: ${response.responseResult.message}`
          );
        }
      } catch (error) {
        onStatusChange(
          `Error disabling 2FA: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    } else if (action === "resetPassword") {
      // Only allow password reset for local authentication users
      if (user.providerKey !== "local") {
        const providerDisplay = getProviderName(user.providerKey);
        onStatusChange(
          `Cannot reset password for user authenticated via external provider (${providerDisplay}). User must reset password through their authentication provider.`
        );
        onModeChange("list");
        setPendingAction(null);
        return;
      }

      try {
        const response = await userApi.resetPassword(
          user.id,
          instance ?? undefined
        );
        if (response.responseResult.succeeded) {
          onStatusChange(`Password reset email sent to ${user.name}!`);
          onUserUpdate();
          onModeChange("list");
        } else {
          onStatusChange(
            `Failed to reset password: ${response.responseResult.message}`
          );
        }
      } catch (error) {
        onStatusChange(
          `Error resetting password: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }

    setPendingAction(null);
  };

  const cancelPendingAction = () => {
    setPendingAction(null);
    onModeChange("list");
  };

  return {
    pendingAction,
    fullUser,
    currentAction,
    setFullUser,
    handleAction,
    executeConfirmedAction,
    cancelPendingAction,
    getConfirmationMessage,
  };
}