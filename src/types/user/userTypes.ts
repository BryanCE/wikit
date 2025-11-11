import type { GroupMinimal } from "../group/groupTypes";

export interface UserMinimal {
  id: number;
  name: string;
  email: string;
  providerKey: string;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  providerKey: string;
  providerName?: string;
  providerId?: string;
  providerIs2FACapable?: boolean;
  isSystem: boolean;
  isActive: boolean;
  isVerified: boolean;
  location: string;
  jobTitle: string;
  timezone: string;
  dateFormat: string;
  appearance: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  tfaIsActive: boolean;
  groups: GroupMinimal[];
}

export interface UserLastLogin {
  id: number;
  name: string;
  lastLoginAt: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  providerKey?: string;
  providerName?: string;
  isSystem: boolean;
  isVerified: boolean;
  location: string;
  jobTitle: string;
  timezone: string;
  dateFormat: string;
  appearance: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  groups: string[];
  pagesTotal: number;
}

export interface ResponseStatus {
  succeeded: boolean;
  errorCode: number;
  slug: string;
  message: string;
}

export interface UserResponse {
  responseResult: ResponseStatus;
  user?: User;
}

export interface DefaultResponse {
  responseResult: ResponseStatus;
}

export interface CreateUserInput {
  email: string;
  name: string;
  passwordRaw?: string;
  providerKey: string;
  groups: number[];
  mustChangePassword?: boolean;
  sendWelcomeEmail?: boolean;
}

export interface UpdateUserInput {
  id: number;
  email?: string;
  name?: string;
  newPassword?: string;
  groups?: number[];
  location?: string;
  jobTitle?: string;
  timezone?: string;
  dateFormat?: string;
  appearance?: string;
}

export interface UserListOptions {
  filter?: string;
  orderBy?: string;
}

export interface UserCommandOptions {
  instance?: string;
}
