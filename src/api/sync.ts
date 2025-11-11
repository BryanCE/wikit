import { graphql } from "@/api";
import type { SiteConfig, ThemeConfig, AssetInfo } from "@/types";

export async function updateSiteConfig(config: SiteConfig, instance?: string) {
  const mutation = `mutation ($title: String!, $company: String!, $language: String!, $contentLicense: String!) {
    site {
      updateConfig(
        title: $title
        company: $company
        language: $language
        contentLicense: $contentLicense
      ) {
        responseResult {
          succeeded
          errorCode
          message
        }
      }
    }
  }`;

  const result = await graphql<{
    site: {
      updateConfig: {
        responseResult: {
          succeeded: boolean;
          errorCode: number;
          message?: string;
        };
      };
    };
  }>(mutation, config, instance);

  return result.site.updateConfig.responseResult;
}

export async function updateThemeConfig(theme: ThemeConfig, instance?: string) {
  const mutation = `mutation ($theme: String!, $iconset: String!, $darkMode: Boolean!, $tocPosition: String, $injectCSS: String, $injectHead: String, $injectBody: String) {
    theming {
      setConfig(
        theme: $theme
        iconset: $iconset
        darkMode: $darkMode
        tocPosition: $tocPosition
        injectCSS: $injectCSS
        injectHead: $injectHead
        injectBody: $injectBody
      ) {
        responseResult {
          succeeded
          errorCode
          message
        }
      }
    }
  }`;

  const result = await graphql<{
    theming: {
      setConfig: {
        responseResult: {
          succeeded: boolean;
          errorCode: number;
          message?: string;
        };
      };
    };
  }>(mutation, theme, instance);

  return result.theming.setConfig.responseResult;
}

export async function updateAssetInfo(assets: AssetInfo, instance?: string) {
  const mutation = `mutation ($logoUrl: String!, $customCss: String, $customJs: String) {
    site {
      updateAssets(
        logoUrl: $logoUrl
        customCss: $customCss
        customJs: $customJs
      ) {
        responseResult {
          succeeded
          errorCode
          message
        }
      }
    }
  }`;

  const result = await graphql<{
    site: {
      updateAssets: {
        responseResult: {
          succeeded: boolean;
          errorCode: number;
          message?: string;
        };
      };
    };
  }>(mutation, assets, instance);

  return result.site.updateAssets.responseResult;
}