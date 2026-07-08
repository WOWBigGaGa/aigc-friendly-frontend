import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { executeGraphQL } from '@/shared/graphql';

import { type Article } from './article-card';
import { ArticleList } from './article-list';

vi.mock('antd', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  const ListItem = ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="list-item">{children}</div>
  );
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
    List: Object.assign(
      ({
        dataSource,
        renderItem,
      }: {
        dataSource: unknown[];
        renderItem: (item: unknown, index: number) => React.ReactNode;
      }) => (
        <div data-testid="list">{dataSource.map((item, index) => renderItem(item, index))}</div>
      ),
      { Item: ListItem },
    ),
    Pagination: ({
      current,
      total,
      onChange,
      showTotal,
    }: {
      current?: number;
      total?: number;
      onChange?: (page: number) => void;
      showTotal?: (total: number) => string;
    }) => (
      <div data-testid="pagination">
        <button data-testid="pagination-prev" onClick={() => onChange?.(current! - 1)}>
          Prev
        </button>
        <span data-testid="pagination-current">{current}</span>
        <button data-testid="pagination-next" onClick={() => onChange?.(current! + 1)}>
          Next
        </button>
        {showTotal && <span data-testid="pagination-total">{showTotal(total!)}</span>}
      </div>
    ),
    Spin: () => <div data-testid="spin">Loading...</div>,
    Card: ({ children }: { children?: React.ReactNode }) => (
      <div data-testid="card">{children}</div>
    ),
    Tag: ({ children }: { children?: React.ReactNode }) => (
      <span data-testid="tag">{children}</span>
    ),
    Avatar: ({ icon }: { icon?: React.ReactNode }) => <span data-testid="avatar">{icon}</span>,
  };
});

vi.mock('@ant-design/icons', () => ({
  ClockCircleOutlined: () => <span data-testid="clock-icon" />,
  EyeOutlined: () => <span data-testid="eye-icon" />,
  HeartOutlined: () => <span data-testid="heart-icon" />,
}));

vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('@/shared/graphql', () => ({
  executeGraphQL: vi.fn(),
}));

vi.mock('@/features/blog', () => ({
  GET_ARTICLES: {
    loc: {
      source: {
        body: 'mock query',
      },
    },
  },
}));

const createArticles = (count: number, options: { pinned?: boolean } = {}): Article[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `article-${i + 1}`,
    title: `Article ${i + 1}`,
    slug: `article-${i + 1}`,
    excerpt: `Excerpt for article ${i + 1}`,
    content: `Content for article ${i + 1}`,
    viewCount: 100 + i,
    likeCount: 10 + i,
    publishedAt: `2024-01-${15 + i}T10:30:00Z`,
    category: {
      id: `category-${i + 1}`,
      name: `Category ${i + 1}`,
      slug: `category-${i + 1}`,
    },
    tags: [{ id: `tag-${i + 1}`, name: `Tag ${i + 1}`, slug: `tag-${i + 1}` }],
    isPinned: options.pinned ?? false,
  }));
};

const createMockResponse = (articles: Article[], page = 1, pageSize = 10, total = 10) => ({
  articles: {
    data: articles,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  },
});

describe('ArticleList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(executeGraphQL).mockResolvedValue(createMockResponse(createArticles(5)));
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

  it('renders loading state initially', async () => {
    render(
      <MemoryRouter>
        <ArticleList />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('spin')).toBeInTheDocument();
  });

  it('renders articles when data is loaded successfully', async () => {
    const articles = createArticles(3);
    vi.mocked(executeGraphQL).mockResolvedValue(createMockResponse(articles));

    render(
      <MemoryRouter>
        <ArticleList />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
    });

    expect(screen.getByText('最新文章')).toBeInTheDocument();
    expect(screen.getByText('Article 1')).toBeInTheDocument();
    expect(screen.getByText('Article 2')).toBeInTheDocument();
    expect(screen.getByText('Article 3')).toBeInTheDocument();
  });

  it('renders pinned articles separately', async () => {
    const pinnedArticles = createArticles(2, { pinned: true });
    const normalArticles = createArticles(3, { pinned: false });
    const allArticles = [...pinnedArticles, ...normalArticles];

    vi.mocked(executeGraphQL).mockResolvedValue(createMockResponse(allArticles));

    render(
      <MemoryRouter>
        <ArticleList />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
    });

    expect(screen.getByText('置顶文章')).toBeInTheDocument();
    expect(screen.getByText('最新文章')).toBeInTheDocument();
  });

  it('does not render pinned section when no pinned articles', async () => {
    const articles = createArticles(3, { pinned: false });
    vi.mocked(executeGraphQL).mockResolvedValue(createMockResponse(articles));

    render(
      <MemoryRouter>
        <ArticleList />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
    });

    expect(screen.queryByText('置顶文章')).not.toBeInTheDocument();
    expect(screen.getByText('最新文章')).toBeInTheDocument();
  });

  it('renders empty state when no articles', async () => {
    vi.mocked(executeGraphQL).mockResolvedValue(createMockResponse([], 1, 10, 0));

    render(
      <MemoryRouter>
        <ArticleList />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('alert')).toHaveAttribute('data-type', 'info');
    expect(screen.getByTestId('alert-message')).toHaveTextContent('暂无文章');
    expect(screen.getByTestId('alert-description')).toHaveTextContent('还没有发布任何文章');
  });

  it('renders error state when API call fails', async () => {
    vi.mocked(executeGraphQL).mockRejectedValue(new Error('Network error'));

    render(
      <MemoryRouter>
        <ArticleList />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('alert')).toHaveAttribute('data-type', 'error');
    expect(screen.getByTestId('alert-message')).toHaveTextContent('加载失败');
    expect(screen.getByTestId('alert-description')).toHaveTextContent(
      '文章列表加载失败，请稍后重试',
    );
  });

  it('renders pagination when totalPages > 1', async () => {
    const articles = createArticles(5);
    vi.mocked(executeGraphQL).mockResolvedValue(createMockResponse(articles, 1, 5, 15));

    render(
      <MemoryRouter>
        <ArticleList />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('pagination')).toBeInTheDocument();
    expect(screen.getByTestId('pagination-current')).toHaveTextContent('1');
    expect(screen.getByTestId('pagination-total')).toHaveTextContent('共 15 篇文章');
  });

  it('does not render pagination when totalPages <= 1', async () => {
    const articles = createArticles(3);
    vi.mocked(executeGraphQL).mockResolvedValue(createMockResponse(articles, 1, 10, 3));

    render(
      <MemoryRouter>
        <ArticleList />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
    });

    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
  });

  it('calls onPageChange when pagination is clicked', async () => {
    const articles = createArticles(5);
    vi.mocked(executeGraphQL).mockResolvedValue(createMockResponse(articles, 1, 5, 15));

    const onPageChange = vi.fn();

    render(
      <MemoryRouter>
        <ArticleList onPageChange={onPageChange} />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('pagination-next'));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('fetches data with correct page and pageSize parameters', async () => {
    render(
      <MemoryRouter>
        <ArticleList page={2} pageSize={20} />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(executeGraphQL).toHaveBeenCalled();
    });

    expect(executeGraphQL).toHaveBeenCalledWith('mock query', { page: 2, pageSize: 20 });
  });

  it('refetches data when page changes', async () => {
    const articles1 = createArticles(2);
    const articles2 = createArticles(2).map((a) => ({
      ...a,
      title: `${a.title} (page 2)`,
    }));

    vi.mocked(executeGraphQL)
      .mockResolvedValueOnce(createMockResponse(articles1, 1, 2, 4))
      .mockResolvedValueOnce(createMockResponse(articles2, 2, 2, 4));

    const { rerender } = render(
      <MemoryRouter>
        <ArticleList page={1} pageSize={2} />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Article 1')).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <ArticleList page={2} pageSize={2} />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Article 1 (page 2)')).toBeInTheDocument();
    expect(executeGraphQL).toHaveBeenCalledTimes(2);
    expect(executeGraphQL).toHaveBeenLastCalledWith('mock query', { page: 2, pageSize: 2 });
  });
});
