import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/blog', () => ({
  GET_ARTICLES_BY_CATEGORY: {
    loc: {
      source: {
        body: `
          query GetArticlesByCategory($slug: String!, $page: Int, $pageSize: Int) {
            articlesByCategory(slug: $slug, page: $page, pageSize: $pageSize) {
              data {
                id
                title
                slug
                excerpt
                publishedAt
                category {
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
  GET_CATEGORIES: {
    loc: {
      source: {
        body: `
          query GetCategories {
            categories {
              id
              name
              slug
              description
              parentId
            }
          }
        `,
      },
    },
  },
}));

import { executeGraphQL } from '@/shared/graphql';

import { BlogCategoryPage } from './index';

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

describe('BlogCategoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const mockCategories = (slug: string) => ({
    categories:
      slug === 'invalid-category'
        ? []
        : [
            { id: 'cat-1', name: 'Technology', slug: 'technology', description: 'Tech articles' },
            { id: 'cat-2', name: 'Science', slug: 'science', description: 'Science articles' },
          ],
  });

  const mockArticlesByCategory = (slug: string, page: number) => ({
    articlesByCategory: {
      data:
        slug === 'empty-category'
          ? []
          : [
              {
                id: 'article-1',
                title: 'Test Article',
                slug: 'test-article',
                excerpt: 'This is a test article.',
                publishedAt: '2024-01-15T00:00:00Z',
                category: { id: 'cat-1', name: 'Technology', slug: 'technology' },
              },
            ],
      pagination: {
        page,
        pageSize: 10,
        total: slug === 'empty-category' ? 0 : 1,
        totalPages: 1,
      },
    },
  });

  it('renders category name and description', async () => {
    vi.mocked(executeGraphQL).mockImplementation(async () => {
      return mockArticlesByCategory('technology', 1);
    });

    vi.mocked(executeGraphQL).mockResolvedValueOnce(mockArticlesByCategory('technology', 1));
    vi.mocked(executeGraphQL).mockResolvedValueOnce(mockCategories('technology'));

    render(
      <MemoryRouter initialEntries={['/blog/category/technology']}>
        <Routes>
          <Route path="/blog/category/:slug" element={<BlogCategoryPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('title-1')).toHaveTextContent('Technology');
    });

    expect(screen.getByTestId('paragraph')).toHaveTextContent('Tech articles');
    expect(screen.getByTestId('tag')).toHaveTextContent('1 篇文章');
  });

  it('renders article list for category', async () => {
    vi.mocked(executeGraphQL).mockResolvedValueOnce(mockArticlesByCategory('technology', 1));
    vi.mocked(executeGraphQL).mockResolvedValueOnce(mockCategories('technology'));

    render(
      <MemoryRouter initialEntries={['/blog/category/technology']}>
        <Routes>
          <Route path="/blog/category/:slug" element={<BlogCategoryPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('article-list')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Article')).toBeInTheDocument();
    expect(screen.getByText('This is a test article.')).toBeInTheDocument();
  });

  it('renders no articles message when category is empty', async () => {
    vi.mocked(executeGraphQL).mockResolvedValueOnce(mockArticlesByCategory('empty-category', 1));
    vi.mocked(executeGraphQL).mockResolvedValueOnce({
      categories: [{ id: 'cat-3', name: 'Empty', slug: 'empty-category', description: '' }],
    });

    render(
      <MemoryRouter initialEntries={['/blog/category/empty-category']}>
        <Routes>
          <Route path="/blog/category/:slug" element={<BlogCategoryPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('alert')).toBeInTheDocument();
    });

    expect(screen.getByTestId('alert-message')).toHaveTextContent('暂无文章');
  });

  it('renders not found message when category does not exist', async () => {
    vi.mocked(executeGraphQL).mockResolvedValueOnce(mockArticlesByCategory('invalid-category', 1));
    vi.mocked(executeGraphQL).mockResolvedValueOnce(mockCategories('invalid-category'));

    render(
      <MemoryRouter initialEntries={['/blog/category/invalid-category']}>
        <Routes>
          <Route path="/blog/category/:slug" element={<BlogCategoryPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('alert')).toBeInTheDocument();
    });

    expect(screen.getByTestId('alert')).toHaveAttribute('data-type', 'warning');
    expect(screen.getByTestId('alert-message')).toHaveTextContent('分类不存在');
  });

  it('renders error state when API fails', async () => {
    vi.mocked(executeGraphQL).mockRejectedValue(new Error('Network error'));

    render(
      <MemoryRouter initialEntries={['/blog/category/error']}>
        <Routes>
          <Route path="/blog/category/:slug" element={<BlogCategoryPage />} />
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
      return mockArticlesByCategory('technology', 1);
    });

    render(
      <MemoryRouter initialEntries={['/blog/category/technology']}>
        <Routes>
          <Route path="/blog/category/:slug" element={<BlogCategoryPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('spin')).toBeInTheDocument();
  });
});
