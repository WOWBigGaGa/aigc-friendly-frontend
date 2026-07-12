import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminCategoriesPage } from '../categories';

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

describe('AdminCategoriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should render categories page title', () => {
    render(
      <MemoryRouter>
        <AdminCategoriesPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('分类管理')).toBeInTheDocument();
  });

  it('should render new category button', () => {
    render(
      <MemoryRouter>
        <AdminCategoriesPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('button')).toHaveTextContent('新建分类');
  });

  it('should render category table with columns', () => {
    render(
      <MemoryRouter>
        <AdminCategoriesPage />
      </MemoryRouter>,
    );

    const table = screen.getByTestId('table');
    const headers = table.querySelectorAll('th');
    expect(headers.length).toBe(5);
    expect(headers[0].textContent).toBe('名称');
    expect(headers[1].textContent).toBe('Slug');
    expect(headers[2].textContent).toBe('描述');
    expect(headers[3].textContent).toBe('排序');
    expect(headers[4].textContent).toBe('操作');
  });

  it('should render category data rows', () => {
    render(
      <MemoryRouter>
        <AdminCategoriesPage />
      </MemoryRouter>,
    );

    const table = screen.getByTestId('table');
    const rows = table.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);

    const names = table.querySelectorAll('tbody td:first-child');
    expect(names[0].textContent).toBe('技术');
    expect(names[1].textContent).toBe('生活');
  });
});
