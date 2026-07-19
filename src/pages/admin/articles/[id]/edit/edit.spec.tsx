import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

if (typeof window !== 'undefined') {
  window.ResizeObserver = class ResizeObserver {
    constructor(_callback: ResizeObserverCallback) {}
    observe(_target: Element, _options?: ResizeObserverOptions) {}
    unobserve(_target: Element) {}
    disconnect() {}
  };

  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

vi.mock('@ant-design/icons', () => ({
  ArrowLeftOutlined: () => <span />,
  SaveOutlined: () => <span />,
  SendOutlined: () => <span />,
}));

vi.mock('@uiw/react-md-editor', () => ({
  default: () => <div data-testid="md-editor" />,
}));

vi.mock('@/shared/graphql/request', () => ({
  executeGraphQL: vi.fn(),
}));

import { executeGraphQL } from '@/shared/graphql/request';

import { AdminArticleEditPage } from './index';

const mockNavigate = vi.fn();

vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '1' }),
    MemoryRouter: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  };
});

describe('AdminArticleEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (executeGraphQL as ReturnType<typeof vi.fn>).mockImplementation(async () => ({
      article: {
        id: '1',
        title: 'Test Article',
        content: 'Test content',
        summary: 'Test summary',
        coverImage: '',
        status: 'DRAFT',
        categoryId: '1',
        authorId: '1',
        viewCount: 0,
        likeCount: 0,
        isPinned: false,
        publishedAt: null,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      categories: [],
    }));
  });

  afterEach(() => {
    cleanup();
  });

  it('should render edit article page title', async () => {
    render(
      <MemoryRouter>
        <AdminArticleEditPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('编辑文章')).toBeInTheDocument();
    });
  });

  it('should navigate back when back button is clicked', async () => {
    render(
      <MemoryRouter>
        <AdminArticleEditPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const backButton = screen.getByText('返回');
      fireEvent.click(backButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/admin/articles');
  });

  it('should load article data on mount', async () => {
    render(
      <MemoryRouter>
        <AdminArticleEditPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(executeGraphQL).toHaveBeenCalled();
    });
  });

  it('should have publish and save draft buttons', async () => {
    render(
      <MemoryRouter>
        <AdminArticleEditPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('发布文章')).toBeInTheDocument();
      expect(screen.getByText('保存草稿')).toBeInTheDocument();
    });
  });

  it('should navigate to articles list when article not found', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockResolvedValue({
      article: null,
      categories: [],
    });

    render(
      <MemoryRouter>
        <AdminArticleEditPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/articles');
    });
  });

  it('should handle API error when fetching article', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API error'));

    render(
      <MemoryRouter>
        <AdminArticleEditPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByText('编辑文章')).not.toBeInTheDocument();
    });
  });
});
