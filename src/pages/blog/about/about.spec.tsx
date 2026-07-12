import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { executeGraphQL } from '@/shared/graphql';

import { BlogAboutPage } from '../index';

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
    Avatar: ({ size, icon, src }: { size?: number; icon?: React.ReactNode; src?: string }) => (
      <span data-testid="avatar" data-size={size} data-src={src}>
        {icon}
      </span>
    ),
    Card: ({ children }: { children?: React.ReactNode }) => (
      <div data-testid="card">{children}</div>
    ),
    Spin: () => <div data-testid="spin">Loading...</div>,
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

vi.mock('@/shared/graphql', () => ({
  executeGraphQL: vi.fn(),
}));

vi.mock('@/features/blog', () => ({
  GET_BLOG_PROFILE: {
    loc: {
      source: {
        body: 'mock blog profile query',
      },
    },
  },
}));

const mockProfile = {
  name: 'Test Author',
  avatar: 'https://test.com/avatar.png',
  bio: 'A test bio',
  githubUrl: 'https://github.com/test',
  email: 'test@example.com',
  websiteUrl: 'https://test.com',
  skills: {
    language: ['TypeScript', 'JavaScript'],
    framework: ['React', 'NestJS'],
  },
};

describe('BlogAboutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(executeGraphQL).mockResolvedValue({ blogProfile: mockProfile });
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
        <BlogAboutPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('spin')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
    });
  });

  it('should render about page with data from API', async () => {
    render(
      <MemoryRouter>
        <BlogAboutPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('title-2')).toHaveTextContent('Test Author');
    expect(screen.getByTestId('avatar')).toHaveAttribute('data-src', 'https://test.com/avatar.png');
    expect(screen.getByTestId('github-icon')).toBeInTheDocument();
    expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
    expect(screen.getByTestId('link-icon')).toBeInTheDocument();
  });

  it('should render skill tags from API', async () => {
    render(
      <MemoryRouter>
        <BlogAboutPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
    });

    const skillTags = screen.getAllByTestId('tag');
    expect(skillTags.length).toBe(4);
    expect(skillTags.some((tag) => tag.textContent === 'TypeScript')).toBe(true);
    expect(skillTags.some((tag) => tag.textContent === 'React')).toBe(true);
    expect(skillTags.some((tag) => tag.textContent === 'NestJS')).toBe(true);
  });

  it('should render contact information from API', async () => {
    render(
      <MemoryRouter>
        <BlogAboutPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
    });

    expect(screen.getByText('联系方式')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('https://github.com/test')).toBeInTheDocument();
  });

  it('should render default profile when API returns null', async () => {
    vi.mocked(executeGraphQL).mockResolvedValue({ blogProfile: null });

    render(
      <MemoryRouter>
        <BlogAboutPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('title-2')).toHaveTextContent('YYan');
  });

  it('should render error state when API call fails', async () => {
    vi.mocked(executeGraphQL).mockRejectedValue(new Error('Network error'));

    render(
      <MemoryRouter>
        <BlogAboutPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('alert')).toHaveAttribute('data-type', 'error');
    expect(screen.getByTestId('alert-message')).toHaveTextContent('加载失败');
    expect(screen.getByTestId('alert-description')).toHaveTextContent(
      '个人信息加载失败，请稍后重试',
    );
  });

  it('should call executeGraphQL with correct query', async () => {
    render(
      <MemoryRouter>
        <BlogAboutPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(executeGraphQL).toHaveBeenCalled();
    });

    expect(executeGraphQL).toHaveBeenCalledWith('mock blog profile query', {});
  });
});