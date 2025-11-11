import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import { useTheme } from "@/tui/contexts/ThemeContext";
import { useEscape } from "@/tui/contexts/EscapeContext";
import { useHeaderData } from "@/tui/contexts/HeaderContext";
import { useFooterHelp, useFooterStatus } from "@/tui/contexts/FooterContext";
import * as groupApi from "@/api/groups";
import * as userApi from "@/api/users";
import type { GroupMinimal, Group } from "@/types";
import { findOrphanedUsers, type OrphanedUser } from "@/utils/userAnalyzer";
import { AllGroupsTab } from "./AllGroupsTab";
import { OrphanedUsersTab } from "./OrphanedUsersTab";
import { GroupActionMenu } from "./GroupActionMenu";
import { GroupDetailView } from "./GroupDetailView";
import { GroupCreateForm } from "./GroupCreateForm";
import { GroupDeleteDialog } from "./GroupDeleteDialog";
import { GroupMembersManager } from "./GroupMembersManager";
import { GroupPermissionsView } from "./GroupPermissionsView";
import { GroupPageRulesView } from "./GroupPageRulesView";
import { useGroupsKeyboard } from "./hooks/useGroupsKeyboard";

interface GroupsInterfaceProps {
  onEsc?: () => void;
}

type TabType = "groups" | "orphaned";
type GroupsInterfaceMode =
  | "list"
  | "action"
  | "detail"
  | "manageMembers"
  | "viewPermissions"
  | "viewPageRules"
  | "create"
  | "delete";

export function GroupsInterface({
  onEsc,
}: GroupsInterfaceProps) {
  const { theme } = useTheme();
  const [currentTab, setCurrentTab] = useState<TabType>("groups");
  const [statusMsg, setStatusMsg] = useState("");

  // Mode flags for tab content
  const [inGroupsContent, setInGroupsContent] = useState(false);
  const [inOrphanedContent, setInOrphanedContent] = useState(false);

  // Groups tab state
  const [groups, setGroups] = useState<GroupMinimal[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [mode, setMode] = useState<GroupsInterfaceMode>("list");
  const [selectedGroup, setSelectedGroup] = useState<GroupMinimal | null>(null);
  const [fullGroup, setFullGroup] = useState<Group | null>(null);

  // Orphaned users tab state
  const [orphanedUsers, setOrphanedUsers] = useState<OrphanedUser[]>([]);
  const [loadingOrphaned, setLoadingOrphaned] = useState(false);
  const [selectedOrphanedIndex, setSelectedOrphanedIndex] = useState(0);

  useHeaderData({ title: "Group Management", metadata: `${groups.length} groups` });
  useFooterStatus(statusMsg);

  const loadGroups = async () => {
    setLoadingGroups(true);
    try {
      const groupList = await groupApi.listGroups();
      setGroups(groupList);
      setSelectedGroupIndex(0);
      setStatusMsg(`Loaded ${groupList.length} groups`);
    } catch (error) {
      setStatusMsg(
        `Error loading groups: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setLoadingGroups(false);
    }
  };

  const loadGroupDetails = async (id: number) => {
    try {
      const group = await groupApi.getGroup(id);
      setFullGroup(group);
      setMode("detail");
    } catch (error) {
      setStatusMsg(
        `Error loading group details: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const loadOrphanedUsers = async () => {
    setLoadingOrphaned(true);
    try {
      const [allUsers, groupsWithUsers] = await Promise.all([
        userApi.listUsers({ orderBy: "name" }),
        groupApi.getAllGroupsWithUsers(),
      ]);

      const orphaned = findOrphanedUsers(allUsers, groupsWithUsers);
      setOrphanedUsers(orphaned);
      setSelectedOrphanedIndex(0);
      setStatusMsg(`Found ${orphaned.length} orphaned user${orphaned.length === 1 ? "" : "s"}`);
    } catch (error) {
      setStatusMsg(
        `Error finding orphaned users: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setLoadingOrphaned(false);
    }
  };

  useEffect(() => {
    void loadGroups();
  }, []);

  // Load orphaned users when switching to that tab
  useEffect(() => {
    if (currentTab === "orphaned" && orphanedUsers.length === 0 && !loadingOrphaned) {
      void loadOrphanedUsers();
    }
  }, [currentTab]);

  const handleSelectGroup = (group: GroupMinimal) => {
    setSelectedGroup(group);
    setMode("action");
  };

  const handleAction = (action: string, group: GroupMinimal) => {
    switch (action) {
      case "view":
        void loadGroupDetails(group.id);
        break;
      case "members":
        void loadGroupDetails(group.id).then(() => {
          setMode("manageMembers");
        });
        break;
      case "delete":
        setMode("delete");
        break;
      default:
        setStatusMsg(`Unknown action: ${action}`);
    }
  };

  const handleNavigate = (section: "members" | "permissions" | "pageRules") => {
    if (section === "members") {
      setMode("manageMembers");
    } else if (section === "permissions") {
      setMode("viewPermissions");
    } else if (section === "pageRules") {
      setMode("viewPageRules");
    }
  };

  // Footer help text
  const footerHelpText = (() => {
    if (mode !== "list") {
      // When in action menus, details, etc. - use component's own help text
      return "";
    }

    if (currentTab === "groups") {
      if (inGroupsContent) {
        return "Tab/1-2 switch tabs • ↑↓ navigate • Enter actions • ↑ to tab bar • Esc back";
      }
      return "Tab/←→ switch tabs • 1-2 quick jump • ↓ enter list • Esc back";
    } else {
      if (inOrphanedContent) {
        return "Tab/1-2 switch tabs • ↑↓ navigate • ↑ to tab bar • Esc back";
      }
      return "Tab/←→ switch tabs • 1-2 quick jump • ↓ enter list • Esc back";
    }
  })();

  useFooterHelp(footerHelpText);

  // Escape handler
  useEscape("groups", () => {
    if (mode === "list") {
      if (inGroupsContent) {
        setInGroupsContent(false);
      } else if (inOrphanedContent) {
        setInOrphanedContent(false);
      } else {
        onEsc?.();
      }
    } else if (mode === "action") {
      setMode("list");
      setSelectedGroup(null);
    } else if (mode === "detail") {
      setMode("action");
    } else if (mode === "manageMembers") {
      setMode("detail");
    } else if (mode === "viewPermissions") {
      setMode("detail");
    } else if (mode === "viewPageRules") {
      setMode("detail");
    } else if (mode === "create") {
      setMode("list");
    } else if (mode === "delete") {
      setMode("action");
    }
  });

  // Keyboard navigation hook
  useGroupsKeyboard({
    currentTab,
    setCurrentTab,
    inGroupsContent,
    setInGroupsContent,
    inOrphanedContent,
    setInOrphanedContent,
    groups,
    selectedGroupIndex,
    setSelectedGroupIndex,
    onSelectGroup: handleSelectGroup,
    orphanedUsers,
    selectedOrphanedIndex,
    setSelectedOrphanedIndex,
    loading: loadingGroups || loadingOrphaned,
  });

  // Render modes (action menus, details, etc.) - these override the tab interface
  if (mode === "action" && selectedGroup) {
    return <GroupActionMenu group={selectedGroup} onAction={handleAction} />;
  }

  if (mode === "detail" && fullGroup) {
    return <GroupDetailView group={fullGroup} onNavigate={handleNavigate} />;
  }

  if (mode === "manageMembers" && fullGroup) {
    return (
      <GroupMembersManager
        group={fullGroup}
        onSuccess={() => {
          void loadGroupDetails(fullGroup.id);
          void loadGroups();
        }}
        onStatusChange={setStatusMsg}
        onClose={() => setMode("detail")}
      />
    );
  }

  if (mode === "viewPermissions" && fullGroup) {
    return <GroupPermissionsView group={fullGroup} />;
  }

  if (mode === "viewPageRules" && fullGroup) {
    return <GroupPageRulesView group={fullGroup} />;
  }

  if (mode === "create") {
    return (
      <GroupCreateForm
        onSuccess={() => {
          void loadGroups();
          setMode("list");
        }}
        onStatusChange={setStatusMsg}
      />
    );
  }

  if (mode === "delete" && selectedGroup) {
    return (
      <GroupDeleteDialog
        group={selectedGroup}
        onSuccess={() => {
          void loadGroups();
          setMode("list");
          setSelectedGroup(null);
        }}
        onStatusChange={setStatusMsg}
      />
    );
  }

  // Render tab interface
  return (
    <Box flexDirection="column" flexGrow={1}>
      {/* Tab Navigation */}
      <Box
        paddingX={1}
        borderStyle="single"
        borderColor={
          currentTab === "groups" ? theme.colors.primary : theme.colors.warning
        }
        flexShrink={0}
      >
        <Text
          color={
            currentTab === "groups"
              ? theme.colors.background
              : theme.colors.primary
          }
          backgroundColor={
            currentTab === "groups" ? theme.colors.primary : undefined
          }
          bold={currentTab === "groups"}
        >
          1. All Groups
        </Text>
        <Text> | </Text>
        <Text
          color={
            currentTab === "orphaned"
              ? theme.colors.background
              : theme.colors.warning
          }
          backgroundColor={
            currentTab === "orphaned" ? theme.colors.warning : undefined
          }
          bold={currentTab === "orphaned"}
        >
          2. Orphaned Users
        </Text>
      </Box>

      {/* Tab Content */}
      <Box flexGrow={1} flexDirection="column" overflow="hidden">
        {currentTab === "groups" && (
          <AllGroupsTab
            groups={groups}
            selectedIndex={selectedGroupIndex}
            loading={loadingGroups}
            inGroupsContent={inGroupsContent}
          />
        )}

        {currentTab === "orphaned" && (
          <OrphanedUsersTab
            users={orphanedUsers}
            selectedIndex={selectedOrphanedIndex}
            loading={loadingOrphaned}
            inOrphanedContent={inOrphanedContent}
          />
        )}
      </Box>
    </Box>
  );
}
