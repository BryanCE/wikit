import { graphql } from "@/api";
import type {
  UserMinimal,
  User,
  UserLastLogin,
  UserResponse,
  DefaultResponse,
  CreateUserInput,
  UpdateUserInput,
  UserListOptions,
} from "@/types";

export async function listUsers(
  options: UserListOptions
): Promise<UserMinimal[]> {
  const query = `
    query($filter: String, $orderBy: String) {
      users {
        list(filter: $filter, orderBy: $orderBy) {
          id
          name
          email
          providerKey
          isSystem
          isActive
          createdAt
          lastLoginAt
        }
      }
    }
  `;

  const result = await graphql<{ users: { list: UserMinimal[] } }>(
    query,
    { filter: options.filter, orderBy: options.orderBy }
  );

  return result.users.list;
}

export async function searchUsers(
  query: string
): Promise<UserMinimal[]> {
  const gqlQuery = `
    query($query: String!) {
      users {
        search(query: $query) {
          id
          name
          email
          providerKey
          isSystem
          isActive
          createdAt
          lastLoginAt
        }
      }
    }
  `;

  const result = await graphql<{ users: { search: UserMinimal[] } }>(
    gqlQuery,
    { query }
  );

  return result.users.search;
}

export async function getUser(id: number): Promise<User> {
  const query = `
    query($id: Int!) {
      users {
        single(id: $id) {
          id
          name
          email
          providerKey
          providerName
          providerId
          providerIs2FACapable
          isSystem
          isActive
          isVerified
          location
          jobTitle
          timezone
          dateFormat
          appearance
          createdAt
          updatedAt
          lastLoginAt
          tfaIsActive
          groups {
            id
            name
            isSystem
          }
        }
      }
    }
  `;

  const result = await graphql<{ users: { single: User } }>(
    query,
    { id }
  );

  return result.users.single;
}

export async function getLastLogins(): Promise<UserLastLogin[]> {
  const query = `
    query {
      users {
        lastLogins {
          id
          name
          lastLoginAt
        }
      }
    }
  `;

  const result = await graphql<{ users: { lastLogins: UserLastLogin[] } }>(
    query,
    {}
  );

  return result.users.lastLogins;
}

export async function createUser(
  input: CreateUserInput
): Promise<UserResponse> {
  const mutation = `
    mutation(
      $email: String!
      $name: String!
      $passwordRaw: String
      $providerKey: String!
      $groups: [Int]!
      $mustChangePassword: Boolean
      $sendWelcomeEmail: Boolean
    ) {
      users {
        create(
          email: $email
          name: $name
          passwordRaw: $passwordRaw
          providerKey: $providerKey
          groups: $groups
          mustChangePassword: $mustChangePassword
          sendWelcomeEmail: $sendWelcomeEmail
        ) {
          responseResult {
            succeeded
            errorCode
            slug
            message
          }
          user {
            id
            name
            email
          }
        }
      }
    }
  `;

  // Filter out undefined and empty string values for optional fields
  const variables: Record<string, unknown> = {
    email: input.email,
    name: input.name,
    providerKey: input.providerKey,
    groups: input.groups
  };
  if (input.passwordRaw !== undefined && input.passwordRaw !== "") variables.passwordRaw = input.passwordRaw;
  if (input.mustChangePassword !== undefined) variables.mustChangePassword = input.mustChangePassword;
  if (input.sendWelcomeEmail !== undefined) variables.sendWelcomeEmail = input.sendWelcomeEmail;

  const result = await graphql<{ users: { create: UserResponse } }>(
    mutation,
    variables
  );

  return result.users.create;
}

export async function updateUser(
  input: UpdateUserInput
): Promise<DefaultResponse> {
  const mutation = `
    mutation(
      $id: Int!
      $email: String
      $name: String
      $newPassword: String
      $groups: [Int]
      $location: String
      $jobTitle: String
      $timezone: String
      $dateFormat: String
      $appearance: String
    ) {
      users {
        update(
          id: $id
          email: $email
          name: $name
          newPassword: $newPassword
          groups: $groups
          location: $location
          jobTitle: $jobTitle
          timezone: $timezone
          dateFormat: $dateFormat
          appearance: $appearance
        ) {
          responseResult {
            succeeded
            errorCode
            slug
            message
          }
        }
      }
    }
  `;

  // Filter out undefined and empty string values
  const variables: Record<string, unknown> = { id: input.id };
  if (input.email !== undefined && input.email !== "") variables.email = input.email;
  if (input.name !== undefined && input.name !== "") variables.name = input.name;
  if (input.newPassword !== undefined && input.newPassword !== "") variables.newPassword = input.newPassword;
  if (input.groups !== undefined) variables.groups = input.groups;
  if (input.location !== undefined && input.location !== "") variables.location = input.location;
  if (input.jobTitle !== undefined && input.jobTitle !== "") variables.jobTitle = input.jobTitle;
  if (input.timezone !== undefined && input.timezone !== "") variables.timezone = input.timezone;
  if (input.dateFormat !== undefined && input.dateFormat !== "") variables.dateFormat = input.dateFormat;
  if (input.appearance !== undefined && input.appearance !== "") variables.appearance = input.appearance;

  const { logger } = await import("@/utils/logger");
  logger.info({
    input,
    variables,
    mutation: mutation.substring(0, 100)
  }, "updateUser API call - sending GraphQL mutation");

  const result = await graphql<{ users: { update: DefaultResponse } }>(
    mutation,
    variables
  );

  logger.info({ result, userId: input.id }, "updateUser API call - received response");

  return result.users.update;
}

export async function deleteUser(
  id: number,
  replaceId: number
): Promise<DefaultResponse> {
  const mutation = `
    mutation($id: Int!, $replaceId: Int!) {
      users {
        delete(id: $id, replaceId: $replaceId) {
          responseResult {
            succeeded
            errorCode
            slug
            message
          }
        }
      }
    }
  `;

  const result = await graphql<{ users: { delete: DefaultResponse } }>(
    mutation,
    { id, replaceId }
  );

  return result.users.delete;
}

export async function activateUser(
  id: number
): Promise<DefaultResponse> {
  const mutation = `
    mutation($id: Int!) {
      users {
        activate(id: $id) {
          responseResult {
            succeeded
            errorCode
            slug
            message
          }
        }
      }
    }
  `;

  const result = await graphql<{ users: { activate: DefaultResponse } }>(
    mutation,
    { id }
  );

  return result.users.activate;
}

export async function deactivateUser(
  id: number
): Promise<DefaultResponse> {
  const mutation = `
    mutation($id: Int!) {
      users {
        deactivate(id: $id) {
          responseResult {
            succeeded
            errorCode
            slug
            message
          }
        }
      }
    }
  `;

  const result = await graphql<{ users: { deactivate: DefaultResponse } }>(
    mutation,
    { id }
  );

  return result.users.deactivate;
}

export async function verifyUser(
  id: number
): Promise<DefaultResponse> {
  const mutation = `
    mutation($id: Int!) {
      users {
        verify(id: $id) {
          responseResult {
            succeeded
            errorCode
            slug
            message
          }
        }
      }
    }
  `;

  const result = await graphql<{ users: { verify: DefaultResponse } }>(
    mutation,
    { id }
  );

  return result.users.verify;
}

export async function enable2FA(
  id: number
): Promise<DefaultResponse> {
  const mutation = `
    mutation($id: Int!) {
      users {
        enableTFA(id: $id) {
          responseResult {
            succeeded
            errorCode
            slug
            message
          }
        }
      }
    }
  `;

  const result = await graphql<{ users: { enableTFA: DefaultResponse } }>(
    mutation,
    { id }
  );

  return result.users.enableTFA;
}

export async function disable2FA(
  id: number
): Promise<DefaultResponse> {
  const mutation = `
    mutation($id: Int!) {
      users {
        disableTFA(id: $id) {
          responseResult {
            succeeded
            errorCode
            slug
            message
          }
        }
      }
    }
  `;

  const result = await graphql<{ users: { disableTFA: DefaultResponse } }>(
    mutation,
    { id }
  );

  return result.users.disableTFA;
}

export async function resetPassword(
  id: number
): Promise<DefaultResponse> {
  const mutation = `
    mutation($id: Int!) {
      users {
        resetPassword(id: $id) {
          responseResult {
            succeeded
            errorCode
            slug
            message
          }
        }
      }
    }
  `;

  const result = await graphql<{ users: { resetPassword: DefaultResponse } }>(
    mutation,
    { id }
  );

  return result.users.resetPassword;
}