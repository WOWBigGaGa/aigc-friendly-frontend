import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { executeGraphQL } from '@/shared/graphql';

import { BlogLinksPage } from '../index';

vi.mock('antd', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Alert: ({
      message,
      description,
      type,
    }: {
      message?: string;
      description?: string;
      type?: 'error' | 'info';
    }) => (
      <div data-testid="alert" data-type={type}>
        <span data-testid="alert-message">{message}</span>
        {description && <span data-testid="alert-description">{description}</span>}
      </div>
    ),
    Card: ({
      hoverable,
      onClick,
      children,
    }: {
      hoverable?: boolean;
      onClick?: () => void;
      children?: React.ReactNode;
    }) => (
      <div data-testid="card" data-hoverable={hoverable} onClick={onClick}>
        {children}
      </div>
    ),
    Spin: () => <div data-testid="spin">Loading...</div>,
    Typography: {
      Title: ({ level, children }: { level?: number; children?: React.ReactNode }) => {
        const TagName = level === 1 ? 'h1' : level === 2 ? 'h2' : level === 3 ? 'h3' : 'h4';
        return <TagName data-testid={`title-${level}`}>{children}</TagName>;
      },
      Paragraph: ({ children }: { children?: React.ReactNode }) => (
        <p data-testid="paragraph">{children}</p>
      ),
    },
  };
});

vi.mock('@/shared/graphql', () => ({
  executeGraphQL: vi.fn(),
}));

vi.mock('@/features/blog', () => ({
  GET_FRIEND_LINKS: {
    loc: {
      source: {
        body: 'mock friend links query',
      },
    },
  },
}));

const mockFriendLinks = [
  {
    id: 'link-1',
    name: 'Test Blog',
    url: 'https://test.com',
    description: 'A test blog description',
    logo: 'https://test.com/logo.png',
    sort: 0,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'link-2',
    name: 'Another Blog',
    url: 'https://another.com',
    description: null,
    logo: null,
    sort: 1,
    isActive: true,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 'link-3',
    name: 'Inactive Blog',
    url: 'https://inactive.com',
    description: 'This blog is inactive',
    logo: null,
    sort: 2,
    isActive: false,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
];

describe('BlogLinksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(executeGraphQL).mockResolvedValue({ friendLinks: mockFriendLinks });
    window.matchMedia = vi.fn().mockImplementation(
      (query) =>
        ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as unknown as MediaQueryList,
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should render loading state initially', async () => {
    render(
      <MemoryRouter>
        <BlogLinksPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('spin')).toBeInTheDocument();
  });

  it('should render friend links when data is loaded successfully', async () => {
    render(
      <MemoryRouter>
        <BlogLinksPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('title-2')).toHaveTextContent('友情链接');
    expect(screen.getByText('Test Blog')).toBeInTheDocument();
    expect(screen.getByText('Another Blog')).toBeInTheDocument();
  });

  it('should filter out inactive friend links', async () => {
    render(
      <MemoryRouter>
        <BlogLinksPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
    });

    expect(screen.queryByText('Inactive Blog')).not.toBeInTheDocument();
  });

  it('should render empty state when no active friend links', async () => {
    vi.mocked(executeGraphQL).mockResolvedValue({
      friendLinks: [{ ...mockFriendLinks[0], isActive: false }],
    });

    render(
      <MemoryRouter>
        <BlogLinksPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
    });

    expect(screen.getByText('暂无友链，期待您的加入！')).toBeInTheDocument();
  });

  it('should render error state when API call fails', async () => {
    vi.mocked(executeGraphQL).mockRejectedValue(new Error('Network error'));

    render(
      <MemoryRouter>
        <BlogLinksPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('alert')).toHaveAttribute('data-type', 'error');
    expect(screen.getByTestId('alert-message')).toHaveTextContent('加载失败');
    expect(screen.getByTestId('alert-description')).toHaveTextContent(
      '友链列表加载失败，请稍后重试',
    );
  });

  it('should render friend link cards', async () => {
    render(
      <MemoryRouter>
        <BlogLinksPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
    });

    const cards = screen.getAllByTestId('card');
    expect(cards.length).toBe(3);
  });

  it('should call executeGraphQL with correct query', async () => {
    render(
      <MemoryRouter>
        <BlogLinksPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(executeGraphQL).toHaveBeenCalled();
    });

    expect(executeGraphQL).toHaveBeenCalledWith('mock friend links query', {});
  });
});
