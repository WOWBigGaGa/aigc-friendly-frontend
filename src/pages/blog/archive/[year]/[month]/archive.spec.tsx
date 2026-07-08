import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/blog', () => ({
  GET_ARCHIVES: {
    loc: {
      source: {
        body: `
          query GetArchives {
            archives {
              year
              month
              count
            }
          }
        `,
      },
    },
  },
}));

import { executeGraphQL } from '@/shared/graphql';

import { BlogArchivePage } from './index';

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

describe('BlogArchivePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const mockArchives = () => ({
    archives: [
      { year: 2024, month: 1, count: 3 },
      { year: 2024, month: 2, count: 5 },
      { year: 2023, month: 12, count: 2 },
    ],
  });

  const mockArticlesByDate = (year: number, month: number) => ({
    articles: {
      data:
        month === 0
          ? []
          : [
              {
                id: 'article-1',
                title: 'Test Article',
                slug: 'test-article',
                excerpt: 'This is a test article.',
                publishedAt: `${year}-${String(month).padStart(2, '0')}-15T00:00:00Z`,
              },
            ],
      pagination: {
        page: 1,
        pageSize: 10,
        total: month === 0 ? 0 : 1,
        totalPages: 1,
      },
    },
  });

  it('renders year and month in title', async () => {
    vi.mocked(executeGraphQL).mockResolvedValueOnce(mockArticlesByDate(2024, 1));
    vi.mocked(executeGraphQL).mockResolvedValueOnce(mockArchives());

    render(
      <MemoryRouter initialEntries={['/blog/archive/2024/01']}>
        <Routes>
          <Route path="/blog/archive/:year/:month" element={<BlogArchivePage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('title-1')).toHaveTextContent('2024年1月');
    });

    expect(screen.getByTestId('paragraph')).toHaveTextContent('共 3 篇文章');
  });

  it('renders archive directory buttons', async () => {
    vi.mocked(executeGraphQL).mockResolvedValueOnce(mockArticlesByDate(2024, 1));
    vi.mocked(executeGraphQL).mockResolvedValueOnce(mockArchives());

    render(
      <MemoryRouter initialEntries={['/blog/archive/2024/01']}>
        <Routes>
          <Route path="/blog/archive/:year/:month" element={<BlogArchivePage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('2024/01 (3)')).toBeInTheDocument();
    });

    expect(screen.getByText('2024/02 (5)')).toBeInTheDocument();
    expect(screen.getByText('2023/12 (2)')).toBeInTheDocument();
  });

  it('renders article list for specified date', async () => {
    vi.mocked(executeGraphQL).mockResolvedValueOnce(mockArticlesByDate(2024, 1));
    vi.mocked(executeGraphQL).mockResolvedValueOnce(mockArchives());

    render(
      <MemoryRouter initialEntries={['/blog/archive/2024/01']}>
        <Routes>
          <Route path="/blog/archive/:year/:month" element={<BlogArchivePage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('article-list')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Article')).toBeInTheDocument();
    expect(screen.getByText('This is a test article.')).toBeInTheDocument();
  });

  it('renders no articles message when no articles for date', async () => {
    vi.mocked(executeGraphQL).mockResolvedValueOnce(mockArticlesByDate(2024, 0));
    vi.mocked(executeGraphQL).mockResolvedValueOnce({
      archives: [{ year: 2024, month: 0, count: 0 }],
    });

    render(
      <MemoryRouter initialEntries={['/blog/archive/2024/00']}>
        <Routes>
          <Route path="/blog/archive/:year/:month" element={<BlogArchivePage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('alert')).toBeInTheDocument();
    });

    expect(screen.getByTestId('alert-message')).toHaveTextContent('暂无文章');
  });

  it('renders error state when API fails', async () => {
    vi.mocked(executeGraphQL).mockRejectedValue(new Error('Network error'));

    render(
      <MemoryRouter initialEntries={['/blog/archive/9999/01']}>
        <Routes>
          <Route path="/blog/archive/:year/:month" element={<BlogArchivePage />} />
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
      return mockArticlesByDate(2024, 1);
    });

    render(
      <MemoryRouter initialEntries={['/blog/archive/2024/01']}>
        <Routes>
          <Route path="/blog/archive/:year/:month" element={<BlogArchivePage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('spin')).toBeInTheDocument();
  });
});
