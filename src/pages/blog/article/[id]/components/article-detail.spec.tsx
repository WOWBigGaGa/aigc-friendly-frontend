import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/blog', () => ({
  GET_ADJACENT_ARTICLES: { loc: { source: { body: 'mock adjacent query' } } },
  GET_ARTICLE_BY_ID: { loc: { source: { body: 'mock article query' } } },
  INCREMENT_VIEW_COUNT: { loc: { source: { body: 'mock increment view count mutation' } } },
}));

import { executeGraphQL } from '@/shared/graphql';

import { ArticleDetail } from './article-detail';

vi.mock('antd', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Anchor: Object.assign(
      ({ affix, children }: { affix?: boolean; children?: React.ReactNode }) => (
        <div data-testid="anchor" data-affix={String(affix)}>
          {children}
        </div>
      ),
      {
        Link: ({
          href,
          children,
          onClick,
          className,
        }: {
          href?: string;
          children?: React.ReactNode;
          onClick?: (e: React.MouseEvent) => void;
          className?: string;
        }) => (
          <a data-testid="anchor-link" href={href} onClick={onClick} className={className}>
            {children}
          </a>
        ),
      },
    ),
    Divider: () => <div data-testid="divider" />,
    Tag: ({ children, color }: { children?: React.ReactNode; color?: string }) => (
      <span data-testid="tag" data-color={color}>
        {children}
      </span>
    ),
    Typography: {
      Title: ({
        id,
        level,
        children,
      }: {
        id?: string;
        level?: number;
        children?: React.ReactNode;
      }) => (
        <h1 data-testid="title" data-id={id} data-level={String(level)}>
          {children}
        </h1>
      ),
      Text: ({ loading, children }: { loading?: boolean; children?: React.ReactNode }) => (
        <span data-testid="text" data-loading={String(loading)}>
          {children}
        </span>
      ),
      Paragraph: ({ children }: { children?: React.ReactNode }) => (
        <p data-testid="paragraph">{children}</p>
      ),
    },
  };
});

vi.mock('@ant-design/icons', () => ({
  ClockCircleOutlined: () => <span data-testid="clock-icon" />,
  EyeOutlined: () => <span data-testid="eye-icon" />,
  HeartOutlined: () => <span data-testid="heart-icon" />,
}));

vi.mock('react-markdown', () => ({
  default: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="react-markdown">{children}</div>
  ),
}));

vi.mock('@/shared/graphql', () => ({
  executeGraphQL: vi.fn(),
}));

vi.mock('@/features/blog', () => ({
  GET_ARTICLE_BY_ID: {
    loc: {
      source: {
        body: 'mock article query',
      },
    },
  },
  GET_ADJACENT_ARTICLES: {
    loc: {
      source: {
        body: 'mock adjacent query',
      },
    },
  },
  INCREMENT_VIEW_COUNT: {
    loc: {
      source: {
        body: 'mock increment view count mutation',
      },
    },
  },
}));

const createArticle = (options: { content?: string; category?: boolean } = {}) => ({
  id: 'article-1',
  title: 'Test Article',
  slug: 'test-article',
  excerpt: 'This is a test article excerpt.',
  content:
    options.content ??
    `## Section 1

This is the first section.

### Subsection 1.1

This is a subsection.

## Section 2

This is the second section.`,
  viewCount: 100,
  likeCount: 20,
  publishedAt: '2024-01-15T10:30:00Z',
  category:
    options.category !== false
      ? { id: 'cat-1', name: 'Technology', slug: 'technology' }
      : undefined,
  tags: [
    { id: 'tag-1', name: 'React', slug: 'react' },
    { id: 'tag-2', name: 'TypeScript', slug: 'typescript' },
  ],
});

const createAdjacentArticles = (options: { prev?: boolean; next?: boolean } = {}) => ({
  prev:
    options.prev !== false
      ? { id: 'article-0', title: 'Previous Article', slug: 'previous-article' }
      : undefined,
  next:
    options.next !== false
      ? { id: 'article-2', title: 'Next Article', slug: 'next-article' }
      : undefined,
});

const setupMock = (
  articleOptions: { content?: string; category?: boolean } = {},
  adjacentOptions: { prev?: boolean; next?: boolean } = {},
) => {
  vi.mocked(executeGraphQL)
    .mockResolvedValueOnce({ article: createArticle(articleOptions) })
    .mockResolvedValueOnce({ adjacentArticles: createAdjacentArticles(adjacentOptions) })
    .mockResolvedValueOnce({ incrementViewCount: createArticle(articleOptions) });
};

describe('ArticleDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn(function () {
        return {
          observe: vi.fn(),
          unobserve: vi.fn(),
          disconnect: vi.fn(),
        };
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders loading state initially', () => {
    setupMock();

    render(
      <MemoryRouter>
        <ArticleDetail articleId="article-1" />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('article-loading')).toBeInTheDocument();
  });

  it('renders article title when loaded', async () => {
    setupMock();

    render(
      <MemoryRouter>
        <ArticleDetail articleId="article-1" />
      </MemoryRouter>,
    );

    const titleElements = await screen.findAllByTestId('title');
    expect(titleElements[0]).toHaveTextContent('Test Article');
  });

  it('renders category and tags', async () => {
    setupMock();

    render(
      <MemoryRouter>
        <ArticleDetail articleId="article-1" />
      </MemoryRouter>,
    );

    await screen.findAllByTestId('title');

    const tags = screen.getAllByTestId('tag');
    expect(tags.length).toBe(3);
    expect(tags[0]).toHaveAttribute('data-color', 'blue');
  });

  it('does not render category tag when category is undefined', async () => {
    setupMock({ category: false });

    render(
      <MemoryRouter>
        <ArticleDetail articleId="article-1" />
      </MemoryRouter>,
    );

    await screen.findAllByTestId('title');

    const tags = screen.getAllByTestId('tag');
    expect(tags.length).toBe(2);
  });

  it('renders TOC when article has headings', async () => {
    setupMock();

    render(
      <MemoryRouter>
        <ArticleDetail articleId="article-1" />
      </MemoryRouter>,
    );

    await screen.findAllByTestId('title');

    const anchorLinks = screen.getAllByTestId('anchor-link');
    expect(anchorLinks.length).toBe(3);
  });

  it('does not render TOC when article has no headings', async () => {
    setupMock({ content: 'No headings in this content.' });

    render(
      <MemoryRouter>
        <ArticleDetail articleId="article-1" />
      </MemoryRouter>,
    );

    await screen.findAllByTestId('title');

    expect(screen.queryByTestId('anchor')).not.toBeInTheDocument();
  });

  it('renders adjacent article navigation links', async () => {
    setupMock();

    render(
      <MemoryRouter>
        <ArticleDetail articleId="article-1" />
      </MemoryRouter>,
    );

    await screen.findAllByTestId('title');

    const links = screen.getAllByRole('link');
    const navLinks = links.filter((link) =>
      link.getAttribute('href')?.startsWith('/blog/article/'),
    );
    expect(navLinks.length).toBe(2);
    expect(navLinks[0]).toHaveAttribute('href', '/blog/article/article-0');
    expect(navLinks[1]).toHaveAttribute('href', '/blog/article/article-2');
  });

  it('renders only previous article when next article is undefined', async () => {
    setupMock({}, { next: false });

    render(
      <MemoryRouter>
        <ArticleDetail articleId="article-1" />
      </MemoryRouter>,
    );

    await screen.findAllByTestId('title');

    const links = screen.getAllByRole('link');
    const navLinks = links.filter((link) =>
      link.getAttribute('href')?.startsWith('/blog/article/'),
    );
    expect(navLinks.length).toBe(1);
    expect(navLinks[0]).toHaveAttribute('href', '/blog/article/article-0');
  });

  it('renders only next article when previous article is undefined', async () => {
    setupMock({}, { prev: false });

    render(
      <MemoryRouter>
        <ArticleDetail articleId="article-1" />
      </MemoryRouter>,
    );

    await screen.findAllByTestId('title');

    const links = screen.getAllByRole('link');
    const navLinks = links.filter((link) =>
      link.getAttribute('href')?.startsWith('/blog/article/'),
    );
    expect(navLinks.length).toBe(1);
    expect(navLinks[0]).toHaveAttribute('href', '/blog/article/article-2');
  });

  it('calls incrementViewCount mutation when article is loaded', async () => {
    setupMock();

    render(
      <MemoryRouter>
        <ArticleDetail articleId="article-1" />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(executeGraphQL).toHaveBeenCalledTimes(3);
    });

    expect(executeGraphQL).toHaveBeenLastCalledWith('mock increment view count mutation', {
      id: 'article-1',
    });
  });

  it('calls GraphQL with correct parameters', async () => {
    setupMock();

    render(
      <MemoryRouter>
        <ArticleDetail articleId="article-1" />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(executeGraphQL).toHaveBeenCalled();
    });

    expect(executeGraphQL).toHaveBeenCalledWith('mock article query', { id: 'article-1' });
    expect(executeGraphQL).toHaveBeenCalledWith('mock adjacent query', { id: 'article-1' });
  });

  it('renders Markdown content', async () => {
    setupMock();

    render(
      <MemoryRouter>
        <ArticleDetail articleId="article-1" />
      </MemoryRouter>,
    );

    await screen.findAllByTestId('title');

    expect(screen.getByTestId('react-markdown')).toBeInTheDocument();
  });

  it('handles TOC link click', async () => {
    setupMock();

    render(
      <MemoryRouter>
        <ArticleDetail articleId="article-1" />
      </MemoryRouter>,
    );

    await screen.findAllByTestId('title');

    const anchorLinks = screen.getAllByTestId('anchor-link');
    fireEvent.click(anchorLinks[0]);
  });

  it('renders error state when article API fails', async () => {
    vi.mocked(executeGraphQL).mockRejectedValueOnce(new Error('Network error'));

    render(
      <MemoryRouter>
        <ArticleDetail articleId="article-1" />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('article-error')).toBeInTheDocument();
    });

    expect(screen.getByText('文章加载失败')).toBeInTheDocument();
    expect(screen.getByText('文章不存在或加载出错，请稍后重试。')).toBeInTheDocument();
  });

  it('renders error state when adjacent articles API fails', async () => {
    vi.mocked(executeGraphQL)
      .mockResolvedValueOnce({ article: createArticle() })
      .mockRejectedValueOnce(new Error('Network error'));

    render(
      <MemoryRouter>
        <ArticleDetail articleId="article-1" />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('article-error')).toBeInTheDocument();
    });

    expect(screen.getByText('文章加载失败')).toBeInTheDocument();
  });

  it('does not render error state when increment view count fails', async () => {
    vi.mocked(executeGraphQL)
      .mockResolvedValueOnce({ article: createArticle() })
      .mockResolvedValueOnce({ adjacentArticles: createAdjacentArticles() })
      .mockRejectedValueOnce(new Error('Mutation error'));

    render(
      <MemoryRouter>
        <ArticleDetail articleId="article-1" />
      </MemoryRouter>,
    );

    await screen.findAllByTestId('title');

    expect(screen.queryByTestId('article-error')).not.toBeInTheDocument();
    expect(screen.getByText('Test Article')).toBeInTheDocument();
  });

  it('renders view count and like count', async () => {
    setupMock();

    render(
      <MemoryRouter>
        <ArticleDetail articleId="article-1" />
      </MemoryRouter>,
    );

    await screen.findAllByTestId('title');

    const eyeIcon = screen.getByTestId('eye-icon');
    const heartIcon = screen.getByTestId('heart-icon');

    expect(eyeIcon).toBeInTheDocument();
    expect(heartIcon).toBeInTheDocument();

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('renders formatted publish date', async () => {
    setupMock();

    render(
      <MemoryRouter>
        <ArticleDetail articleId="article-1" />
      </MemoryRouter>,
    );

    await screen.findAllByTestId('title');

    const clockIcon = screen.getByTestId('clock-icon');
    expect(clockIcon).toBeInTheDocument();

    expect(screen.getByText('2024年1月15日')).toBeInTheDocument();
  });

  it('renders "没有更多文章" when no adjacent articles', async () => {
    setupMock({}, { prev: false, next: false });

    render(
      <MemoryRouter>
        <ArticleDetail articleId="article-1" />
      </MemoryRouter>,
    );

    await screen.findAllByTestId('title');

    expect(screen.getByText('没有更多文章')).toBeInTheDocument();
  });

  it('scrolls to heading when TOC link is clicked', async () => {
    setupMock();
    const scrollIntoViewMock = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;

    const headingElement = document.createElement('div');
    headingElement.id = 'section-1';
    document.body.appendChild(headingElement);

    render(
      <MemoryRouter>
        <ArticleDetail articleId="article-1" />
      </MemoryRouter>,
    );

    await screen.findAllByTestId('title');

    const anchorLinks = screen.getAllByTestId('anchor-link');
    fireEvent.click(anchorLinks[0]);

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });

    document.body.removeChild(headingElement);
  });

  it('calls incrementViewCount even when article fetch fails', async () => {
    vi.mocked(executeGraphQL)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ incrementViewCount: createArticle() });

    render(
      <MemoryRouter>
        <ArticleDetail articleId="article-1" />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('article-error')).toBeInTheDocument();
    });

    expect(executeGraphQL).toHaveBeenCalledTimes(3);
    expect(executeGraphQL).toHaveBeenCalledWith('mock increment view count mutation', {
      id: 'article-1',
    });
  });
});
