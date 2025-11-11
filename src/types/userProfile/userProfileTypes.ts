export interface TeamMember {
  id: number;
  name: string;
  email: string;
  pictureUrl?: string;
  jobTitle?: string;
  location?: string;
  portfolio?: string;
  team?: string;
  birthday?: string;
  bio?: string;
  hire_date?: string;
  role?: string;
}

export interface ProfileImportRow {
  email: string;
  portfolio?: string;
  team?: string;
  birthday?: string;
  bio?: string;
  hire_date?: string;
  role?: string;
}

export interface ProfileImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export interface ProfileCommandOptions {
  instance?: string;
}
