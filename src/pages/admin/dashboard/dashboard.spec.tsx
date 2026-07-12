import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminDashboardPage } from '../dashboard';

vi.mock('antd', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Card: ({ children }: { children?: React.ReactNode }) => (
      <div data-testid="card">{children}</div>
    ),
    Row: ({ children }: { children?: React.ReactNode }) => <div data-testid="row">{children}</div>,
    Col: ({ span, children }: { span?: number; children?: React.ReactNode }) => (
      <div data-testid="col" data-span={span}>
        {children}
      </div>
    ),
    Statistic: ({ title, value }: { title?: string; value?: number; prefix?: React.ReactNode }) => (
      <div data-testid="statistic" data-title={title}>
        <span data-testid="stat-value">{value}</span>
      </div>
    ),
  };
});

vi.mock('@ant-design/icons', () => ({
  FileTextOutlined: () => <span data-testid="icon-file-text" />,
  MessageOutlined: () => <span data-testid="icon-message" />,
  EyeOutlined: () => <span data-testid="icon-eye" />,
  HeartOutlined: () => <span data-testid="icon-heart" />,
}));

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should render dashboard title', () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('仪表盘')).toBeInTheDocument();
  });

  it('should render all statistic cards', () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );

    const statistics = screen.getAllByTestId('statistic');
    expect(statistics.length).toBe(4);

    const titles = statistics.map((stat) => stat.getAttribute('data-title'));
    expect(titles).toContain('文章总数');
    expect(titles).toContain('评论总数');
    expect(titles).toContain('总阅读量');
    expect(titles).toContain('总点赞量');
  });

  it('should render correct statistic values', () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );

    const values = screen.getAllByTestId('stat-value').map((el) => el.textContent);
    expect(values).toContain('42');
    expect(values).toContain('128');
    expect(values).toContain('15680');
    expect(values).toContain('3240');
  });
});
