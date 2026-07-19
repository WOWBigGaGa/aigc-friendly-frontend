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

import { AdminArticleNewPage } from './index';

const mockNavigate = vi.fn();

vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    MemoryRouter: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  };
});

describe('AdminArticleNewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (executeGraphQL as ReturnType<typeof vi.fn>).mockImplementation(async () => ({
      categories: [],
    }));
  });

  afterEach(() => {
    cleanup();
  });

  it('should render new article page title', async () => {
    render(
      <MemoryRouter>
        <AdminArticleNewPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('新建文章')).toBeInTheDocument();
    });
  });

  it('should navigate back when back button is clicked', async () => {
    render(
      <MemoryRouter>
        <AdminArticleNewPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const backButton = screen.getByText('返回');
      fireEvent.click(backButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/admin/articles');
  });

  it('should load categories on mount', async () => {
    render(
      <MemoryRouter>
        <AdminArticleNewPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(executeGraphQL).toHaveBeenCalled();
    });
  });

  it('should have publish and save draft buttons', async () => {
    render(
      <MemoryRouter>
        <AdminArticleNewPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('发布文章')).toBeInTheDocument();
      expect(screen.getByText('保存草稿')).toBeInTheDocument();
    });
  });
});
