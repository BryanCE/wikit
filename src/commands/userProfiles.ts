import * as fs from "fs";
import * as path from "path";
import * as userProfilesApi from "@/api/userProfiles";
import type { ProfileImportRow, ProfileCommandOptions } from "@/types";
import { logger } from "@/utils/logger";

function parseCSV(content: string): ProfileImportRow[] {
  const lines = content.trim().split("\n");
  if (lines.length === 0) {
    throw new Error("CSV file is empty");
  }

  const headerLine = lines[0];
  if (!headerLine) {
    throw new Error("CSV file has no header row");
  }
  const headers = headerLine.split(",").map((h) => h.trim().toLowerCase());
  const emailIndex = headers.indexOf("email");

  if (emailIndex === -1) {
    throw new Error("CSV must have an 'email' column");
  }

  const teamIndex = headers.indexOf("team");
  const birthdayIndex = headers.indexOf("birthday");
  const bioIndex = headers.indexOf("bio");
  const hireDateIndex = headers.indexOf("hire_date");
  const roleIndex = headers.indexOf("role");

  const profiles: ProfileImportRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine) continue;
    const line = rawLine.trim();
    if (!line) continue;

    const values = line.split(",").map((v) => v.trim());
    const email = values[emailIndex];
    if (!email) continue;

    const profile: ProfileImportRow = {
      email,
    };

    if (teamIndex !== -1 && values[teamIndex]) {
      profile.team = values[teamIndex];
    }
    if (birthdayIndex !== -1 && values[birthdayIndex]) {
      profile.birthday = values[birthdayIndex];
    }
    if (bioIndex !== -1 && values[bioIndex]) {
      profile.bio = values[bioIndex];
    }
    if (hireDateIndex !== -1 && values[hireDateIndex]) {
      profile.hire_date = values[hireDateIndex];
    }
    if (roleIndex !== -1 && values[roleIndex]) {
      profile.role = values[roleIndex];
    }

    profiles.push(profile);
  }

  return profiles;
}

function parseJSON(content: string): ProfileImportRow[] {
  const data: unknown = JSON.parse(content);

  if (!Array.isArray(data)) {
    throw new Error("JSON must be an array of profile objects");
  }

  return data.map((item: unknown) => {
    if (typeof item !== "object" || item === null) {
      throw new Error("Each item must be an object");
    }

    const obj = item as Record<string, unknown>;

    if (typeof obj.email !== "string") {
      throw new Error("Each profile must have an email field");
    }

    return {
      email: obj.email,
      team: typeof obj.team === "string" ? obj.team : undefined,
      birthday: typeof obj.birthday === "string" ? obj.birthday : undefined,
      bio: typeof obj.bio === "string" ? obj.bio : undefined,
      hire_date: typeof obj.hire_date === "string" ? obj.hire_date : undefined,
      role: typeof obj.role === "string" ? obj.role : undefined,
    };
  });
}

export async function listTeamMembersCommand(
  options: ProfileCommandOptions
): Promise<void> {
  const members = await userProfilesApi.getTeamMembers(options.instance);

  if (members.length === 0) {
    console.log("No team members found");
    return;
  }

  console.log(`\nFound ${members.length} team member(s):\n`);
  console.log(
    "ID".padEnd(6) +
    "Name".padEnd(25) +
    "Email".padEnd(30) +
    "Team".padEnd(20) +
    "Birthday".padEnd(12) +
    "Hire Date".padEnd(12) +
    "Role"
  );
  console.log("-".repeat(125));

  for (const member of members) {
    console.log(
      String(member.id).padEnd(6) +
      member.name.padEnd(25) +
      member.email.padEnd(30) +
      (member.team ?? "").padEnd(20) +
      (member.birthday ?? "").padEnd(12) +
      (member.hire_date ?? "").padEnd(12) +
      (member.role ?? "")
    );
  }
  console.log();
}

export async function importProfilesCommand(
  filePath: string,
  options: ProfileCommandOptions & { dryRun?: boolean }
): Promise<void> {
  const fullPath = path.resolve(filePath);

  if (!fs.existsSync(fullPath)) {
    logger.error({ filePath: fullPath }, "File not found");
    console.error(`Error: File not found: ${fullPath}`);
    return;
  }

  const content = fs.readFileSync(fullPath, "utf-8");
  const ext = path.extname(fullPath).toLowerCase();

  let profiles: ProfileImportRow[];

  try {
    if (ext === ".csv") {
      profiles = parseCSV(content);
    } else if (ext === ".json") {
      profiles = parseJSON(content);
    } else {
      console.error(`Error: Unsupported file format: ${ext}. Use .csv or .json`);
      return;
    }
  } catch (err) {
    logger.error({ err, filePath }, "Failed to parse file");
    console.error(`Error parsing file: ${err instanceof Error ? err.message : String(err)}`);
    return;
  }

  console.log(`\nParsed ${profiles.length} profile(s) from ${path.basename(filePath)}\n`);

  if (options.dryRun) {
    console.log("DRY RUN - No changes will be made\n");
    console.log("Profiles to import:\n");
    for (const profile of profiles) {
      console.log(`  Email:     ${profile.email}`);
      if (profile.team) console.log(`  Team:      ${profile.team}`);
      if (profile.birthday) console.log(`  Birthday:  ${profile.birthday}`);
      if (profile.hire_date) console.log(`  Hire Date: ${profile.hire_date}`);
      if (profile.role) console.log(`  Role:      ${profile.role}`);
      if (profile.bio) console.log(`  Bio:       ${profile.bio.substring(0, 50)}...`);
      console.log();
    }
    return;
  }

  console.log("Importing profiles...\n");

  const result = await userProfilesApi.importProfiles(profiles, options.instance);

  console.log(`\nImport complete:`);
  console.log(`  Success: ${result.success}`);
  console.log(`  Failed:  ${result.failed}`);

  if (result.errors.length > 0) {
    console.log("\nErrors:");
    for (const error of result.errors) {
      console.log(`  - ${error}`);
    }
  }
  console.log();
}

export async function updateProfileCommand(
  userId: number,
  options: ProfileCommandOptions & {
    team?: string;
    birthday?: string;
    bio?: string;
    hireDate?: string;
    role?: string;
  }
): Promise<void> {
  const profileData: {
    team?: string;
    birthday?: string;
    bio?: string;
    hire_date?: string;
    role?: string;
  } = {};

  if (options.team !== undefined) profileData.team = options.team;
  if (options.birthday !== undefined) profileData.birthday = options.birthday;
  if (options.bio !== undefined) profileData.bio = options.bio;
  if (options.hireDate !== undefined) profileData.hire_date = options.hireDate;
  if (options.role !== undefined) profileData.role = options.role;

  if (Object.keys(profileData).length === 0) {
    console.error("Error: No profile fields specified to update");
    console.log("\nAvailable fields:");
    console.log("  --team <name>        Team name");
    console.log("  --birthday <date>    Birthday (YYYY-MM-DD)");
    console.log("  --bio <text>         Biography");
    console.log("  --hire-date <date>   Hire date (YYYY-MM-DD)");
    console.log("  --role <title>       Role title");
    return;
  }

  try {
    await userProfilesApi.updateUserProfile(userId, profileData, options.instance);
    console.log(`\nProfile updated successfully for user ${userId}`);

    console.log("\nUpdated fields:");
    if (profileData.team) console.log(`  Team:      ${profileData.team}`);
    if (profileData.birthday) console.log(`  Birthday:  ${profileData.birthday}`);
    if (profileData.hire_date) console.log(`  Hire Date: ${profileData.hire_date}`);
    if (profileData.role) console.log(`  Role:      ${profileData.role}`);
    if (profileData.bio) console.log(`  Bio:       ${profileData.bio.substring(0, 50)}${profileData.bio.length > 50 ? "..." : ""}`);
    console.log();
  } catch (err) {
    logger.error({ userId, profileData, err }, "Failed to update profile");
    console.error(`\nError updating profile: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

export async function exportProfiles(
  filePath: string,
  options: ProfileCommandOptions & { onProgress?: (msg: string) => void }
): Promise<{ success: boolean; message: string; profileCount?: number }> {
  try {
    options.onProgress?.("Loading profiles...");
    logger.info({ filePath, instance: options.instance }, "Exporting profiles");

    const profiles = await userProfilesApi.getTeamMembers(options.instance);

    options.onProgress?.(`Exporting ${profiles.length} profiles...`);

    const exportData = profiles.map(profile => ({
      email: profile.email,
      portfolio: profile.portfolio,
      team: profile.team,
      birthday: profile.birthday,
      bio: profile.bio,
      hire_date: profile.hire_date,
      role: profile.role,
      name: profile.name,
    }));

    await import("fs/promises").then((fs) =>
      fs.writeFile(filePath, JSON.stringify(exportData, null, 2))
    );

    logger.info({ profileCount: profiles.length, filePath }, "Profiles exported successfully");

    return {
      success: true,
      message: `Successfully exported ${profiles.length} profiles to ${filePath}`,
      profileCount: profiles.length,
    };
  } catch (error) {
    logger.error({ error, filePath }, "Failed to export profiles");
    return {
      success: false,
      message: `Failed to export profiles: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}
