import { describe, expect, it } from 'vitest';

import { GraphQLIngressError, isGraphQLIngressError, toGraphQLIngressError } from './errors';

describe('GraphQLIngressError', () => {
  it('should create an error with all required properties', () => {
    const error = new GraphQLIngressError({
      type: 'graphql',
      message: 'Test error',
      statusCode: 500,
      operationName: 'testOperation',
    });

    expect(error.name).toBe('GraphQLIngressError');
    expect(error.type).toBe('graphql');
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(500);
    expect(error.operationName).toBe('testOperation');
    expect(error.isRetryable).toBe(false);
  });

  it('should return correct userMessage for each error type', () => {
    const types: Array<'network' | 'http' | 'graphql' | 'auth' | 'malformed'> = [
      'network',
      'http',
      'graphql',
      'auth',
      'malformed',
    ];

    const expectedMessages = {
      network: '网络连接异常，请稍后重试。',
      http: '服务暂时不可用，请稍后重试。',
      graphql: '请求处理失败，请稍后重试。',
      auth: '登录状态已失效，请重新登录后再试。',
      malformed: '返回结果异常，请稍后重试。',
    };

    types.forEach((type) => {
      const error = new GraphQLIngressError({ type, message: 'Test' });
      expect(error.userMessage).toBe(expectedMessages[type]);
    });
  });

  it('should set isRetryable correctly based on type and statusCode', () => {
    expect(new GraphQLIngressError({ type: 'network', message: 'Test' }).isRetryable).toBe(true);
    expect(
      new GraphQLIngressError({ type: 'http', message: 'Test', statusCode: 500 }).isRetryable,
    ).toBe(true);
    expect(
      new GraphQLIngressError({ type: 'http', message: 'Test', statusCode: 400 }).isRetryable,
    ).toBe(false);
    expect(
      new GraphQLIngressError({ type: 'http', message: 'Test', statusCode: 401 }).isRetryable,
    ).toBe(false);
    expect(new GraphQLIngressError({ type: 'graphql', message: 'Test' }).isRetryable).toBe(false);
    expect(new GraphQLIngressError({ type: 'auth', message: 'Test' }).isRetryable).toBe(false);
    expect(new GraphQLIngressError({ type: 'malformed', message: 'Test' }).isRetryable).toBe(false);
  });
});

describe('isGraphQLIngressError', () => {
  it('should return true for GraphQLIngressError instances', () => {
    const error = new GraphQLIngressError({ type: 'graphql', message: 'Test' });
    expect(isGraphQLIngressError(error)).toBe(true);
  });

  it('should return false for other error types', () => {
    expect(isGraphQLIngressError(new Error('Test'))).toBe(false);
    expect(isGraphQLIngressError(null)).toBe(false);
    expect(isGraphQLIngressError(undefined)).toBe(false);
    expect(isGraphQLIngressError('string')).toBe(false);
  });
});

describe('toGraphQLIngressError', () => {
  it('should return the same error if already a GraphQLIngressError', () => {
    const originalError = new GraphQLIngressError({ type: 'graphql', message: 'Original' });
    const result = toGraphQLIngressError(originalError);

    expect(result).toBe(originalError);
  });

  it('should convert network TypeError to network type', () => {
    const networkError = new TypeError('Failed to fetch');
    const result = toGraphQLIngressError(networkError);

    expect(result.type).toBe('network');
    expect(result.isRetryable).toBe(true);
  });

  it('should convert network error with "NetworkError" message', () => {
    const networkError = new TypeError('NetworkError');
    const result = toGraphQLIngressError(networkError);

    expect(result.type).toBe('network');
    expect(result.isRetryable).toBe(true);
  });

  it('should convert abort error to network type', () => {
    const abortError = new DOMException('Aborted', 'AbortError');
    const result = toGraphQLIngressError(abortError);

    expect(result.type).toBe('network');
    expect(result.isRetryable).toBe(true);
  });

  it('should convert unknown errors to graphql type', () => {
    const unknownError = new Error('Unknown error');
    const result = toGraphQLIngressError(unknownError);

    expect(result.type).toBe('graphql');
    expect(result.message).toBe('Unknown error');
  });

  it('should convert non-error objects to graphql type', () => {
    const result = toGraphQLIngressError('not an error');

    expect(result.type).toBe('graphql');
    expect(result.message).toBe('Unknown GraphQL execution error');
  });

  it('should wrap error with cause', () => {
    const originalError = new Error('Original');
    const result = toGraphQLIngressError(originalError);

    expect(result.cause).toBe(originalError);
  });
});
