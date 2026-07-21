import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { executeGraphQL } from '@/shared/graphql';

import { BlogSidebar } from './blog-sidebar';

vi.mock('antd', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Card: ({ children, variant }: { children?: React.ReactNode; variant?: string }) => (
      <div data-testid="card" data-variant={String(variant)}>
        {children}
      </div>
    ),
    Alert: ({
      title,
      description,
      type,
      icon,
    }: {
      title?: string;
      description?: string;
      type?: 'info';
      icon?: React.ReactNode;
    }) => (
      <div data-testid="alert" data-type={type}>
        {icon}
        <span data-testid="alert-message">{title}</span>
        {description && <span data-testid="alert-description">{description}</span>}
      </div>
    ),
    Avatar: ({ size, icon }: { size?: number; icon?: React.ReactNode }) => (
      <span data-testid="avatar" data-size={String(size)}>
        {icon}
      </span>
    ),
    Tag: ({
      children,
      color,
      onClick,
    }: {
      children?: React.ReactNode;
      color?: string;
      onClick?: () => void;
    }) => (
      <span data-testid="tag" data-color={color} onClick={onClick}>
        {children}
      </span>
    ),
  };
});

vi.mock('@ant-design/icons', () => ({
  BookOutlined: () => <span data-testid="book-icon" />,
  CalendarOutlined: () => <span data-testid="calendar-icon" />,
  MessageOutlined: () => <span data-testid="message-icon" />,
  TagOutlined: () => <span data-testid="tag-icon" />,
  UserOutlined: () => <span data-testid="user-icon" />,
}));

vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('@/shared/graphql', () => ({
  executeGraphQL: vi.fn(),
}));

vi.mock('@/features/blog', () => ({
  GET_CATEGORIES: {
    loc: {
      source: {
        body: 'mock categories query',
      },
    },
  },
  GET_TAGS: {
    loc: {
      source: {
        body: 'mock tags query',
      },
    },
  },
  GET_ARCHIVES: {
    loc: {
      source: {
        body: 'mock archives query',
      },
    },
  },
}));

const createCategories = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `category-${i + 1}`,
    name: `Category ${i + 1}`,
    slug: `category-${i + 1}`,
    description: `Description for category ${i + 1}`,
    parentId: i > 0 ? `category-${i}` : undefined,
  }));
};

const createTags = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `tag-${i + 1}`,
    name: `Tag ${i + 1}`,
    slug: `tag-${i + 1}`,
    description: `Description for tag ${i + 1}`,
  }));
};

const createArchives = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    year: 2024 - Math.floor(i / 12),
    month: (i % 12) + 1,
    count: 5 + i,
  }));
};

describe('BlogSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    let callCount = 0;
    vi.mocked(executeGraphQL).mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return { categories: createCategories(3) };
      } else if (callCount === 2) {
        return { tags: createTags(5) };
      } else {
        return { archives: createArchives(6) };
      }
    });
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

  it('renders blog owner info', async () => {
    render(
      <MemoryRouter>
        <BlogSidebar />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('博主昵称')).toBeInTheDocument();
    expect(
      screen.getByText('热爱技术，分享生活。这里记录我的技术心得和生活感悟。'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('avatar')).toHaveAttribute('data-size', '64');
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
  });

  it('renders announcement', async () => {
    render(
      <MemoryRouter>
        <BlogSidebar />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('alert')).toBeInTheDocument();
    expect(screen.getByTestId('alert-message')).toHaveTextContent('公告');
    expect(screen.getByTestId('alert-description')).toHaveTextContent(
      '欢迎访问我的博客！感谢大家的支持与关注。',
    );
    expect(screen.getByTestId('message-icon')).toBeInTheDocument();
  });

  it('renders categories section with data', async () => {
    render(
      <MemoryRouter>
        <BlogSidebar />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('分类')).toBeInTheDocument();
    expect(screen.getByTestId('book-icon')).toBeInTheDocument();
    expect(screen.getByText('Category 1')).toBeInTheDocument();
    expect(screen.getByText('Category 2')).toBeInTheDocument();
    expect(screen.getByText('Category 3')).toBeInTheDocument();
  });

  it('renders empty categories state', async () => {
    vi.mocked(executeGraphQL)
      .mockResolvedValueOnce({ categories: [] })
      .mockResolvedValueOnce({ tags: createTags(5) })
      .mockResolvedValueOnce({ archives: createArchives(6) });

    render(
      <MemoryRouter>
        <BlogSidebar />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('分类')).toBeInTheDocument();
    expect(screen.getByText('暂无分类')).toBeInTheDocument();
  });

  it('renders categories error state', async () => {
    let callCount = 0;
    vi.mocked(executeGraphQL).mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        throw new Error('Network error');
      } else if (callCount === 2) {
        return { tags: createTags(5) };
      } else {
        return { archives: createArchives(6) };
      }
    });

    render(
      <MemoryRouter>
        <BlogSidebar />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('分类')).toBeInTheDocument();
    expect(screen.getByText('加载失败')).toBeInTheDocument();
  });

  it('renders tags section with data', async () => {
    render(
      <MemoryRouter>
        <BlogSidebar />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('标签云')).toBeInTheDocument();
    expect(screen.getByTestId('tag-icon')).toBeInTheDocument();

    const tags = screen.getAllByTestId('tag');
    expect(tags.length).toBe(5);
    expect(tags[0].textContent).toBe('Tag 1');
    expect(tags[1].textContent).toBe('Tag 2');
    expect(tags[2].textContent).toBe('Tag 3');
    expect(tags[3].textContent).toBe('Tag 4');
    expect(tags[4].textContent).toBe('Tag 5');
  });

  it('renders empty tags state', async () => {
    vi.mocked(executeGraphQL)
      .mockResolvedValueOnce({ categories: createCategories(3) })
      .mockResolvedValueOnce({ tags: [] })
      .mockResolvedValueOnce({ archives: createArchives(6) });

    render(
      <MemoryRouter>
        <BlogSidebar />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('标签云')).toBeInTheDocument();
    expect(screen.getByText('暂无标签')).toBeInTheDocument();
  });

  it('renders tags error state', async () => {
    let callCount = 0;
    vi.mocked(executeGraphQL).mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return { categories: createCategories(3) };
      } else if (callCount === 2) {
        throw new Error('Network error');
      } else {
        return { archives: createArchives(6) };
      }
    });

    render(
      <MemoryRouter>
        <BlogSidebar />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('标签云')).toBeInTheDocument();
    expect(screen.getByText('加载失败')).toBeInTheDocument();
  });

  it('renders archives section with data', async () => {
    render(
      <MemoryRouter>
        <BlogSidebar />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('归档')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
  });

  it('renders empty archives state', async () => {
    vi.mocked(executeGraphQL)
      .mockResolvedValueOnce({ categories: createCategories(3) })
      .mockResolvedValueOnce({ tags: createTags(5) })
      .mockResolvedValueOnce({ archives: [] });

    render(
      <MemoryRouter>
        <BlogSidebar />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('归档')).toBeInTheDocument();
    expect(screen.getByText('暂无归档')).toBeInTheDocument();
  });

  it('renders archives error state', async () => {
    let callCount = 0;
    vi.mocked(executeGraphQL).mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return { categories: createCategories(3) };
      } else if (callCount === 2) {
        return { tags: createTags(5) };
      } else {
        throw new Error('Network error');
      }
    });

    render(
      <MemoryRouter>
        <BlogSidebar />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('归档')).toBeInTheDocument();
    expect(screen.getByText('加载失败')).toBeInTheDocument();
  });

  it('applies open class when isOpen is true', async () => {
    render(
      <MemoryRouter>
        <BlogSidebar isOpen={true} />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    });

    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('open');
  });

  it('does not apply open class when isOpen is false', async () => {
    render(
      <MemoryRouter>
        <BlogSidebar isOpen={false} />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    });

    const sidebar = screen.getByRole('complementary');
    expect(sidebar).not.toHaveClass('open');
  });

  it('applies default isOpen as false', async () => {
    render(
      <MemoryRouter>
        <BlogSidebar />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    });

    const sidebar = screen.getByRole('complementary');
    expect(sidebar).not.toHaveClass('open');
  });

  it('calls executeGraphQL with correct queries', async () => {
    render(
      <MemoryRouter>
        <BlogSidebar />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(executeGraphQL).toHaveBeenCalledTimes(3);
    });

    expect(executeGraphQL).toHaveBeenCalledWith('mock categories query', {});
    expect(executeGraphQL).toHaveBeenCalledWith('mock tags query', {});
    expect(executeGraphQL).toHaveBeenCalledWith('mock archives query', {});
  });
});
