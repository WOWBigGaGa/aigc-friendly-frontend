export interface GraphQLErrorDetail {
  message: string;
  errorCode?: string;
}

export function parseGraphQLError(error: unknown): GraphQLErrorDetail {
  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message);
      if (parsed?.errors?.[0]?.message) {
        return {
          message: parsed.errors[0].message,
          errorCode: parsed.errors[0]?.extensions?.code,
        };
      }
    } catch {
      // Ignore JSON parse error
    }
    return { message: error.message };
  }
  return { message: '未知错误' };
}

export function getErrorMessage(error: unknown): string {
  const parsed = parseGraphQLError(error);
  return parsed.message;
}
