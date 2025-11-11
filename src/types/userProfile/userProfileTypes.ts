// Standard Wiki.js User types for import/export
export interface UserImportRow {
  email: string;
  name: string;
  providerKey?: string;
  location?: string;
  jobTitle?: string;
  timezone?: string;
  dateFormat?: string;
  appearance?: string;
  groups?: number[];
}

export interface UserImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export interface UserImportExportOptions {
  instance?: string;
}
