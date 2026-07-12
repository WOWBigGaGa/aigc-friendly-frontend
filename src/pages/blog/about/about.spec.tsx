import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BlogAboutPage } from '../index';

vi.mock('antd', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Avatar: ({ size, icon }: { size?: number; icon?: React.ReactNode }) => (
      <span data-testid="avatar" data-size={size}>
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

  it('should render about page with basic information', () => {
    render(
      <MemoryRouter>
        <BlogAboutPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    expect(screen.getByTestId('title-2')).toHaveTextContent('YYan');
  });

  it('should render social links', () => {
    render(
      <MemoryRouter>
        <BlogAboutPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('github-icon')).toBeInTheDocument();
    expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
    expect(screen.getByTestId('link-icon')).toBeInTheDocument();
  });

  it('should render about section', () => {
    render(
      <MemoryRouter>
        <BlogAboutPage />
      </MemoryRouter>,
    );

    const titles = screen.getAllByTestId(/title-\d/);
    const aboutTitle = titles.find((el) => el.textContent === '关于我');
    expect(aboutTitle).toBeInTheDocument();

    const paragraphs = screen.getAllByTestId('paragraph');
    expect(paragraphs.length).toBeGreaterThan(0);
  });

  it('should render skill tags', () => {
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
    expect(skillTags.some((tag) => tag.textContent === 'PostgreSQL')).toBe(true);
  });

  it('should render contact information', () => {
    render(
      <MemoryRouter>
        <BlogAboutPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('联系方式')).toBeInTheDocument();
    expect(screen.getByText('邮箱：')).toBeInTheDocument();
    expect(screen.getByText('GitHub：')).toBeInTheDocument();
    expect(screen.getByText('https://github.com/WOWBigGaGa')).toBeInTheDocument();
  });
});
