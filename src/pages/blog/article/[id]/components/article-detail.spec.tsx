import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
    Avatar: ({ src, alt }: { src?: string; alt?: string }) => (
      <span data-testid="avatar" data-src={src}>
        {alt}
      </span>
    ),
    Divider: () => <div data-testid="divider" />,
    Tag: ({ children, color }: { children?: React.ReactNode; color?: string }) => (
      <span data-testid="tag" data-color={color}>
        {children}
      </span>
    ),
    Tooltip: ({ children }: { children?: React.ReactNode }) => (
      <span data-testid="tooltip">{children}</span>
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
      Text: ({
        loading,
        children,
        strong,
      }: {
        loading?: boolean;
        children?: React.ReactNode;
        strong?: boolean;
      }) => (
        <span data-testid="text" data-loading={String(loading)} data-strong={String(strong)}>
          {children}
        </span>
      ),
      Paragraph: ({ children }: { children?: React.ReactNode }) => (
        <p data-testid="paragraph">{children}</p>
      ),
    },
    Spin: () => <div data-testid="spin" />,
    Form: Object.assign(
      ({ children }: { children?: React.ReactNode }) => (
        <form data-testid="comment-form">{children}</form>
      ),
      {
        useForm: () => [
          {
            resetFields: vi.fn(),
            setFieldsValue: vi.fn(),
          },
        ],
        Item: ({ children }: { children?: React.ReactNode }) => (
          <div data-testid="form-item">{children}</div>
        ),
      },
    ),
    Input: Object.assign(() => <input data-testid="input" />, {
      TextArea: () => <textarea data-testid="textarea" />,
    }),
    Button: ({ children }: { children?: React.ReactNode }) => (
      <button data-testid="button">{children}</button>
    ),
    message: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    },
  };
});

vi.mock('@ant-design/icons', () => ({
  ClockCircleOutlined: () => <span data-testid="clock-icon" />,
  EyeOutlined: () => <span data-testid="eye-icon" />,
  HeartOutlined: () => <span data-testid="heart-icon" />,
  MessageOutlined: () => <span data-testid="message-icon" />,
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
  GET_COMMENTS: {
    loc: {
      source: {
        body: 'mock comments query',
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
  INCREMENT_LIKE_COUNT: {
    loc: {
      source: {
        body: 'mock increment like count mutation',
      },
    },
  },
}));

import { executeGraphQL } from '@/shared/graphql';

import { ArticleDetail } from './article-detail';

const createArticle = (options: { content?: string } = {}) => ({
  id: 'article-1',
  title: 'Test Article',
  summary: 'This is a test article summary.',
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
});

const createComments = () => ({
  items: [
    {
      id: 'comment-1',
      articleId: 'article-1',
      authorName: 'Commenter',
      authorEmail: 'commenter@example.com',
      authorAvatar: '',
      content: 'Great article!',
      parentId: null,
      status: 'APPROVED',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
    },
  ],
  total: 1,
  page: 1,
  pageSize: 50,
  pageInfo: { hasNext: false },
});

const setupMock = (articleOptions: { content?: string } = {}) => {
  vi.mocked(executeGraphQL)
    .mockResolvedValueOnce({ article: createArticle(articleOptions) })
    .mockResolvedValueOnce({ incrementViewCount: createArticle(articleOptions) })
    .mockResolvedValueOnce({ comments: createComments() });
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

    expect(executeGraphQL).toHaveBeenLastCalledWith('mock comments query', {
      articleId: 'article-1',
      pagination: { page: 1, pageSize: 10 },
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
    expect(executeGraphQL).toHaveBeenCalledWith('mock increment view count mutation', {
      id: 'article-1',
    });
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

  it('does not render error state when increment view count fails', async () => {
    vi.mocked(executeGraphQL)
      .mockResolvedValueOnce({ article: createArticle() })
      .mockRejectedValueOnce(new Error('Mutation error'))
      .mockResolvedValueOnce({ comments: createComments() });

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
      .mockResolvedValueOnce({ incrementViewCount: createArticle() })
      .mockResolvedValueOnce({ comments: createComments() });

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

  it('calls incrementLikeCount mutation when like button is clicked', async () => {
    setupMock();

    render(
      <MemoryRouter>
        <ArticleDetail articleId="article-1" />
      </MemoryRouter>,
    );

    await screen.findAllByTestId('title');

    const heartIcon = screen.getByTestId('heart-icon');
    fireEvent.click(heartIcon.parentElement!);

    await waitFor(() => {
      expect(executeGraphQL).toHaveBeenCalledWith('mock increment like count mutation', {
        id: 'article-1',
      });
    });
  });

  it('updates like count after successful like', async () => {
    vi.mocked(executeGraphQL)
      .mockResolvedValueOnce({ article: createArticle() })
      .mockResolvedValueOnce({ incrementViewCount: createArticle() })
      .mockResolvedValueOnce({ comments: createComments() })
      .mockResolvedValueOnce({ incrementLikeCount: { ...createArticle(), likeCount: 21 } });

    render(
      <MemoryRouter>
        <ArticleDetail articleId="article-1" />
      </MemoryRouter>,
    );

    await screen.findAllByTestId('title');

    expect(screen.getByText('20')).toBeInTheDocument();

    const heartIcon = screen.getByTestId('heart-icon');
    fireEvent.click(heartIcon.parentElement!);

    await waitFor(() => {
      expect(screen.getByText('21')).toBeInTheDocument();
    });
  });

  it('does not crash when like mutation fails', async () => {
    vi.mocked(executeGraphQL)
      .mockResolvedValueOnce({ article: createArticle() })
      .mockResolvedValueOnce({ incrementViewCount: createArticle() })
      .mockResolvedValueOnce({ comments: createComments() })
      .mockRejectedValueOnce(new Error('Mutation error'));

    render(
      <MemoryRouter>
        <ArticleDetail articleId="article-1" />
      </MemoryRouter>,
    );

    await screen.findAllByTestId('title');

    const heartIcon = screen.getByTestId('heart-icon');
    fireEvent.click(heartIcon.parentElement!);

    expect(screen.getByText('Test Article')).toBeInTheDocument();
  });

  it('fetches comments when article loads', async () => {
    setupMock();

    render(
      <MemoryRouter>
        <ArticleDetail articleId="article-1" />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(executeGraphQL).toHaveBeenCalledWith('mock comments query', {
        articleId: 'article-1',
        pagination: { page: 1, pageSize: 10 },
      });
    });
  });

  it('renders comment section when comments are loaded', async () => {
    setupMock();

    render(
      <MemoryRouter>
        <ArticleDetail articleId="article-1" />
      </MemoryRouter>,
    );

    await screen.findAllByTestId('title');

    expect(screen.getByText('评论 (1)')).toBeInTheDocument();
    expect(screen.getByText('Great article!')).toBeInTheDocument();
  });

  it('shows comments loading state', async () => {
    vi.mocked(executeGraphQL)
      .mockResolvedValueOnce({ article: createArticle() })
      .mockResolvedValueOnce({ incrementViewCount: createArticle() })
      .mockImplementationOnce(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <ArticleDetail articleId="article-1" />
      </MemoryRouter>,
    );

    await screen.findAllByTestId('title');

    expect(screen.getByText('评论 (0)')).toBeInTheDocument();
  });

  it('shows comments error state when fetch fails', async () => {
    vi.mocked(executeGraphQL)
      .mockResolvedValueOnce({ article: createArticle() })
      .mockResolvedValueOnce({ incrementViewCount: createArticle() })
      .mockRejectedValueOnce(new Error('Network error'));

    render(
      <MemoryRouter>
        <ArticleDetail articleId="article-1" />
      </MemoryRouter>,
    );

    await screen.findAllByTestId('title');

    await waitFor(() => {
      expect(screen.getByText('评论加载失败，请稍后重试')).toBeInTheDocument();
    });
  });
});
