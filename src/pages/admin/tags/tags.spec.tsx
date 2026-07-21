import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminTagsPage } from '../tags';

vi.mock('antd', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Button: ({ icon, children }: { icon?: React.ReactNode; children?: React.ReactNode }) => (
      <button data-testid="button">
        {icon}
        {children}
      </button>
    ),
    Table: ({
      columns,
      dataSource,
    }: {
      columns?: Array<{ title: string; key: string }>;
      dataSource?: Array<{ key: string; name: string }>;
    }) => (
      <table data-testid="table">
        <thead>
          <tr>
            {columns?.map((col) => (
              <th key={col.key}>{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataSource?.map((row) => (
            <tr key={row.key}>
              <td>{row.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ),
  };
});

vi.mock('@ant-design/icons', () => ({
  PlusOutlined: () => <span data-testid="icon-plus" />,
}));

vi.mock('@/shared/graphql', () => ({
  executeGraphQL: vi.fn(),
}));

import { executeGraphQL } from '@/shared/graphql';

describe('AdminTagsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should render tags page title', () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockResolvedValue({
      tags: [],
    });

    render(
      <MemoryRouter>
        <AdminTagsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('标签管理')).toBeInTheDocument();
  });

  it('should render new tag button', () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockResolvedValue({
      tags: [],
    });

    render(
      <MemoryRouter>
        <AdminTagsPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('button')).toHaveTextContent('新建标签');
  });

  it('should render tag table with columns', () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockResolvedValue({
      tags: [],
    });

    render(
      <MemoryRouter>
        <AdminTagsPage />
      </MemoryRouter>,
    );

    const table = screen.getByTestId('table');
    const headers = table.querySelectorAll('th');
    expect(headers.length).toBe(4);
    expect(headers[0].textContent).toBe('名称');
    expect(headers[1].textContent).toBe('Slug');
    expect(headers[2].textContent).toBe('创建时间');
    expect(headers[3].textContent).toBe('操作');
  });

  it('should render tag data rows', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockResolvedValue({
      tags: [
        {
          id: '1',
          name: 'React',
          slug: 'react',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: '2',
          name: 'TypeScript',
          slug: 'typescript',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ],
    });

    render(
      <MemoryRouter>
        <AdminTagsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const table = screen.getByTestId('table');
      const rows = table.querySelectorAll('tbody tr');
      expect(rows.length).toBe(2);

      const names = table.querySelectorAll('tbody td:first-child');
      expect(names[0].textContent).toBe('React');
      expect(names[1].textContent).toBe('TypeScript');
    });
  });
});
