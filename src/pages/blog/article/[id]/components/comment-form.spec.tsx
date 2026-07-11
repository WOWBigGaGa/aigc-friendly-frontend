import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { executeGraphQL } from '@/shared/graphql';

import { CommentForm } from './comment-form';

vi.mock('@/features/blog', () => ({
  CREATE_COMMENT: { loc: { source: { body: 'mock create comment mutation' } } },
}));

vi.mock('@/shared/graphql', () => ({
  executeGraphQL: vi.fn(),
}));

vi.mock('antd', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Form: Object.assign(
      ({
        onFinish,
        children,
      }: {
        onFinish?: (values: Record<string, unknown>) => void;
        children?: React.ReactNode;
        layout?: string;
      }) => (
        <form
          data-testid="form"
          onSubmit={(e) => {
            e.preventDefault();
            if (onFinish) {
              onFinish({
                authorName: 'Test Author',
                authorEmail: 'test@example.com',
                content: 'Test comment content',
              });
            }
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
            getFieldValue: vi.fn(),
          },
        ],
        Item: ({
          name,
          label,
          children,
        }: {
          name?: string;
          label?: string;
          children?: React.ReactNode;
        }) => (
          <div data-testid={`form-item-${name}`}>
            <label>{label}</label>
            {children}
          </div>
        ),
      },
    ),
    Input: Object.assign(
      ({ placeholder }: { placeholder?: string }) => (
        <input data-testid="input" placeholder={placeholder} />
      ),
      {
        TextArea: ({ placeholder }: { placeholder?: string }) => (
          <textarea data-testid="textarea" placeholder={placeholder} />
        ),
      },
    ),
    Button: ({ children }: { children?: React.ReactNode }) => (
      <button data-testid="button" type="submit">
        {children}
      </button>
    ),
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

describe('CommentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders form fields correctly', () => {
    render(<CommentForm articleId="article-1" onSubmit={vi.fn()} />);

    expect(screen.getByTestId('form-item-authorName')).toBeInTheDocument();
    expect(screen.getByTestId('form-item-authorEmail')).toBeInTheDocument();
    expect(screen.getByTestId('form-item-content')).toBeInTheDocument();
    expect(screen.getByText('提交评论')).toBeInTheDocument();
  });

  it('renders reply context when parentComment is provided', () => {
    render(
      <CommentForm
        articleId="article-1"
        parentComment={{ id: 'comment-1', authorName: 'Target User' }}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText('回复')).toBeInTheDocument();
    expect(screen.getByText('Target User')).toBeInTheDocument();
  });

  it('submits comment successfully', async () => {
    vi.mocked(executeGraphQL).mockResolvedValueOnce({ createComment: { id: 'comment-1' } });

    render(<CommentForm articleId="article-1" onSubmit={vi.fn()} />);

    const form = screen.getByTestId('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(executeGraphQL).toHaveBeenCalledTimes(1);
    });

    expect(executeGraphQL).toHaveBeenCalledWith(
      'mock create comment mutation',
      expect.objectContaining({
        input: expect.objectContaining({
          articleId: 'article-1',
          authorName: 'Test Author',
          authorEmail: 'test@example.com',
          content: 'Test comment content',
        }),
      }),
    );
  });

  it('calls onSubmit after successful comment creation', async () => {
    vi.mocked(executeGraphQL).mockResolvedValueOnce({ createComment: { id: 'comment-1' } });
    const onSubmit = vi.fn();

    render(<CommentForm articleId="article-1" onSubmit={onSubmit} />);

    const form = screen.getByTestId('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it('shows success message on successful submission', async () => {
    vi.mocked(executeGraphQL).mockResolvedValueOnce({ createComment: { id: 'comment-1' } });
    const message = await import('antd').then((m) => m.message);

    render(<CommentForm articleId="article-1" onSubmit={vi.fn()} />);

    const form = screen.getByTestId('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(message.success).toHaveBeenCalledWith('评论提交成功，等待审核');
    });
  });

  it('shows error message on failed submission', async () => {
    vi.mocked(executeGraphQL).mockRejectedValueOnce(new Error('Network error'));
    const message = await import('antd').then((m) => m.message);

    render(<CommentForm articleId="article-1" onSubmit={vi.fn()} />);

    const form = screen.getByTestId('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('评论提交失败，请稍后重试');
    });
  });

  it('passes parentId when replying to a comment', async () => {
    vi.mocked(executeGraphQL).mockResolvedValueOnce({ createComment: { id: 'comment-1' } });

    render(
      <CommentForm
        articleId="article-1"
        parentComment={{ id: 'parent-comment-id', authorName: 'Target User' }}
        onSubmit={vi.fn()}
      />,
    );

    const form = screen.getByTestId('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(executeGraphQL).toHaveBeenCalledWith(
        'mock create comment mutation',
        expect.objectContaining({
          input: expect.objectContaining({
            parentId: 'parent-comment-id',
          }),
        }),
      );
    });
  });

  it('does not pass parentId when creating a top-level comment', async () => {
    vi.mocked(executeGraphQL).mockResolvedValueOnce({ createComment: { id: 'comment-1' } });

    render(<CommentForm articleId="article-1" onSubmit={vi.fn()} />);

    const form = screen.getByTestId('form');
    fireEvent.submit(form);

    await waitFor(() => {
      const callArgs = vi.mocked(executeGraphQL).mock.calls[0][1];
      expect(callArgs.input.parentId).toBeUndefined();
    });
  });
});
