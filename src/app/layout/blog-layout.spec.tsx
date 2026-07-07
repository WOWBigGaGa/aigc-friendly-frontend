// src/app/layout/blog-layout.spec.tsx

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '../providers';

import { BlogLayout } from './blog-layout';

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
    Tabs: ({
      items,
      onChange,
    }: {
      items: { key: string; label: string }[];
      onChange?: (key: string) => void;
    }) => (
      <div data-testid="tabs">
        {items.map((item) => (
          <button key={item.key} onClick={() => onChange?.(item.key)}>
            {item.label}
          </button>
        ))}
      </div>
    ),
    Segmented: () => <div data-testid="segmented" />,
    Tooltip: ({ children, title }: { children: React.ReactNode; title?: string }) => (
      <span title={title}>{children}</span>
    ),
  };
});

function TestHomePage() {
  return <div data-testid="home-page">Home Page</div>;
}

describe('BlogLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders header with title and navigation', () => {
    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/blog']}>
          <BlogLayout>
            <TestHomePage />
          </BlogLayout>
        </MemoryRouter>
      </ThemeProvider>,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('My Blog');
    expect(screen.getByText('首页')).toBeInTheDocument();
    expect(screen.getByText('关于我')).toBeInTheDocument();
    expect(screen.getByText('友链')).toBeInTheDocument();
  });

  it('renders sidebar with categories, tags, and archives', () => {
    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/blog']}>
          <BlogLayout>
            <TestHomePage />
          </BlogLayout>
        </MemoryRouter>
      </ThemeProvider>,
    );

    expect(screen.getByText('分类')).toBeInTheDocument();
    expect(screen.getByText('技术')).toBeInTheDocument();
    expect(screen.getByText('生活')).toBeInTheDocument();
    expect(screen.getByText('阅读')).toBeInTheDocument();

    expect(screen.getByText('标签')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();

    expect(screen.getByText('归档')).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/blog']}>
          <BlogLayout>
            <TestHomePage />
          </BlogLayout>
        </MemoryRouter>
      </ThemeProvider>,
    );

    expect(screen.getByText('© 2025 My Blog. All rights reserved.')).toBeInTheDocument();
  });

  it('navigates to home when title is clicked', () => {
    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/blog/about']}>
          <Routes>
            <Route path="/blog" element={<BlogLayout children={<TestHomePage />} />} />
            <Route
              path="/blog/about"
              element={<BlogLayout children={<div data-testid="about-page">About Page</div>} />}
            />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>,
    );

    expect(screen.getByTestId('about-page')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('heading', { level: 1 }));
  });

  it('toggles theme when button is clicked', () => {
    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/blog']}>
          <BlogLayout>
            <TestHomePage />
          </BlogLayout>
        </MemoryRouter>
      </ThemeProvider>,
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('applies dark class when theme is dark', () => {
    localStorage.setItem('color-scheme', 'dark');

    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/blog']}>
          <BlogLayout>
            <TestHomePage />
          </BlogLayout>
        </MemoryRouter>
      </ThemeProvider>,
    );

    expect(document.querySelector('.blog-shell')).toHaveClass('dark');
  });

  it('applies light class when theme is light', () => {
    localStorage.setItem('color-scheme', 'light');

    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/blog']}>
          <BlogLayout>
            <TestHomePage />
          </BlogLayout>
        </MemoryRouter>
      </ThemeProvider>,
    );

    expect(document.querySelector('.blog-shell')).not.toHaveClass('dark');
  });

  it('renders main content area', () => {
    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/blog']}>
          <BlogLayout>
            <TestHomePage />
          </BlogLayout>
        </MemoryRouter>
      </ThemeProvider>,
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('renders sidebar as aside element', () => {
    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/blog']}>
          <BlogLayout>
            <TestHomePage />
          </BlogLayout>
        </MemoryRouter>
      </ThemeProvider>,
    );

    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });

  it('has correct structure with header, content, and footer', () => {
    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/blog']}>
          <BlogLayout>
            <TestHomePage />
          </BlogLayout>
        </MemoryRouter>
      </ThemeProvider>,
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
