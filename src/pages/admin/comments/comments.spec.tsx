import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { executeGraphQL } from '@/shared/graphql/request';

import { AdminCommentsPage } from '../comments';

type MockMessage = {
  success: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
};

vi.mock('dayjs', () => ({
  default: vi.fn(() => ({
    format: vi.fn(() => '2024-01-15 10:30:00'),
  })),
}));

vi.mock('antd', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Button: ({
      children,
      onClick,
      type,
      danger,
    }: {
      children?: React.ReactNode;
      onClick?: () => void;
      type?: string;
      danger?: boolean;
    }) => (
      <button
        data-testid={`button-${type === 'primary' ? 'primary' : danger ? 'danger' : 'default'}`}
        onClick={onClick}
      >
        {children}
      </button>
    ),
    Table: ({
      columns,
      dataSource,
      loading,
    }: {
      columns?: Array<{
        title: string;
        key: string;
        render?: (text: unknown, record: unknown) => React.ReactNode;
      }>;
      dataSource?: Array<{ id: string; status: string }>;
      loading?: boolean;
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
          {loading ? (
            <tr>
              <td colSpan={columns?.length || 6}>Loading...</td>
            </tr>
          ) : (
            dataSource?.map((row) => (
              <tr key={row.id} data-testid={`row-${row.id}`}>
                <td>{row.status}</td>
                <td data-testid={`actions-${row.id}`}>
                  {columns?.find((col) => col.key === 'action')?.render?.(undefined, row)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    ),
    Tag: ({ children, color }: { children?: React.ReactNode; color?: string }) => (
      <span data-testid={`tag-${color || 'default'}`}>{children}</span>
    ),
    Popconfirm: ({
      children,
      onConfirm,
    }: {
      children?: React.ReactNode;
      onConfirm?: () => void;
    }) => (
      <span onClick={onConfirm} data-testid="popconfirm">
        {children}
      </span>
    ),
    Space: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
    Typography: {
      Title: ({ children }: { children?: React.ReactNode }) => <h2>{children}</h2>,
      Text: ({ children, type }: { children?: React.ReactNode; type?: string }) => (
        <span data-testid={`text-${type || 'default'}`}>{children}</span>
      ),
    },
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
    Select: ({
      value,
      onChange,
      options,
    }: {
      value?: string;
      onChange?: (value: string) => void;
      options?: Array<{ value: string; label: string }>;
    }) => (
      <select
        data-testid="status-filter"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      >
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    ),
    Modal: ({
      title,
      visible,
      onCancel,
      children,
    }: {
      title?: string;
      visible?: boolean;
      onCancel?: () => void;
      children?: React.ReactNode;
    }) =>
      visible ? (
        <div data-testid="reply-modal">
          <div data-testid="modal-title">{title}</div>
          {children}
          <button data-testid="modal-cancel" onClick={onCancel}>
            关闭
          </button>
        </div>
      ) : null,
    Form: Object.assign(
      ({
        onFinish,
        children,
      }: {
        onFinish?: (values: Record<string, unknown>) => void;
        children?: React.ReactNode;
      }) => (
        <form
          data-testid="reply-form"
          onSubmit={(e) => {
            e.preventDefault();
            onFinish?.({ content: (e.target as HTMLFormElement).querySelector('textarea')?.value });
          }}
        >
          {children}
        </form>
      ),
      {
        useForm: () => [
          {
            resetFields: vi.fn(),
            setFieldsValue: vi.fn(),
          },
        ],
        Item: ({
          label,
          name,
          children,
        }: {
          label?: string;
          name?: string;
          children?: React.ReactNode;
        }) => (
          <div data-testid={`form-item-${name}`}>
            {label && <label>{label}</label>}
            {children}
          </div>
        ),
      },
    ),
    Input: {
      TextArea: ({ placeholder, rows }: { placeholder?: string; rows?: number }) => (
        <textarea data-testid="reply-textarea" placeholder={placeholder} rows={rows} />
      ),
    },
  };
});

vi.mock('@ant-design/icons', () => ({
  CheckOutlined: () => <span data-testid="icon-check" />,
  CloseOutlined: () => <span data-testid="icon-close" />,
  DeleteOutlined: () => <span data-testid="icon-delete" />,
  MessageOutlined: () => <span data-testid="icon-message" />,
}));

vi.mock('@/shared/graphql/request', () => ({
  executeGraphQL: vi.fn(),
}));

describe('AdminCommentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should render comments page title', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockResolvedValue({
      allComments: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
      },
    });

    render(
      <MemoryRouter>
        <AdminCommentsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('评论管理')).toBeInTheDocument();
  });

  it('should render loading state initially', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockResolvedValue({
      allComments: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
      },
    });

    render(
      <MemoryRouter>
        <AdminCommentsPage />
      </MemoryRouter>,
    );

    const table = screen.getByTestId('table');
    expect(table.textContent).toContain('Loading...');
  });

  it('should render comment table with data', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockResolvedValue({
      allComments: {
        items: [
          {
            id: 'comment-1',
            articleId: 'article-1',
            authorName: '张三',
            authorEmail: 'zhangsan@example.com',
            content: '很好的文章！',
            status: 'PENDING',
            createdAt: '2024-01-15T10:30:00Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
      },
    });

    render(
      <MemoryRouter>
        <AdminCommentsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const table = screen.getByTestId('table');
      expect(table).toBeInTheDocument();
    });
  });

  it('should handle API error and show empty table', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API error'));

    render(
      <MemoryRouter>
        <AdminCommentsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const table = screen.getByTestId('table');
      expect(table).toBeInTheDocument();
    });
  });

  it('should show approve and reject buttons for pending comments', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockResolvedValue({
      allComments: {
        items: [
          {
            id: 'comment-1',
            articleId: 'article-1',
            authorName: '张三',
            authorEmail: 'zhangsan@example.com',
            content: '很好的文章！',
            status: 'PENDING',
            createdAt: '2024-01-15T10:30:00Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
      },
    });

    render(
      <MemoryRouter>
        <AdminCommentsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('通过')).toBeInTheDocument();
      expect(screen.getByText('驳回')).toBeInTheDocument();
    });
  });

  it('should hide approve and reject buttons for approved/rejected comments', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockResolvedValue({
      allComments: {
        items: [
          {
            id: 'comment-1',
            articleId: 'article-1',
            authorName: '张三',
            authorEmail: 'zhangsan@example.com',
            content: '很好的文章！',
            status: 'APPROVED',
            createdAt: '2024-01-15T10:30:00Z',
          },
          {
            id: 'comment-2',
            articleId: 'article-2',
            authorName: '李四',
            authorEmail: 'lisi@example.com',
            content: '学习了',
            status: 'REJECTED',
            createdAt: '2024-01-16T10:30:00Z',
          },
        ],
        total: 2,
        page: 1,
        pageSize: 10,
      },
    });

    render(
      <MemoryRouter>
        <AdminCommentsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByText('通过')).not.toBeInTheDocument();
      expect(screen.queryByText('驳回')).not.toBeInTheDocument();
    });
  });

  it('should show delete button for all comments', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockResolvedValue({
      allComments: {
        items: [
          {
            id: 'comment-1',
            articleId: 'article-1',
            authorName: '张三',
            authorEmail: 'zhangsan@example.com',
            content: '很好的文章！',
            status: 'APPROVED',
            createdAt: '2024-01-15T10:30:00Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
      },
    });

    render(
      <MemoryRouter>
        <AdminCommentsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('删除')).toBeInTheDocument();
    });
  });

  it('should call approve mutation and show success message', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        allComments: {
          items: [
            {
              id: 'comment-1',
              articleId: 'article-1',
              authorName: '张三',
              authorEmail: 'zhangsan@example.com',
              content: '很好的文章！',
              status: 'PENDING',
              createdAt: '2024-01-15T10:30:00Z',
            },
          ],
          total: 1,
          page: 1,
          pageSize: 10,
        },
      })
      .mockResolvedValueOnce({
        approveComment: { id: 'comment-1', status: 'APPROVED' },
      })
      .mockResolvedValueOnce({
        allComments: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10,
        },
      });

    const { message } = await import('antd');
    const mockMessage = message as unknown as MockMessage;

    render(
      <MemoryRouter>
        <AdminCommentsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const approveButton = screen.getByText('通过');
      fireEvent.click(approveButton);
    });

    await waitFor(() => {
      expect(executeGraphQL).toHaveBeenCalledWith(expect.stringContaining('approveComment'), {
        id: 'comment-1',
      });
      expect(mockMessage.success).toHaveBeenCalledWith('评论已通过');
    });
  });

  it('should call reject mutation and show success message', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        allComments: {
          items: [
            {
              id: 'comment-1',
              articleId: 'article-1',
              authorName: '张三',
              authorEmail: 'zhangsan@example.com',
              content: '很好的文章！',
              status: 'PENDING',
              createdAt: '2024-01-15T10:30:00Z',
            },
          ],
          total: 1,
          page: 1,
          pageSize: 10,
        },
      })
      .mockResolvedValueOnce({
        rejectComment: { id: 'comment-1', status: 'REJECTED' },
      })
      .mockResolvedValueOnce({
        allComments: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10,
        },
      });

    const { message } = await import('antd');
    const mockMessage = message as unknown as MockMessage;

    render(
      <MemoryRouter>
        <AdminCommentsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const rejectButton = screen.getByText('驳回');
      fireEvent.click(rejectButton);
    });

    await waitFor(() => {
      expect(executeGraphQL).toHaveBeenCalledWith(expect.stringContaining('rejectComment'), {
        id: 'comment-1',
      });
      expect(mockMessage.success).toHaveBeenCalledWith('评论已驳回');
    });
  });

  it('should show error message when approve fails', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        allComments: {
          items: [
            {
              id: 'comment-1',
              articleId: 'article-1',
              authorName: '张三',
              authorEmail: 'zhangsan@example.com',
              content: '很好的文章！',
              status: 'PENDING',
              createdAt: '2024-01-15T10:30:00Z',
            },
          ],
          total: 1,
          page: 1,
          pageSize: 10,
        },
      })
      .mockRejectedValueOnce(new Error('API error'));

    const { message } = await import('antd');
    const mockMessage = message as unknown as MockMessage;

    render(
      <MemoryRouter>
        <AdminCommentsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const approveButton = screen.getByText('通过');
      fireEvent.click(approveButton);
    });

    await waitFor(() => {
      expect(mockMessage.error).toHaveBeenCalledWith('操作失败，请稍后重试');
    });
  });

  it('should show error message when delete fails', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        allComments: {
          items: [
            {
              id: 'comment-1',
              articleId: 'article-1',
              authorName: '张三',
              authorEmail: 'zhangsan@example.com',
              content: '很好的文章！',
              status: 'APPROVED',
              createdAt: '2024-01-15T10:30:00Z',
            },
          ],
          total: 1,
          page: 1,
          pageSize: 10,
        },
      })
      .mockRejectedValueOnce(new Error('API error'));

    const { message } = await import('antd');
    const mockMessage = message as unknown as MockMessage;

    render(
      <MemoryRouter>
        <AdminCommentsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const popconfirm = screen.getByTestId('popconfirm');
      fireEvent.click(popconfirm);
    });

    await waitFor(() => {
      expect(mockMessage.error).toHaveBeenCalledWith('删除失败，请稍后重试');
    });
  });

  it('should show reply button for approved comments', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockResolvedValue({
      allComments: {
        items: [
          {
            id: 'comment-1',
            articleId: 'article-1',
            authorName: '张三',
            authorEmail: 'zhangsan@example.com',
            content: '很好的文章！',
            status: 'APPROVED',
            createdAt: '2024-01-15T10:30:00Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
      },
    });

    render(
      <MemoryRouter>
        <AdminCommentsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('回复')).toBeInTheDocument();
    });
  });

  it('should hide reply button for pending and rejected comments', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockResolvedValue({
      allComments: {
        items: [
          {
            id: 'comment-1',
            articleId: 'article-1',
            authorName: '张三',
            authorEmail: 'zhangsan@example.com',
            content: '很好的文章！',
            status: 'PENDING',
            createdAt: '2024-01-15T10:30:00Z',
          },
          {
            id: 'comment-2',
            articleId: 'article-2',
            authorName: '李四',
            authorEmail: 'lisi@example.com',
            content: '学习了',
            status: 'REJECTED',
            createdAt: '2024-01-16T10:30:00Z',
          },
        ],
        total: 2,
        page: 1,
        pageSize: 10,
      },
    });

    render(
      <MemoryRouter>
        <AdminCommentsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByText('回复')).not.toBeInTheDocument();
    });
  });

  it('should call reply mutation and show success message', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        allComments: {
          items: [
            {
              id: 'comment-1',
              articleId: 'article-1',
              authorName: '张三',
              authorEmail: 'zhangsan@example.com',
              content: '很好的文章！',
              status: 'APPROVED',
              createdAt: '2024-01-15T10:30:00Z',
            },
          ],
          total: 1,
          page: 1,
          pageSize: 10,
        },
      })
      .mockResolvedValueOnce({
        replyComment: { id: 'comment-1', content: '感谢您的评论！' },
      })
      .mockResolvedValueOnce({
        allComments: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10,
        },
      });

    const { message } = await import('antd');
    const mockMessage = message as unknown as MockMessage;

    render(
      <MemoryRouter>
        <AdminCommentsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('回复')).toBeInTheDocument();
    });

    const replyButton = screen.getByText('回复');
    fireEvent.click(replyButton);

    await waitFor(() => {
      expect(screen.getByTestId('reply-modal')).toBeInTheDocument();
    });

    const textArea = screen.getByTestId('reply-textarea');
    fireEvent.change(textArea, { target: { value: '感谢您的评论！' } });

    const submitButton = screen.getByText('提交回复');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(executeGraphQL).toHaveBeenCalledWith(expect.stringContaining('replyComment'), {
        id: 'comment-1',
        content: '感谢您的评论！',
      });
      expect(mockMessage.success).toHaveBeenCalledWith('回复成功');
    });
  });

  it('should show error message when reply fails', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        allComments: {
          items: [
            {
              id: 'comment-1',
              articleId: 'article-1',
              authorName: '张三',
              authorEmail: 'zhangsan@example.com',
              content: '很好的文章！',
              status: 'APPROVED',
              createdAt: '2024-01-15T10:30:00Z',
            },
          ],
          total: 1,
          page: 1,
          pageSize: 10,
        },
      })
      .mockRejectedValueOnce(new Error('API error'));

    const { message } = await import('antd');
    const mockMessage = message as unknown as MockMessage;

    render(
      <MemoryRouter>
        <AdminCommentsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('回复')).toBeInTheDocument();
    });

    const replyButton = screen.getByText('回复');
    fireEvent.click(replyButton);

    await waitFor(() => {
      expect(screen.getByTestId('reply-modal')).toBeInTheDocument();
    });

    const textArea = screen.getByTestId('reply-textarea');
    fireEvent.change(textArea, { target: { value: '感谢您的评论！' } });

    const submitButton = screen.getByText('提交回复');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMessage.error).toHaveBeenCalledWith('回复失败，请稍后重试');
    });
  });
});
