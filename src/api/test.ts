/**
 * Test API connection by making a simple GraphQL query with provided credentials
 * Returns true if connection is successful, throws error if not
 */
export async function testConnection(url: string, apiKey: string): Promise<boolean> {
  const query = `query {
    pages {
      list(limit: 1) {
        id
      }
    }
  }`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json() as { data?: { pages?: { list?: unknown } }; errors?: { message: string }[] };

  if (result.errors?.length) {
    throw new Error(result.errors.map((e) => e.message).join(", "));
  }

  if (result.data?.pages?.list === undefined) {
    throw new Error("Unexpected response format");
  }

  return true;
}