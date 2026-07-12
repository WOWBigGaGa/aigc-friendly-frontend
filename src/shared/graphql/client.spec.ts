import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { configureGraphQLRuntime, getGraphQLClient, getGraphQLRuntimeConfig } from './client';

describe('GraphQL Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('configureGraphQLRuntime sets runtime config', () => {
    const mockGetAccessToken = vi.fn(() => 'test-token');
    const mockRefreshSession = vi.fn();
    const mockOnAuthFailure = vi.fn();

    configureGraphQLRuntime({
      getAccessToken: mockGetAccessToken,
      refreshSession: mockRefreshSession,
      onAuthFailure: mockOnAuthFailure,
    });

    const config = getGraphQLRuntimeConfig();

    expect(config.getAccessToken).toBe(mockGetAccessToken);
    expect(config.refreshSession).toBe(mockRefreshSession);
    expect(config.onAuthFailure).toBe(mockOnAuthFailure);
  });

  it('configureGraphQLRuntime merges with existing config', () => {
    const mockGetAccessToken1 = vi.fn(() => 'token1');
    const mockRefreshSession1 = vi.fn();

    configureGraphQLRuntime({
      getAccessToken: mockGetAccessToken1,
      refreshSession: mockRefreshSession1,
    });

    const mockGetAccessToken2 = vi.fn(() => 'token2');

    configureGraphQLRuntime({
      getAccessToken: mockGetAccessToken2,
    });

    const config = getGraphQLRuntimeConfig();

    expect(config.getAccessToken).toBe(mockGetAccessToken2);
    expect(config.refreshSession).toBe(mockRefreshSession1);
  });

  it('getGraphQLRuntimeConfig returns config after configuration', () => {
    configureGraphQLRuntime({
      getAccessToken: vi.fn(() => 'token'),
    });

    const config = getGraphQLRuntimeConfig();

    expect(config).toBeDefined();
    expect(typeof config.getAccessToken).toBe('function');
  });

  it('getGraphQLClient creates a new client on first call', () => {
    const client = getGraphQLClient();

    expect(client).toBeDefined();
    expect(typeof client.query).toBe('function');
    expect(typeof client.mutate).toBe('function');
  });

  it('getGraphQLClient returns the same instance on subsequent calls', () => {
    const client1 = getGraphQLClient();
    const client2 = getGraphQLClient();

    expect(client1).toBe(client2);
  });

  describe('Cache Configuration', () => {
    it('client has cache with typePolicies', () => {
      const client = getGraphQLClient();
      const cache = client.cache;

      expect(cache).toBeDefined();
      expect(typeof cache.readQuery).toBe('function');
      expect(typeof cache.writeQuery).toBe('function');
    });
  });
});
