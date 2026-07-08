import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/blog', () => ({
  GET_ARTICLES_BY_TAG: {
    loc: {
      source: {
        body: `
          query GetArticlesByTag($slug: String!, $page: Int, $pageSize: Int) {
            articlesByTag(slug: $slug, page: $page, pageSize: $pageSize) {
              data {
                id
                title
                slug
                excerpt
                publishedAt
                tags {
                  id
                  name
                  slug
                }
              }
              pagination {
                page
                pageSize
                total
                totalPages
              }
            }
          }
        `,
      },
    },
  },
  GET_TAGS: {
    loc: {
      source: {
        body: `
          query GetTags {
            tags {
              id
              name
              slug
              description
            }
          }
        `,
      },
    },
  },
}));

import { executeGraphQL } from '@/shared/graphql';

import { BlogTagPage } from './index';

vi.mock('@ant-design/icons', () => ({
  ClockCircleOutlined: () => <span data-testid="clock-icon" />,
}));

vi.mock('antd', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Alert: ({
      message,
      description,
      type,
    }: {
      message?: React.ReactNode;
      description?: React.ReactNode;
      type?: string;
    }) => (
      <div data-testid="alert" data-type={type}>
        <div data-testid="alert-message">{message}</div>
        {description && <div data-testid="alert-description">{description}</div>}
      </div>
    ),
    List: Object.assign(
      ({
        dataSource,
        renderItem,
      }: {
        dataSource?: React.ReactNode[];
        renderItem?: (item: React.ReactNode) => React.ReactNode;
      }) => <div data-testid="article-list">{dataSource?.map(renderItem || ((item) => item))}</div>,
      {
        Item: ({ children }: { children?: React.ReactNode }) => (
          <div data-testid="article-item">{children}</div>
        ),
      },
    ),
    Pagination: ({
      current,
      total,
      onChange,
    }: {
      current?: number;
      total?: number;
      onChange?: (page: number) => void;
    }) => (
      <div data-testid="pagination" data-current={current} data-total={total}>
        <button data-testid="page-next" onClick={() => onChange?.(current ? current + 1 : 2)}>
          Next
        </button>
      </div>
    ),
    Spin: () => <div data-testid="spin" />,
    Tag: ({ children, color }: { children?: React.ReactNode; color?: string }) => (
      <span data-testid="tag" data-color={color}>
        {children}
      </span>
    ),
    Typography: {
      Title: ({ level, children }: { level?: number; children?: React.ReactNode }) => (
        <h1 data-testid={`title-${level}`} data-level={level}>
          {children}
        </h1>
      ),
      Paragraph: ({ children }: { children?: React.ReactNode }) => (
        <p data-testid="paragraph">{children}</p>
      ),
    },
  };
});

vi.mock('@/shared/graphql', () => ({
  executeGraphQL: vi.fn(),
}));

describe('BlogTagPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const mockTags = (slug: string) => ({
    tags:
      slug === 'invalid-tag'
        ? []
        : [
            { id: 'tag-1', name: 'React', slug: 'react', description: 'React articles' },
            {
              id: 'tag-2',
              name: 'TypeScript',
              slug: 'typescript',
              description: 'TypeScript articles',
            },
          ],
  });

  const mockArticlesByTag = (slug: string, page: number) => ({
    articlesByTag: {
      data:
        slug === 'empty-tag'
          ? []
          : [
              {
                id: 'article-1',
                title: 'Test Article',
                slug: 'test-article',
                excerpt: 'This is a test article.',
                publishedAt: '2024-01-15T00:00:00Z',
                tags: [
                  { id: 'tag-1', name: 'React', slug: 'react' },
                  { id: 'tag-2', name: 'TypeScript', slug: 'typescript' },
                ],
              },
            ],
      pagination: {
        page,
        pageSize: 10,
        total: slug === 'empty-tag' ? 0 : 1,
        totalPages: 1,
      },
    },
  });

  it('renders tag name with tag style', async () => {
    vi.mocked(executeGraphQL).mockResolvedValueOnce(mockArticlesByTag('react', 1));
    vi.mocked(executeGraphQL).mockResolvedValueOnce(mockTags('react'));

    render(
      <MemoryRouter initialEntries={['/blog/tag/react']}>
        <Routes>
          <Route path="/blog/tag/:slug" element={<BlogTagPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('title-1')).toBeInTheDocument();
    });

    const tags = screen.getAllByTestId('tag');
    expect(tags.some((tag) => tag.textContent === 'React')).toBe(true);
    expect(screen.getByTestId('paragraph')).toHaveTextContent('React articles');
  });

  it('renders article list with tags for each article', async () => {
    vi.mocked(executeGraphQL).mockResolvedValueOnce(mockArticlesByTag('react', 1));
    vi.mocked(executeGraphQL).mockResolvedValueOnce(mockTags('react'));

    render(
      <MemoryRouter initialEntries={['/blog/tag/react']}>
        <Routes>
          <Route path="/blog/tag/:slug" element={<BlogTagPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('article-list')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Article')).toBeInTheDocument();
    const tags = screen.getAllByTestId('tag');
    expect(tags.some((tag) => tag.textContent === 'React')).toBe(true);
    expect(tags.some((tag) => tag.textContent === 'TypeScript')).toBe(true);
  });

  it('renders no articles message when tag is empty', async () => {
    vi.mocked(executeGraphQL).mockResolvedValueOnce(mockArticlesByTag('empty-tag', 1));
    vi.mocked(executeGraphQL).mockResolvedValueOnce({
      tags: [{ id: 'tag-3', name: 'Empty', slug: 'empty-tag', description: '' }],
    });

    render(
      <MemoryRouter initialEntries={['/blog/tag/empty-tag']}>
        <Routes>
          <Route path="/blog/tag/:slug" element={<BlogTagPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('alert')).toBeInTheDocument();
    });

    expect(screen.getByTestId('alert-message')).toHaveTextContent('暂无文章');
  });

  it('renders not found message when tag does not exist', async () => {
    vi.mocked(executeGraphQL).mockResolvedValueOnce(mockArticlesByTag('invalid-tag', 1));
    vi.mocked(executeGraphQL).mockResolvedValueOnce(mockTags('invalid-tag'));

    render(
      <MemoryRouter initialEntries={['/blog/tag/invalid-tag']}>
        <Routes>
          <Route path="/blog/tag/:slug" element={<BlogTagPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('alert')).toBeInTheDocument();
    });

    expect(screen.getByTestId('alert')).toHaveAttribute('data-type', 'warning');
    expect(screen.getByTestId('alert-message')).toHaveTextContent('标签不存在');
  });

  it('renders error state when API fails', async () => {
    vi.mocked(executeGraphQL).mockRejectedValue(new Error('Network error'));

    render(
      <MemoryRouter initialEntries={['/blog/tag/error']}>
        <Routes>
          <Route path="/blog/tag/:slug" element={<BlogTagPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('alert')).toBeInTheDocument();
    });

    expect(screen.getByTestId('alert')).toHaveAttribute('data-type', 'error');
    expect(screen.getByTestId('alert-message')).toHaveTextContent('加载失败');
  });

  it('renders loading state initially', () => {
    vi.mocked(executeGraphQL).mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return mockArticlesByTag('react', 1);
    });

    render(
      <MemoryRouter initialEntries={['/blog/tag/react']}>
        <Routes>
          <Route path="/blog/tag/:slug" element={<BlogTagPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('spin')).toBeInTheDocument();
  });
});
