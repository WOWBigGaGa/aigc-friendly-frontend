import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { executeGraphQL } from '@/shared/graphql';

import { BlogLinksPage } from '../index';

vi.mock('antd', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
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
    Card: ({
      hoverable,
      onClick,
      children,
    }: {
      hoverable?: boolean;
      onClick?: () => void;
      children?: React.ReactNode;
    }) => (
      <div data-testid="card" data-hoverable={hoverable} onClick={onClick}>
        {children}
      </div>
    ),
    Spin: () => <div data-testid="spin">Loading...</div>,
    Typography: {
      Title: ({ level, children }: { level?: number; children?: React.ReactNode }) => {
        const TagName = level === 1 ? 'h1' : level === 2 ? 'h2' : level === 3 ? 'h3' : 'h4';
        return <TagName data-testid={`title-${level}`}>{children}</TagName>;
      },
      Paragraph: ({ children }: { children?: React.ReactNode }) => (
        <p data-testid="paragraph">{children}</p>
      ),
    },
  };
});

vi.mock('@/shared/graphql', () => ({
  executeGraphQL: vi.fn(),
}));

vi.mock('@/features/blog', () => ({
  GET_ACTIVE_FRIEND_LINKS: {
    loc: {
      source: {
        body: 'mock active friend links query',
      },
    },
  },
}));

vi.mock('@/shared/ui/lazy-image', () => ({
  LazyImage: ({ src, alt }: { src: string; alt: string }) => (
    <img data-testid="lazy-image" src={src} alt={alt} />
  ),
}));

const mockFriendLinks = [
  {
    id: 'link-1',
    name: 'Test Blog',
    url: 'https://test.com',
    description: 'A test blog description',
    logo: 'https://test.com/logo.png',
  },
  {
    id: 'link-2',
    name: 'Another Blog',
    url: 'https://another.com',
    description: null,
    logo: null,
  },
];

describe('BlogLinksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(executeGraphQL).mockResolvedValue({ activeFriendLinks: mockFriendLinks });
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

  it('should render loading state initially', async () => {
    render(
      <MemoryRouter>
        <BlogLinksPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('spin')).toBeInTheDocument();
  });

  it('should render friend links when data is loaded successfully', async () => {
    render(
      <MemoryRouter>
        <BlogLinksPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('title-2')).toHaveTextContent('友情链接');
    expect(screen.getByText('Test Blog')).toBeInTheDocument();
    expect(screen.getByText('Another Blog')).toBeInTheDocument();
  });

  it('should render empty state when no active friend links', async () => {
    vi.mocked(executeGraphQL).mockResolvedValue({
      activeFriendLinks: [],
    });

    render(
      <MemoryRouter>
        <BlogLinksPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
    });

    expect(screen.getByText('暂无友链，期待您的加入！')).toBeInTheDocument();
  });

  it('should render error state when API call fails', async () => {
    vi.mocked(executeGraphQL).mockRejectedValue(new Error('Network error'));

    render(
      <MemoryRouter>
        <BlogLinksPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('alert')).toHaveAttribute('data-type', 'error');
    expect(screen.getByTestId('alert-message')).toHaveTextContent('加载失败');
    expect(screen.getByTestId('alert-description')).toHaveTextContent(
      '友链列表加载失败，请稍后重试',
    );
  });

  it('should render friend link cards', async () => {
    render(
      <MemoryRouter>
        <BlogLinksPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
    });

    const cards = screen
      .getAllByTestId('card')
      .filter((card) => card.getAttribute('data-hoverable') === 'true');
    expect(cards.length).toBe(2);
  });

  it('should call executeGraphQL with correct query', async () => {
    render(
      <MemoryRouter>
        <BlogLinksPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(executeGraphQL).toHaveBeenCalled();
    });

    expect(executeGraphQL).toHaveBeenCalledWith('mock active friend links query', {});
  });

  it('should render link with logo when logo is provided', async () => {
    render(
      <MemoryRouter>
        <BlogLinksPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
    });

    const lazyImages = screen.getAllByTestId('lazy-image');
    const testBlogImage = lazyImages.find((img) => img.getAttribute('alt') === 'Test Blog');
    expect(testBlogImage).toBeInTheDocument();
    expect(testBlogImage).toHaveAttribute('src', 'https://test.com/logo.png');
  });

  it('should not render logo when logo is null', async () => {
    render(
      <MemoryRouter>
        <BlogLinksPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
    });

    const lazyImages = screen.getAllByTestId('lazy-image');
    expect(lazyImages.length).toBe(1);
  });
});
