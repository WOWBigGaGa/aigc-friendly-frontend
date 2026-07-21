import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BlogLinksPage } from '../index';

vi.mock('antd', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Card: ({
      hoverable,
      onClick,
      children,
      className,
    }: {
      hoverable?: boolean;
      onClick?: () => void;
      children?: React.ReactNode;
      className?: string;
    }) => (
      <div
        data-testid="card"
        data-hoverable={String(!!hoverable)}
        data-class={className}
        onClick={onClick}
      >
        {children}
      </div>
    ),
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

vi.mock('@/shared/ui/lazy-image', () => ({
  LazyImage: ({ src, alt }: { src: string; alt: string }) => (
    <img data-testid="lazy-image" src={src} alt={alt} />
  ),
}));

describe('BlogLinksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders page title and description', () => {
    render(
      <MemoryRouter>
        <BlogLinksPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('title-2')).toHaveTextContent('友情链接');
    expect(screen.getByText('感谢以下朋友的支持与链接交换')).toBeInTheDocument();
  });

  it('renders empty state when no friend links', () => {
    render(
      <MemoryRouter>
        <BlogLinksPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('暂无友链，期待您的加入！')).toBeInTheDocument();
  });
});
