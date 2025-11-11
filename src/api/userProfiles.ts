import { graphql } from "@/api";
import { logger } from "@/utils/logger";
import type { TeamMember, ProfileImportRow, ProfileImportResult } from "@/types";

const LIST_USERS_WITH_PROFILES_QUERY = `
  query {
    users {
      list {
        id
        name
        email
        isActive
        providerKey
      }
    }
  }
`;

const GET_USER_PROFILE_QUERY = `
  query GetUserProfile($id: Int!) {
    users {
      single(id: $id) {
        id
        name
        email
        pictureUrl
        jobTitle
        location
        extendedProfile {
          portfolio
          team
          role
          hireDate
          birthday
          bio
        }
      }
    }
  }
`;

export async function getTeamMembers(instance?: string): Promise<TeamMember[]> {
  logger.info({ instance }, "Fetching team members via GraphQL");

  // First get list of user IDs
  const listResponse = await graphql<{
    users: {
      list: Array<{
        id: number;
        name: string;
        email: string;
        isActive: boolean;
        providerKey: string;
      }>;
    };
  }>(LIST_USERS_WITH_PROFILES_QUERY, {}, instance);

  // Filter to active, non-local users (excludes Administrator, Guest, etc.)
  const activeUsers = listResponse.users.list.filter(
    (user) => user.isActive && user.providerKey !== 'local' && user.id !== 1 && user.id !== 2
  );

  logger.info({ count: activeUsers.length }, "Fetching profiles for active users");

  // Fetch full profile for each user
  const teamMembers: TeamMember[] = await Promise.all(
    activeUsers.map(async (user) => {
      const profileResponse = await graphql<{
        users: {
          single: {
            id: number;
            name: string;
            email: string;
            pictureUrl?: string;
            jobTitle?: string;
            location?: string;
            extendedProfile?: {
              portfolio?: string;
              team?: string;
              role?: string;
              hireDate?: string;
              birthday?: string;
              bio?: string;
            };
          };
        };
      }>(GET_USER_PROFILE_QUERY, { id: user.id }, instance);

      const fullUser = profileResponse.users.single;
      return {
        id: fullUser.id,
        name: fullUser.name,
        email: fullUser.email,
        pictureUrl: fullUser.pictureUrl,
        jobTitle: fullUser.jobTitle,
        location: fullUser.location,
        portfolio: fullUser.extendedProfile?.portfolio,
        team: fullUser.extendedProfile?.team,
        birthday: fullUser.extendedProfile?.birthday,
        bio: fullUser.extendedProfile?.bio,
        hire_date: fullUser.extendedProfile?.hireDate,
        role: fullUser.extendedProfile?.role,
      };
    })
  );

  logger.info({ count: teamMembers.length }, "Team members loaded successfully via GraphQL");
  return teamMembers;
}

export async function updateUserProfile(
  userId: number,
  profile: { portfolio?: string; team?: string; birthday?: string; bio?: string; hire_date?: string; role?: string },
  instance?: string
): Promise<void> {
  logger.info({ userId, profile, instance }, "Updating user profile");

  const mutation = `
    mutation UpdateUserProfile($userId: Int!, $portfolio: String, $team: String, $birthday: Date, $bio: String, $hireDate: Date, $role: String) {
      customUserProfiles {
        update(
          userId: $userId
          portfolio: $portfolio
          team: $team
          birthday: $birthday
          bio: $bio
          hireDate: $hireDate
          role: $role
        ) {
          responseResult {
            succeeded
            message
          }
        }
      }
    }
  `;

  // Helper to format dates as YYYY-MM-DD
  const formatDate = (date?: string): string | null => {
    if (!date) return null;
    try {
      // If it's already in YYYY-MM-DD format, return it
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }
      // Otherwise parse and format
      const d = new Date(date);
      if (isNaN(d.getTime())) return null;
      const isoDate = d.toISOString().split('T')[0];
      return isoDate ?? null;
    } catch {
      return null;
    }
  };

  const variables = {
    userId,
    portfolio: profile.portfolio ?? null,
    team: profile.team ?? null,
    birthday: formatDate(profile.birthday),
    bio: profile.bio ?? null,
    hireDate: formatDate(profile.hire_date),
    role: profile.role ?? null,
  };

  logger.info({ userId, variables, instance }, "Sending GraphQL mutation with formatted variables");

  try {
    const result = await graphql<{
      customUserProfiles: {
        update: {
          responseResult: {
            succeeded: boolean;
            message?: string;
          };
        };
      };
    }>(
      mutation,
      variables,
      instance
    );

    logger.info({
      userId,
      result: result.customUserProfiles.update.responseResult,
      instance
    }, "Received GraphQL mutation response");

    if (!result.customUserProfiles.update.responseResult.succeeded) {
      const errorMessage = result.customUserProfiles.update.responseResult.message ?? "Failed to update user profile";
      logger.error({ userId, profile, message: errorMessage, result }, "User profile update failed");
      throw new Error(errorMessage);
    }

    logger.info({ userId, profile, variables }, "User profile updated successfully");
  } catch (err) {
    logger.error({ userId, profile, err }, "Error updating user profile");
    throw err;
  }
}

export async function importProfiles(
  profiles: ProfileImportRow[],
  instance?: string
): Promise<ProfileImportResult> {
  logger.info({ profileCount: profiles.length }, "Starting profile import via GraphQL");

  const result: ProfileImportResult = {
    success: 0,
    failed: 0,
    errors: [],
  };

  // First get all users to match emails to IDs
  const usersQuery = `
    query {
      users {
        list {
          id
          email
          providerKey
        }
      }
    }
  `;

  const usersData = await graphql<{
    users: {
      list: Array<{ id: number; email: string; providerKey: string }>;
    };
  }>(usersQuery, {}, instance);

  // Filter out local accounts (Administrator, Guest, etc.)
  const nonLocalUsers = usersData.users.list.filter(
    (u) => u.providerKey !== 'local' && u.id !== 1 && u.id !== 2
  );

  logger.info(
    {
      total: usersData.users.list.length,
      filtered: nonLocalUsers.length,
      localAccounts: usersData.users.list.filter(u => u.providerKey === 'local').length
    },
    "Filtered local accounts from import"
  );

  // Map email to ID
  const emailToIdMap = new Map<string, number>();
  for (const user of nonLocalUsers) {
    emailToIdMap.set(user.email.toLowerCase(), user.id);
  }

  // Process each profile
  for (const profile of profiles) {
    const userId = emailToIdMap.get(profile.email.toLowerCase());

    if (!userId) {
      result.failed++;
      result.errors.push(`User not found: ${profile.email}`);
      logger.warn({ email: profile.email }, "User not found during import");
      continue;
    }

    try {
      await updateUserProfile(
        userId,
        {
          portfolio: profile.portfolio,
          team: profile.team,
          birthday: profile.birthday,
          bio: profile.bio,
          hire_date: profile.hire_date,
          role: profile.role,
        },
        instance
      );
      result.success++;
      logger.info({ email: profile.email, userId }, "Profile updated successfully");
    } catch (err) {
      result.failed++;
      const errorMsg = err instanceof Error ? err.message : String(err);
      result.errors.push(`${profile.email}: ${errorMsg}`);
      logger.error({ email: profile.email, err }, "Failed to update profile");
    }
  }

  logger.info({ result }, "Import completed");
  return result;
}
