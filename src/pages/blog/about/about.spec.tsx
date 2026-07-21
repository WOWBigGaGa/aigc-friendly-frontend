import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BlogAboutPage } from '../index';

vi.mock('antd', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Avatar: ({ size, icon, src }: { size?: number; icon?: React.ReactNode; src?: string }) => (
      <span data-testid="avatar" data-size={size} data-src={src}>
        {icon}
      </span>
    ),
    Card: ({ children }: { children?: React.ReactNode }) => (
      <div data-testid="card">{children}</div>
    ),
    Tag: ({ color, children }: { color?: string; children?: React.ReactNode }) => (
      <span data-testid="tag" data-color={color}>
        {children}
      </span>
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

vi.mock('@ant-design/icons', () => ({
  GithubOutlined: () => <span data-testid="github-icon" />,
  MailOutlined: () => <span data-testid="mail-icon" />,
  LinkOutlined: () => <span data-testid="link-icon" />,
  UserOutlined: () => <span data-testid="user-icon" />,
}));

describe('BlogAboutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders profile name and bio', () => {
    render(
      <MemoryRouter>
        <BlogAboutPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('title-2')).toHaveTextContent('YYan');
    expect(screen.getByText(/热爱编程/)).toBeInTheDocument();
  });

  it('renders social links', () => {
    render(
      <MemoryRouter>
        <BlogAboutPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('github-icon')).toBeInTheDocument();
    expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
  });

  it('renders skill tags from static profile', () => {
    render(
      <MemoryRouter>
        <BlogAboutPage />
      </MemoryRouter>,
    );

    const skillTags = screen.getAllByTestId('tag');
    expect(skillTags.length).toBeGreaterThan(0);
    expect(skillTags.some((tag) => tag.textContent === 'TypeScript')).toBe(true);
    expect(skillTags.some((tag) => tag.textContent === 'React')).toBe(true);
    expect(skillTags.some((tag) => tag.textContent === 'NestJS')).toBe(true);
  });

  it('renders contact information', () => {
    render(
      <MemoryRouter>
        <BlogAboutPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('联系方式')).toBeInTheDocument();
    expect(screen.getByText('Yyan_BigGaGa@outlook.com')).toBeInTheDocument();
    expect(screen.getByText('https://github.com/WOWBigGaGa')).toBeInTheDocument();
  });
});
