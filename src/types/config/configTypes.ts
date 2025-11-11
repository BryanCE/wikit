export interface ConfigOptions {
  list?: boolean;
  add?: boolean;
  edit?: string;
  remove?: string;
  test?: string;
  setup?: boolean;
  migrate?: boolean;
  export?: boolean;
  import?: string;
  reset?: boolean;
  status?: boolean;
  dryRun?: boolean;
  overwrite?: boolean;
}

export interface SiteConfig {
  host: string;
  title: string;
  description: string;
  company: string;
  contentLicense: string;
  logoUrl: string;
  authAutoLogin: boolean;
  authEnforce2FA: boolean;
  authHideLocal: boolean;
  featurePageRatings: boolean;
  featurePageComments: boolean;
  featurePersonalWikis: boolean;
  uploadMaxFileSize: number;
  uploadMaxFiles: number;
  uploadScanSVG: boolean;
  uploadForceDownload: boolean;
  [key: string]: unknown;
}

export interface ThemeConfig {
  theme: string;
  iconset: string;
  darkMode: boolean;
  tocPosition: string;
  injectCSS: string;
  injectHead: string;
  injectBody: string;
  [key: string]: unknown;
}

export interface LocalizationConfig {
  locale: string;
  autoUpdate: boolean;
  namespacing: boolean;
  namespaces: string[];
  [key: string]: unknown;
}

export interface UserSummary {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  [key: string]: unknown;
}

export interface AssetInfo {
  logoUrl: string;
  customCss?: string;
  customJs?: string;
  [key: string]: unknown;
}

export interface SystemInfo {
  currentVersion: string;
  latestVersion: string;
  platform: string;
  operatingSystem: string;
  nodeVersion: string;
  dbType: string;
  dbVersion: string;
  hostname: string;
  pagesTotal: number;
  usersTotal: number;
  groupsTotal: number;
  tagsTotal: number;
  cpuCores: number;
  ramTotal: string;
  workingDirectory: string;
  upgradeCapable: boolean;
  telemetry: boolean;
  [key: string]: unknown;
}
