import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type Article, ArticleCard } from './article-card';

vi.mock('antd', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Card: ({
      children,
      onClick,
      hoverable,
    }: {
      children?: React.ReactNode;
      onClick?: () => void;
      hoverable?: boolean;
    }) => (
      <div data-testid="card" onClick={onClick} data-hoverable={String(hoverable)}>
        {children}
      </div>
    ),
    Tag: ({
      children,
      color,
    }: {
      children?: React.ReactNode;
      color?: string;
    }) => (
      <span data-testid="tag" data-color={color}>
        {children}
      </span>
    ),
    Avatar: ({ icon }: { icon?: React.ReactNode }) => <span data-testid="avatar">{icon}</span>,
  };
});

vi.mock('@ant-design/icons', () => ({
  ClockCircleOutlined: () => <span data-testid="clock-icon" />,
  EyeOutlined: () => <span data-testid="eye-icon" />,
  HeartOutlined: () => <span data-testid="heart-icon" />,
}));

const mockNavigate = vi.fn();

vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    MemoryRouter: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  };
});

const createArticle = (overrides: Partial<Article> = {}): Article => ({
  id: 'article-1',
  title: 'Test Article',
  summary: 'This is a test article summary.',
  content: 'This is the full content of the test article.',
  viewCount: 100,
  likeCount: 20,
  publishedAt: '2024-01-15T10:30:00Z',
  isPinned: false,
  ...overrides,
});

describe('ArticleCard', () => {
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
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders article title', () => {
    const article = createArticle();

    render(
      <MemoryRouter>
        <ArticleCard article={article} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test Article');
  });

  it('renders article summary with ellipsis', () => {
    const article = createArticle();

    render(
      <MemoryRouter>
        <ArticleCard article={article} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/This is a test article summary\.\.\./)).toBeInTheDocument();
  });

  it('renders content fallback when summary is empty', () => {
    const article = createArticle({ summary: '', content: 'This is the full content' });

    render(
      <MemoryRouter>
        <ArticleCard article={article} />
      </MemoryRouter>,
    );

    expect(screen.getByText('This is the full content...')).toBeInTheDocument();
  });

  it('renders pinned badge when article is pinned', () => {
    const article = createArticle({ isPinned: true });

    render(
      <MemoryRouter>
        <ArticleCard article={article} />
      </MemoryRouter>,
    );

    const tags = screen.getAllByTestId('tag');
    const pinnedTag = tags.find((tag) => tag.textContent === '置顶');
    expect(pinnedTag).toBeInTheDocument();
    expect(pinnedTag).toHaveAttribute('data-color', 'red');
  });

  it('does not render pinned badge when article is not pinned', () => {
    const article = createArticle({ isPinned: false });

    render(
      <MemoryRouter>
        <ArticleCard article={article} />
      </MemoryRouter>,
    );

    const tags = screen.queryAllByTestId('tag');
    const pinnedTag = tags.find((tag) => tag.textContent === '置顶');
    expect(pinnedTag).toBeUndefined();
  });

  it('renders view count and like count', () => {
    const article = createArticle({ viewCount: 123, likeCount: 45 });

    render(
      <MemoryRouter>
        <ArticleCard article={article} />
      </MemoryRouter>,
    );

    expect(screen.getByText('123')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
    expect(screen.getByTestId('heart-icon')).toBeInTheDocument();
  });

  it('renders formatted published date', () => {
    const article = createArticle({ publishedAt: '2024-06-15T10:30:00Z' });

    render(
      <MemoryRouter>
        <ArticleCard article={article} />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
  });

  it('navigates to article detail when card is clicked', () => {
    const article = createArticle({ id: 'article-123' });

    render(
      <MemoryRouter>
        <ArticleCard article={article} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId('card'));

    expect(mockNavigate).toHaveBeenCalledWith('/blog/article/article-123');
  });
});
