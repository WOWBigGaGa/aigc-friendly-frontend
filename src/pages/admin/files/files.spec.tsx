import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { executeGraphQL } from '@/shared/graphql/request';

import { AdminFilesPage } from './index';

type MockMessage = {
  success: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
};

vi.mock('dayjs', () => ({
  default: vi.fn(() => ({
    format: vi.fn(() => '2024-01-15'),
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
      loading,
    }: {
      children?: React.ReactNode;
      onClick?: () => void;
      type?: string;
      danger?: boolean;
      loading?: boolean;
    }) => (
      <button
        data-testid={`button-${type === 'primary' ? 'primary' : danger ? 'danger' : 'default'}`}
        onClick={onClick}
        disabled={loading}
      >
        {children}
      </button>
    ),
    Image: ({ src, alt }: { src?: string | undefined; alt?: string }) => (
      <img data-testid="file-image" src={src} alt={alt} />
    ),
    Upload: ({
      children,
      customRequest,
    }: {
      children?: React.ReactNode;
      customRequest?: (options: any) => void;
    }) => (
      <div
        data-testid="upload-wrapper"
        onClick={() =>
          customRequest?.({
            file: {
              name: 'test.jpg',
              type: 'image/jpeg',
              originFileObj: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
            },
          })
        }
      >
        {children}
      </div>
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
        <div data-testid="preview-modal">
          <div data-testid="modal-title">{title}</div>
          {children}
          <button data-testid="modal-close" onClick={onCancel}>
            关闭
          </button>
        </div>
      ) : null,
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
  };
});

vi.mock('@ant-design/icons', () => ({
  DeleteOutlined: () => <span data-testid="icon-delete" />,
  EyeOutlined: () => <span data-testid="icon-eye" />,
}));

vi.mock('@/shared/graphql/request', () => ({
  executeGraphQL: vi.fn(),
}));

describe('AdminFilesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should render files page title', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockResolvedValue({
      files: [],
    });

    render(
      <MemoryRouter>
        <AdminFilesPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('文件管理')).toBeInTheDocument();
  });

  it('should render loading state initially', async () => {
    const mockPromise = new Promise(() => {});
    (executeGraphQL as ReturnType<typeof vi.fn>).mockReturnValue(mockPromise);

    render(
      <MemoryRouter>
        <AdminFilesPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });

  it('should render empty state when no files', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockResolvedValue({
      files: [],
    });

    render(
      <MemoryRouter>
        <AdminFilesPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('暂无文件，请上传')).toBeInTheDocument();
    });
  });

  it('should render files grid with data', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockResolvedValue({
      files: [
        {
          id: 'file-1',
          originalName: 'test-image.jpg',
          storedName: '1234567890-test-image.jpg',
          path: './uploads/test.jpg',
          url: 'http://localhost:3000/uploads/test.jpg',
          mimeType: 'image/jpeg',
          size: 1024000,
          uploadedBy: '1',
          createdAt: '2024-01-15T10:30:00Z',
        },
      ],
    });

    render(
      <MemoryRouter>
        <AdminFilesPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('file-image')).toBeInTheDocument();
      expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
    });
  });

  it('should handle API error and show empty state', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API error'));

    const { message } = await import('antd');
    const mockMessage = message as unknown as MockMessage;

    render(
      <MemoryRouter>
        <AdminFilesPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockMessage.error).toHaveBeenCalledWith('加载文件失败，请稍后重试');
      expect(screen.getByText('暂无文件，请上传')).toBeInTheDocument();
    });
  });

  it('should show preview and delete buttons for each file', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockResolvedValue({
      files: [
        {
          id: 'file-1',
          originalName: 'test-image.jpg',
          storedName: '1234567890-test-image.jpg',
          path: './uploads/test.jpg',
          url: 'http://localhost:3000/uploads/test.jpg',
          mimeType: 'image/jpeg',
          size: 1024000,
          uploadedBy: '1',
          createdAt: '2024-01-15T10:30:00Z',
        },
      ],
    });

    render(
      <MemoryRouter>
        <AdminFilesPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('预览')).toBeInTheDocument();
      expect(screen.getByText('删除')).toBeInTheDocument();
    });
  });

  it('should open preview modal when preview button clicked', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockResolvedValue({
      files: [
        {
          id: 'file-1',
          originalName: 'test-image.jpg',
          storedName: '1234567890-test-image.jpg',
          path: './uploads/test.jpg',
          url: 'http://localhost:3000/uploads/test.jpg',
          mimeType: 'image/jpeg',
          size: 1024000,
          uploadedBy: '1',
          createdAt: '2024-01-15T10:30:00Z',
        },
      ],
    });

    render(
      <MemoryRouter>
        <AdminFilesPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const previewButton = screen.getByText('预览');
      fireEvent.click(previewButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('preview-modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-title')).toHaveTextContent('图片预览');
    });
  });

  it('should close preview modal when close button clicked', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockResolvedValue({
      files: [
        {
          id: 'file-1',
          originalName: 'test-image.jpg',
          storedName: '1234567890-test-image.jpg',
          path: './uploads/test.jpg',
          url: 'http://localhost:3000/uploads/test.jpg',
          mimeType: 'image/jpeg',
          size: 1024000,
          uploadedBy: '1',
          createdAt: '2024-01-15T10:30:00Z',
        },
      ],
    });

    render(
      <MemoryRouter>
        <AdminFilesPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const previewButton = screen.getByText('预览');
      fireEvent.click(previewButton);
    });

    await waitFor(() => {
      const closeButton = screen.getByTestId('modal-close');
      fireEvent.click(closeButton);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('preview-modal')).not.toBeInTheDocument();
    });
  });

  it('should call delete mutation and show success message', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        files: [
          {
            id: 'file-1',
            originalName: 'test-image.jpg',
            storedName: '1234567890-test-image.jpg',
            path: './uploads/test.jpg',
            url: 'http://localhost:3000/uploads/test.jpg',
            mimeType: 'image/jpeg',
            size: 1024000,
            uploadedBy: '1',
            createdAt: '2024-01-15T10:30:00Z',
          },
        ],
      })
      .mockResolvedValueOnce({ deleteFile: true })
      .mockResolvedValueOnce({ files: [] });

    const { message } = await import('antd');
    const mockMessage = message as unknown as MockMessage;

    render(
      <MemoryRouter>
        <AdminFilesPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const popconfirm = screen.getByTestId('popconfirm');
      fireEvent.click(popconfirm);
    });

    await waitFor(() => {
      expect(executeGraphQL).toHaveBeenCalledWith(expect.stringContaining('deleteFile'), {
        id: 'file-1',
      });
      expect(mockMessage.success).toHaveBeenCalledWith('文件删除成功');
    });
  });

  it('should show error message when delete fails', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        files: [
          {
            id: 'file-1',
            originalName: 'test-image.jpg',
            storedName: '1234567890-test-image.jpg',
            path: './uploads/test.jpg',
            url: 'http://localhost:3000/uploads/test.jpg',
            mimeType: 'image/jpeg',
            size: 1024000,
            uploadedBy: '1',
            createdAt: '2024-01-15T10:30:00Z',
          },
        ],
      })
      .mockRejectedValueOnce(new Error('API error'));

    const { message } = await import('antd');
    const mockMessage = message as unknown as MockMessage;

    render(
      <MemoryRouter>
        <AdminFilesPage />
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

  it('should format file size correctly', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockResolvedValue({
      files: [
        {
          id: 'file-1',
          originalName: 'small.jpg',
          storedName: 'small.jpg',
          path: './uploads/small.jpg',
          url: 'http://localhost:3000/uploads/small.jpg',
          mimeType: 'image/jpeg',
          size: 512,
          uploadedBy: '1',
          createdAt: '2024-01-15T10:30:00Z',
        },
        {
          id: 'file-2',
          originalName: 'medium.jpg',
          storedName: 'medium.jpg',
          path: './uploads/medium.jpg',
          url: 'http://localhost:3000/uploads/medium.jpg',
          mimeType: 'image/jpeg',
          size: 2048000,
          uploadedBy: '1',
          createdAt: '2024-01-15T10:30:00Z',
        },
      ],
    });

    render(
      <MemoryRouter>
        <AdminFilesPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/512 B/)).toBeInTheDocument();
      expect(screen.getByText(/2\.0 MB/)).toBeInTheDocument();
    });
  });
});
