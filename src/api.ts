import { getDynamicConfig } from "@/config/dynamicConfig";
import { logger } from "@/utils/logger";
import { InstanceContext } from "@/contexts/InstanceContext";
import type { PageLinkItem } from "@/types/analysis/analysisTypes";
import type { Page } from "@/types/page/pageTypes";

interface GraphQLError {
  message: string;
}

interface GraphQLResponse<T> {
  data: T;
  errors?: GraphQLError[];
}

export async function graphql<TData, TVars = Record<string, unknown>>(
  query: string,
  variables?: TVars
): Promise<TData> {
  const instance = InstanceContext.getInstance();
  const queryPreview = query.trim().split('\n')[0]?.slice(0, 100) ?? "";
  logger.info({ instance, queryPreview, variables }, "GraphQL request starting");

  const config = await getDynamicConfig(instance);

  try {
    const res = await fetch(config.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.key}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      logger.error({ instance, status: res.status, errorText, queryPreview }, "GraphQL fetch failed");
      throw new Error(`GraphQL error ${res.status}: ${errorText}`);
    }

    // 👇 Cast result into GraphQLResponse<T>
    const json = (await res.json()) as GraphQLResponse<TData>;

    if (json.errors?.length) {
      logger.error({ instance, errors: json.errors, queryPreview }, "GraphQL returned errors");
      throw new Error(
        `GraphQL errors:\n${json.errors.map((e) => e.message).join("\n")}`
      );
    }

    logger.info({ instance, queryPreview }, "GraphQL request succeeded");
    return json.data;
  } catch (error) {
    logger.error({ err: error, instance, queryPreview, variables }, "GraphQL request failed with exception");
    throw error;
  }
}

export async function getPageLinks(): Promise<PageLinkItem[]> {
  const query = `
    query {
      pages {
        links(locale: "en") {
          id
          path
          title
          links
        }
      }
    }
  `;

  const data = await graphql<{ pages: { links: PageLinkItem[] } }>(query, {});
  return data.pages.links;
}

export async function getAllPages(): Promise<Page[]> {
  const query = `
    query {
      pages {
        list {
          id
          path
          title
          isPublished
          isPrivate
          locale
          contentType
          createdAt
          updatedAt
        }
      }
    }
  `;

  const data = await graphql<{ pages: { list: Page[] } }>(query, {});
  return data.pages.list;
}
