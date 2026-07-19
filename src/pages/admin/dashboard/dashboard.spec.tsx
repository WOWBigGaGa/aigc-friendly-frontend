import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminDashboardPage } from '../dashboard';

vi.mock('dayjs', () => ({
  default: vi.fn(() => ({
    format: vi.fn(() => '2024-01-01'),
  })),
}));

vi.mock('antd', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Card: ({
      title,
      extra,
      children,
    }: {
      title?: string;
      extra?: React.ReactNode;
      children?: React.ReactNode;
    }) => (
      <div data-testid="card">
        {title && <div data-testid="card-title">{title}</div>}
        {extra && <div data-testid="card-extra">{extra}</div>}
        {children}
      </div>
    ),
    Row: ({ children }: { children?: React.ReactNode }) => <div data-testid="row">{children}</div>,
    Col: ({ span, children }: { span?: number; children?: React.ReactNode }) => (
      <div data-testid="col" data-span={span}>
        {children}
      </div>
    ),
    Statistic: ({
      title,
      value,
      valueStyle,
    }: {
      title?: string;
      value?: number;
      prefix?: React.ReactNode;
      valueStyle?: React.CSSProperties;
    }) => (
      <div data-testid="statistic" data-title={title} data-color={valueStyle?.color}>
        <span data-testid="stat-value">{value}</span>
      </div>
    ),
    List: ({ loading }: { loading?: boolean }) => (
      <div data-testid="list" data-loading={loading ? 'true' : 'false'}>
        {loading ? 'Loading...' : 'List content'}
      </div>
    ),
    Table: ({
      dataSource,
      columns,
      size,
    }: {
      dataSource?: unknown[];
      columns?: unknown[];
      size?: string;
    }) => (
      <table data-testid="table" data-size={size}>
        <thead>
          <tr>
            {(columns as unknown[]).map((col, idx) => (
              <th key={idx}>{(col as { title: string }).title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(dataSource as unknown[]).map((row) => (
            <tr key={(row as { id: string }).id}>
              {(columns as unknown[]).map((col, idx) => {
                const dataIndex = (col as { dataIndex: string }).dataIndex;
                const render = (
                  col as { render?: (value: unknown, record: unknown) => React.ReactNode }
                ).render;
                const value =
                  row && typeof row === 'object'
                    ? (row as Record<string, unknown>)[dataIndex as string]
                    : null;
                return (
                  <td key={idx}>
                    {render ? (render(value, row) as React.ReactNode) : (value as React.ReactNode)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    ),
    Tag: ({ color, children }: { color?: string; children?: React.ReactNode }) => (
      <span data-testid="tag" data-color={color}>
        {children}
      </span>
    ),
    Typography: {
      Title: ({ level, children }: { level?: number; children?: React.ReactNode }) => (
        <h2 data-testid="title" data-level={level}>
          {children}
        </h2>
      ),
    },
  };
});

vi.mock('@ant-design/icons', () => ({
  FileTextOutlined: () => <span data-testid="icon-file-text" />,
  MessageOutlined: () => <span data-testid="icon-message" />,
  EyeOutlined: () => <span data-testid="icon-eye" />,
  HeartOutlined: () => <span data-testid="icon-heart" />,
  CalendarOutlined: () => <span data-testid="icon-calendar" />,
  ClockCircleOutlined: () => <span data-testid="icon-clock" />,
  AlertOutlined: () => <span data-testid="icon-alert" />,
}));

vi.mock('@/shared/graphql/request', () => ({
  executeGraphQL: vi.fn(),
}));

import { executeGraphQL } from '@/shared/graphql/request';

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should render dashboard title', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockResolvedValue({
      dashboardStats: {
        articleCount: 42,
        commentCount: 128,
        categoryCount: 5,
        tagCount: 20,
        totalViewCount: 15680,
        totalLikeCount: 3240,
        pendingCommentCount: 5,
      },
      articles: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 5,
      },
      pendingComments: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 5,
      },
    });

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('仪表盘')).toBeInTheDocument();
  });

  it('should render all statistic cards with fetched data', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockResolvedValue({
      dashboardStats: {
        articleCount: 42,
        commentCount: 128,
        categoryCount: 5,
        tagCount: 20,
        totalViewCount: 15680,
        totalLikeCount: 3240,
        pendingCommentCount: 5,
      },
      articles: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 5,
      },
      pendingComments: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 5,
      },
    });

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const statistics = screen.getAllByTestId('statistic');
      expect(statistics.length).toBe(6);

      const titles = statistics.map((stat) => stat.getAttribute('data-title'));
      expect(titles).toContain('文章总数');
      expect(titles).toContain('评论总数');
      expect(titles).toContain('总阅读量');
      expect(titles).toContain('总点赞量');
      expect(titles).toContain('分类总数');
      expect(titles).toContain('标签总数');
    });
  });

  it('should render correct statistic values from API', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockResolvedValue({
      dashboardStats: {
        articleCount: 42,
        commentCount: 128,
        categoryCount: 5,
        tagCount: 20,
        totalViewCount: 15680,
        totalLikeCount: 3240,
        pendingCommentCount: 5,
      },
      articles: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 5,
      },
      pendingComments: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 5,
      },
    });

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const values = screen.getAllByTestId('stat-value').map((el) => el.textContent);
      expect(values).toContain('42');
      expect(values).toContain('128');
      expect(values).toContain('15680');
      expect(values).toContain('3240');
      expect(values).toContain('5');
      expect(values).toContain('20');
    });
  });

  it('should show loading state initially', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );

    const lists = screen.getAllByTestId('list');
    expect(lists.some((list) => list.getAttribute('data-loading') === 'true')).toBe(true);
  });

  it('should handle API error and show default values', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API error'));

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const values = screen.getAllByTestId('stat-value').map((el) => el.textContent);
      values.forEach((value) => {
        expect(value).toBe('0');
      });
    });
  });

  it('should render recent articles table', async () => {
    let callCount = 0;
    (executeGraphQL as ReturnType<typeof vi.fn>).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          dashboardStats: {
            articleCount: 42,
            commentCount: 128,
            categoryCount: 5,
            tagCount: 20,
            totalViewCount: 15680,
            totalLikeCount: 3240,
            pendingCommentCount: 5,
          },
        });
      }
      if (callCount === 2) {
        return Promise.resolve({
          articles: {
            items: [
              {
                id: '1',
                title: 'Test Article 1',
                status: 'PUBLISHED',
                viewCount: 100,
                likeCount: 10,
                publishedAt: '2024-01-01',
                category: { id: '1', name: 'Category 1' },
              },
            ],
            total: 1,
            page: 1,
            pageSize: 5,
          },
        });
      }
      return Promise.resolve({
        pendingComments: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 5,
        },
      });
    });

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const tables = screen.getAllByTestId('table');
      expect(tables.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should show empty state when no pending comments', async () => {
    let callCount = 0;
    (executeGraphQL as ReturnType<typeof vi.fn>).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          dashboardStats: {
            articleCount: 42,
            commentCount: 128,
            categoryCount: 5,
            tagCount: 20,
            totalViewCount: 15680,
            totalLikeCount: 3240,
            pendingCommentCount: 0,
          },
        });
      }
      if (callCount === 2) {
        return Promise.resolve({
          articles: {
            items: [],
            total: 0,
            page: 1,
            pageSize: 5,
          },
        });
      }
      return Promise.resolve({
        pendingComments: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 5,
        },
      });
    });

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('暂无待审核评论')).toBeInTheDocument();
    });
  });

  it('should render article status tags correctly', async () => {
    let callCount = 0;
    (executeGraphQL as ReturnType<typeof vi.fn>).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          dashboardStats: {
            articleCount: 42,
            commentCount: 128,
            categoryCount: 5,
            tagCount: 20,
            totalViewCount: 15680,
            totalLikeCount: 3240,
            pendingCommentCount: 0,
          },
        });
      }
      if (callCount === 2) {
        return Promise.resolve({
          articles: {
            items: [
              {
                id: '1',
                title: 'Published Article',
                status: 'PUBLISHED',
                viewCount: 100,
                likeCount: 10,
                publishedAt: '2024-01-01',
                category: { id: '1', name: 'Category 1' },
              },
              {
                id: '2',
                title: 'Draft Article',
                status: 'DRAFT',
                viewCount: 0,
                likeCount: 0,
                publishedAt: null,
                category: { id: '1', name: 'Category 1' },
              },
            ],
            total: 2,
            page: 1,
            pageSize: 5,
          },
        });
      }
      return Promise.resolve({
        pendingComments: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 5,
        },
      });
    });

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const tags = screen.getAllByTestId('tag');
      const statusTags = tags.filter(
        (tag) => tag.textContent === '已发布' || tag.textContent === '草稿',
      );
      expect(statusTags.length).toBe(2);
      expect(statusTags.some((tag) => tag.getAttribute('data-color') === 'green')).toBe(true);
      expect(statusTags.some((tag) => tag.getAttribute('data-color') === 'orange')).toBe(true);
    });
  });

  it('should handle null category gracefully', async () => {
    let callCount = 0;
    (executeGraphQL as ReturnType<typeof vi.fn>).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          dashboardStats: {
            articleCount: 42,
            commentCount: 128,
            categoryCount: 5,
            tagCount: 20,
            totalViewCount: 15680,
            totalLikeCount: 3240,
            pendingCommentCount: 0,
          },
        });
      }
      if (callCount === 2) {
        return Promise.resolve({
          articles: {
            items: [
              {
                id: '1',
                title: 'Article without category',
                status: 'PUBLISHED',
                viewCount: 100,
                likeCount: 10,
                publishedAt: '2024-01-01',
                category: null,
              },
            ],
            total: 1,
            page: 1,
            pageSize: 5,
          },
        });
      }
      return Promise.resolve({
        pendingComments: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 5,
        },
      });
    });

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Article without category')).toBeInTheDocument();
    });
  });

  it('should show empty tables when no data', async () => {
    let callCount = 0;
    (executeGraphQL as ReturnType<typeof vi.fn>).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          dashboardStats: {
            articleCount: 0,
            commentCount: 0,
            categoryCount: 0,
            tagCount: 0,
            totalViewCount: 0,
            totalLikeCount: 0,
            pendingCommentCount: 0,
          },
        });
      }
      if (callCount === 2) {
        return Promise.resolve({
          articles: {
            items: [],
            total: 0,
            page: 1,
            pageSize: 5,
          },
        });
      }
      return Promise.resolve({
        pendingComments: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 5,
        },
      });
    });

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const tables = screen.getAllByTestId('table');
      expect(tables.length).toBe(1);
      expect(screen.getByText('暂无待审核评论')).toBeInTheDocument();
    });
  });

  it('should render pagination info for recent articles', async () => {
    let callCount = 0;
    (executeGraphQL as ReturnType<typeof vi.fn>).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          dashboardStats: {
            articleCount: 42,
            commentCount: 128,
            categoryCount: 5,
            tagCount: 20,
            totalViewCount: 15680,
            totalLikeCount: 3240,
            pendingCommentCount: 5,
          },
        });
      }
      if (callCount === 2) {
        return Promise.resolve({
          articles: {
            items: [
              {
                id: '1',
                title: 'Test Article',
                status: 'PUBLISHED',
                viewCount: 100,
                likeCount: 10,
                publishedAt: '2024-01-01',
                category: { id: '1', name: 'Category 1' },
              },
            ],
            total: 10,
            page: 1,
            pageSize: 5,
          },
        });
      }
      return Promise.resolve({
        pendingComments: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 5,
        },
      });
    });

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const cardExtras = screen.getAllByTestId('card-extra');
      const articleCountExtra = cardExtras.find((extra) => extra.textContent?.includes('篇'));
      expect(articleCountExtra?.textContent).toBe('1 篇');
    });
  });

  it('should render pending comments table with data', async () => {
    let callCount = 0;
    (executeGraphQL as ReturnType<typeof vi.fn>).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          dashboardStats: {
            articleCount: 42,
            commentCount: 128,
            categoryCount: 5,
            tagCount: 20,
            totalViewCount: 15680,
            totalLikeCount: 3240,
            pendingCommentCount: 2,
          },
        });
      }
      if (callCount === 2) {
        return Promise.resolve({
          articles: {
            items: [],
            total: 0,
            page: 1,
            pageSize: 5,
          },
        });
      }
      return Promise.resolve({
        pendingComments: {
          items: [
            {
              id: '1',
              articleId: '1',
              authorName: 'Test User',
              authorEmail: 'test@example.com',
              content: 'Test comment content',
              status: 'PENDING',
              createdAt: '2024-01-01',
            },
            {
              id: '2',
              articleId: '2',
              authorName: 'Another User',
              authorEmail: 'another@example.com',
              content: 'Another comment',
              status: 'PENDING',
              createdAt: '2024-01-02',
            },
          ],
          total: 2,
          page: 1,
          pageSize: 5,
        },
      });
    });

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Another User')).toBeInTheDocument();
    });
  });
});
