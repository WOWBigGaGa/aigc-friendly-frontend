import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '../providers';

import { ArticleLayout } from './article-layout';

vi.mock('antd', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Button: ({
      children,
      onClick,
      ...props
    }: {
      children?: React.ReactNode;
      onClick?: () => void;
      [key: string]: unknown;
    }) => (
      <button onClick={onClick} {...(props as Record<string, unknown>)}>
        {children}
      </button>
    ),
  };
});

function TestArticleContent() {
  return <div data-testid="article-content">Article Content</div>;
}

describe('ArticleLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders header with back button and theme toggle', () => {
    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/blog/article/1']}>
          <ArticleLayout>
            <TestArticleContent />
          </ArticleLayout>
        </MemoryRouter>
      </ThemeProvider>,
    );

    expect(screen.getByText('返回首页')).toBeInTheDocument();
  });

  it('renders article content', () => {
    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/blog/article/1']}>
          <ArticleLayout>
            <TestArticleContent />
          </ArticleLayout>
        </MemoryRouter>
      </ThemeProvider>,
    );

    expect(screen.getByTestId('article-content')).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/blog/article/1']}>
          <ArticleLayout>
            <TestArticleContent />
          </ArticleLayout>
        </MemoryRouter>
      </ThemeProvider>,
    );

    expect(screen.getByText('© 2025 My Blog. All rights reserved.')).toBeInTheDocument();
  });

  it('applies dark class when theme is dark', () => {
    localStorage.setItem('color-scheme', 'dark');

    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/blog/article/1']}>
          <ArticleLayout>
            <TestArticleContent />
          </ArticleLayout>
        </MemoryRouter>
      </ThemeProvider>,
    );

    expect(document.querySelector('.article-shell')).toHaveClass('dark');
  });

  it('applies light class when theme is light', () => {
    localStorage.setItem('color-scheme', 'light');

    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/blog/article/1']}>
          <ArticleLayout>
            <TestArticleContent />
          </ArticleLayout>
        </MemoryRouter>
      </ThemeProvider>,
    );

    expect(document.querySelector('.article-shell')).not.toHaveClass('dark');
  });
});
