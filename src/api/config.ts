import { graphql } from "@/api";
import type {
  SiteConfig,
  ThemeConfig,
  LocalizationConfig,
  UserSummary,
  AssetInfo,
  SystemInfo
} from "@/types";

export async function getSiteConfig(instance?: string): Promise<SiteConfig> {
  const query = `query {
    site {
      config {
        host
        title
        description
        company
        contentLicense
        logoUrl
        authAutoLogin
        authEnforce2FA
        authHideLocal
        featurePageRatings
        featurePageComments
        featurePersonalWikis
        uploadMaxFileSize
        uploadMaxFiles
        uploadScanSVG
        uploadForceDownload
      }
    }
  }`;

  const result = await graphql<{ site: { config: SiteConfig } }>(query, undefined, instance);
  return result.site.config;
}

export async function getThemeConfig(instance?: string): Promise<ThemeConfig> {
  const query = `query {
    theming {
      config {
        theme
        iconset
        darkMode
        tocPosition
        injectCSS
        injectHead
        injectBody
      }
    }
  }`;

  const result = await graphql<{ theming: { config: ThemeConfig } }>(query, undefined, instance);
  return result.theming.config;
}

export async function getLocalizationConfig(instance?: string): Promise<LocalizationConfig> {
  const query = `query {
    localization {
      config {
        locale
        autoUpdate
        namespacing
        namespaces
      }
    }
  }`;

  const result = await graphql<{ localization: { config: LocalizationConfig } }>(query, undefined, instance);
  return result.localization.config;
}

export async function getUserSummary(instance?: string): Promise<UserSummary> {
  const query = `query {
    users {
      list {
        id
        isActive
      }
    }
    groups {
      list {
        name
        userCount
        isSystem
      }
    }
  }`;

  const result = await graphql<{
    users: {
      list: Array<{
        id: string;
        isActive: boolean;
      }>;
    };
    groups: {
      list: Array<{
        name: string;
        userCount: number;
        isSystem: boolean;
      }>;
    };
  }>(query, undefined, instance);

  const users = result.users.list;
  const adminGroups = result.groups.list.filter(group =>
    group.name.toLowerCase().includes('admin')
  );

  const adminUsers = adminGroups.reduce((total, group) => total + (group.userCount ?? 0), 0);

  return {
    totalUsers: users.length,
    activeUsers: users.filter(user => user.isActive).length,
    adminUsers,
  };
}

export async function getAssetInfo(instance?: string): Promise<AssetInfo> {
  const query = `query {
    site {
      config {
        logoUrl
      }
    }
    theming {
      config {
        injectCSS
        injectHead
      }
    }
  }`;

  const result = await graphql<{
    site: { config: { logoUrl: string } };
    theming: { config: { injectCSS: string; injectHead: string } };
  }>(query, undefined, instance);

  return {
    logoUrl: result.site.config.logoUrl,
    customCss: result.theming.config.injectCSS,
    customJs: result.theming.config.injectHead,
  };
}

export async function getSystemInfo(instance?: string): Promise<SystemInfo> {
  const query = `query {
    system {
      info {
        currentVersion
        latestVersion
        platform
        operatingSystem
        nodeVersion
        dbType
        dbVersion
        hostname
        pagesTotal
        usersTotal
        groupsTotal
        tagsTotal
        cpuCores
        ramTotal
        workingDirectory
        upgradeCapable
        telemetry
      }
    }
  }`;

  const result = await graphql<{ system: { info: SystemInfo } }>(query, undefined, instance);
  return result.system.info;
}

