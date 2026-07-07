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
      onClick,
    }: {
      children?: React.ReactNode;
      color?: string;
      onClick?: (e: React.MouseEvent) => void;
    }) => (
      <span data-testid="tag" data-color={color} onClick={onClick}>
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
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const createArticle = (overrides: Partial<Article> = {}): Article => ({
  id: 'article-1',
  title: 'Test Article',
  slug: 'test-article',
  excerpt: 'This is a test article excerpt.',
  content: 'This is the full content of the test article.',
  viewCount: 100,
  likeCount: 20,
  publishedAt: '2024-01-15T10:30:00Z',
  category: {
    id: 'category-1',
    name: 'Technology',
    slug: 'technology',
  },
  tags: [
    { id: 'tag-1', name: 'React', slug: 'react' },
    { id: 'tag-2', name: 'TypeScript', slug: 'typescript' },
    { id: 'tag-3', name: 'Node.js', slug: 'nodejs' },
    { id: 'tag-4', name: 'JavaScript', slug: 'javascript' },
  ],
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

  it('renders article excerpt with ellipsis', () => {
    const article = createArticle();

    render(
      <MemoryRouter>
        <ArticleCard article={article} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/This is a test article excerpt\.\.\./)).toBeInTheDocument();
  });

  it('renders content fallback when excerpt is empty', () => {
    const article = createArticle({ excerpt: '', content: 'This is the full content' });

    render(
      <MemoryRouter>
        <ArticleCard article={article} />
      </MemoryRouter>,
    );

    expect(screen.getByText('This is the full content...')).toBeInTheDocument();
  });

  it('renders category tag', () => {
    const article = createArticle();

    render(
      <MemoryRouter>
        <ArticleCard article={article} />
      </MemoryRouter>,
    );

    const tags = screen.getAllByTestId('tag');
    const categoryTag = tags.find((tag) => tag.textContent === 'Technology');
    expect(categoryTag).toBeInTheDocument();
    expect(categoryTag).toHaveAttribute('data-color', 'blue');
  });

  it('does not render category tag when category is undefined', () => {
    const article = createArticle({ category: undefined });

    render(
      <MemoryRouter>
        <ArticleCard article={article} />
      </MemoryRouter>,
    );

    const tags = screen.getAllByTestId('tag');
    expect(tags).not.toContainEqual(expect.objectContaining({ textContent: 'Technology' }));
  });

  it('renders at most 3 tags', () => {
    const article = createArticle({
      tags: [
        { id: 'tag-1', name: 'Tag1', slug: 'tag1' },
        { id: 'tag-2', name: 'Tag2', slug: 'tag2' },
        { id: 'tag-3', name: 'Tag3', slug: 'tag3' },
        { id: 'tag-4', name: 'Tag4', slug: 'tag4' },
        { id: 'tag-5', name: 'Tag5', slug: 'tag5' },
      ],
    });

    render(
      <MemoryRouter>
        <ArticleCard article={article} />
      </MemoryRouter>,
    );

    const tags = screen.getAllByTestId('tag');
    expect(tags.length).toBe(4);
    expect(tags[1].textContent).toBe('Tag1');
    expect(tags[2].textContent).toBe('Tag2');
    expect(tags[3].textContent).toBe('Tag3');
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

    const tags = screen.getAllByTestId('tag');
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

  it('navigates to category when category tag is clicked', () => {
    const article = createArticle({
      category: { id: 'cat-1', name: 'Tech', slug: 'tech' },
    });

    render(
      <MemoryRouter>
        <ArticleCard article={article} />
      </MemoryRouter>,
    );

    const tags = screen.getAllByTestId('tag');
    const categoryTag = tags.find((tag) => tag.textContent === 'Tech');
    fireEvent.click(categoryTag!);

    expect(mockNavigate).toHaveBeenCalledWith('/blog/category/tech');
  });

  it('does not navigate to article when tag is clicked (stops propagation)', () => {
    const article = createArticle({
      category: { id: 'cat-1', name: 'Tech', slug: 'tech' },
    });

    render(
      <MemoryRouter>
        <ArticleCard article={article} />
      </MemoryRouter>,
    );

    const tags = screen.getAllByTestId('tag');
    const categoryTag = tags.find((tag) => tag.textContent === 'Tech');
    fireEvent.click(categoryTag!);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/blog/category/tech');
  });

  it('navigates to tag when tag is clicked', () => {
    const article = createArticle({
      tags: [{ id: 'tag-1', name: 'React', slug: 'react' }],
    });

    render(
      <MemoryRouter>
        <ArticleCard article={article} />
      </MemoryRouter>,
    );

    const tags = screen.getAllByTestId('tag');
    const tagElement = tags.find((tag) => tag.textContent === 'React');
    fireEvent.click(tagElement!);

    expect(mockNavigate).toHaveBeenCalledWith('/blog/tag/react');
  });
});
