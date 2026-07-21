import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/blog', () => ({
  SEARCH_ARTICLES: {
    loc: {
      source: {
        body: `
          query SearchArticles($pagination: PaginationInput, $keyword: String) {
            articles(pagination: $pagination, filter: { keyword: $keyword }) {
              items {
                id
                title
                summary
                coverImage
                viewCount
                likeCount
                publishedAt
                createdAt
              }
              total
              page
              pageSize
              pageInfo {
                hasNext
              }
            }
          }
        `,
      },
    },
  },
}));

import { executeGraphQL } from '@/shared/graphql';

import { BlogSearchPage } from './index';

vi.mock('@ant-design/icons', () => ({
  ClockCircleOutlined: () => <span data-testid="clock-icon" />,
  SearchOutlined: () => <span data-testid="search-icon" />,
}));

vi.mock('antd', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Alert: ({
      title,
      description,
      type,
    }: {
      title?: React.ReactNode;
      description?: React.ReactNode;
      type?: string;
    }) => (
      <div data-testid="alert" data-type={type}>
        <div data-testid="alert-message">{title}</div>
        {description && <div data-testid="alert-description">{description}</div>}
      </div>
    ),
    Input: ({
      value,
      onChange,
      onPressEnter,
      placeholder,
    }: {
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
      onPressEnter?: () => void;
      placeholder?: string;
    }) => (
      <input
        data-testid="search-input"
        value={value}
        onChange={onChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onPressEnter?.();
        }}
        placeholder={placeholder}
      />
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

describe('BlogSearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const mockSearchResult = (keyword: string, page: number, hasNext = false) => ({
    articles: {
      items:
        keyword === 'empty'
          ? []
          : [
              {
                id: 'article-1',
                title: `Test ${keyword} Article`,
                summary: `This is a ${keyword} test article summary.`,
                coverImage: null,
                viewCount: 10,
                likeCount: 5,
                publishedAt: '2024-01-15T00:00:00Z',
                createdAt: '2024-01-15T00:00:00Z',
              },
            ],
      total: keyword === 'empty' ? 0 : 1,
      page,
      pageSize: 10,
      pageInfo: { hasNext },
    },
  });

  it('renders search input and placeholder when no keyword', () => {
    render(
      <MemoryRouter initialEntries={['/blog/search']}>
        <Routes>
          <Route path="/blog/search" element={<BlogSearchPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('search-input')).toHaveAttribute(
      'placeholder',
      '输入关键词搜索文章...',
    );
    expect(screen.getByTestId('title-1')).toHaveTextContent('搜索');
    expect(screen.getByTestId('title-3')).toHaveTextContent('请输入关键词进行搜索');
  });

  it('performs search when enter is pressed', async () => {
    vi.mocked(executeGraphQL).mockResolvedValue(mockSearchResult('test', 1));

    render(
      <MemoryRouter initialEntries={['/blog/search']}>
        <Routes>
          <Route path="/blog/search" element={<BlogSearchPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(executeGraphQL).toHaveBeenCalled();
    });

    expect(executeGraphQL).toHaveBeenCalledWith(expect.any(String), {
      pagination: { page: 1, pageSize: 10 },
      keyword: 'test',
    });
  });

  it('renders search results with highlighted keyword', async () => {
    vi.mocked(executeGraphQL).mockResolvedValue(mockSearchResult('test', 1));

    render(
      <MemoryRouter initialEntries={['/blog/search?q=test']}>
        <Routes>
          <Route path="/blog/search" element={<BlogSearchPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('article-list')).toBeInTheDocument();
    });

    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByTestId('article-item')).toHaveTextContent('This is a');
  });

  it('renders no results message when search returns empty', async () => {
    vi.mocked(executeGraphQL).mockResolvedValue(mockSearchResult('empty', 1));

    render(
      <MemoryRouter initialEntries={['/blog/search?q=empty']}>
        <Routes>
          <Route path="/blog/search" element={<BlogSearchPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('alert')).toBeInTheDocument();
    });

    expect(screen.getByTestId('alert-message')).toHaveTextContent('未找到相关文章');
  });

  it('renders error state when search fails', async () => {
    vi.mocked(executeGraphQL).mockRejectedValue(new Error('Network error'));

    render(
      <MemoryRouter initialEntries={['/blog/search?q=error']}>
        <Routes>
          <Route path="/blog/search" element={<BlogSearchPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('alert')).toBeInTheDocument();
    });

    expect(screen.getByTestId('alert')).toHaveAttribute('data-type', 'error');
    expect(screen.getByTestId('alert-message')).toHaveTextContent('搜索失败');
  });

  it('renders loading state when searching', () => {
    vi.mocked(executeGraphQL).mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return mockSearchResult('test', 1);
    });

    render(
      <MemoryRouter initialEntries={['/blog/search?q=test']}>
        <Routes>
          <Route path="/blog/search" element={<BlogSearchPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('spin')).toBeInTheDocument();
  });
});
