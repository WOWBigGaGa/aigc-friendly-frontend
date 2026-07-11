import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CommentList } from './comment-list';

vi.mock('antd', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Avatar: ({ src, alt }: { src?: string; alt?: string }) => (
      <span data-testid="avatar" data-src={src}>
        {alt}
      </span>
    ),
    Tooltip: ({ children, title }: { children?: React.ReactNode; title?: string }) => (
      <span data-testid="tooltip" data-title={title}>
        {children}
      </span>
    ),
    Typography: {
      Text: ({ children, strong }: { children?: React.ReactNode; strong?: boolean }) => (
        <span data-testid="text" data-strong={String(strong)}>
          {children}
        </span>
      ),
      Paragraph: ({ children }: { children?: React.ReactNode }) => (
        <p data-testid="paragraph">{children}</p>
      ),
    },
  };
});

vi.mock('@ant-design/icons', () => ({
  MessageOutlined: () => <span data-testid="message-icon" />,
}));

const createComment = (options: {
  id?: string;
  authorName?: string;
  authorEmail?: string;
  authorAvatar?: string;
  content?: string;
  parentId?: string | null;
  status?: string;
  createdAt?: string;
}) => ({
  id: options.id ?? 'comment-1',
  articleId: 'article-1',
  authorName: options.authorName ?? 'Test User',
  authorEmail: options.authorEmail ?? 'test@example.com',
  authorAvatar: options.authorAvatar ?? '',
  content: options.content ?? 'This is a test comment.',
  parentId: options.parentId ?? null,
  status: options.status ?? 'APPROVED',
  createdAt: options.createdAt ?? new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

describe('CommentList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders empty state when no comments', () => {
    render(<CommentList comments={[]} onReply={vi.fn()} />);

    expect(screen.getByText('暂无评论，快来发表第一条评论吧！')).toBeInTheDocument();
  });

  it('renders single comment correctly', () => {
    const comment = createComment({
      content: 'Hello, this is my first comment!',
    });

    render(<CommentList comments={[comment]} onReply={vi.fn()} />);

    const authorNames = screen.getAllByText('Test User');
    expect(authorNames.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Hello, this is my first comment!')).toBeInTheDocument();
    expect(screen.getByTestId('message-icon')).toBeInTheDocument();
    expect(screen.getByText('回复')).toBeInTheDocument();
  });

  it('renders nested comments (楼中楼)', () => {
    const parentComment = createComment({ id: 'comment-1', content: 'Parent comment' });
    const childComment = createComment({
      id: 'comment-2',
      content: 'Reply to parent',
      parentId: 'comment-1',
      authorName: 'Reply User',
    });

    render(<CommentList comments={[parentComment, childComment]} onReply={vi.fn()} />);

    expect(screen.getByText('Parent comment')).toBeInTheDocument();
    expect(screen.getByText('Reply to parent')).toBeInTheDocument();
    const replyUserElements = screen.getAllByText('Reply User');
    expect(replyUserElements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders up to 3 levels of nested comments', () => {
    const level1 = createComment({ id: 'c1', content: 'Level 1' });
    const level2 = createComment({
      id: 'c2',
      content: 'Level 2',
      parentId: 'c1',
      authorName: 'User2',
    });
    const level3 = createComment({
      id: 'c3',
      content: 'Level 3',
      parentId: 'c2',
      authorName: 'User3',
    });

    render(<CommentList comments={[level1, level2, level3]} onReply={vi.fn()} />);

    expect(screen.getByText('Level 1')).toBeInTheDocument();
    expect(screen.getByText('Level 2')).toBeInTheDocument();
    expect(screen.getByText('Level 3')).toBeInTheDocument();
  });

  it('hides pending comments (status is not APPROVED)', () => {
    const approvedComment = createComment({ id: 'c1', status: 'APPROVED' });
    const pendingComment = createComment({
      id: 'c2',
      status: 'PENDING',
      content: 'Pending comment',
    });

    render(<CommentList comments={[approvedComment, pendingComment]} onReply={vi.fn()} />);

    expect(screen.getByText('This is a test comment.')).toBeInTheDocument();
    expect(screen.queryByText('Pending comment')).not.toBeInTheDocument();
  });

  it('calls onReply when reply button is clicked', () => {
    const onReply = vi.fn();
    const comment = createComment({ id: 'comment-1' });

    render(<CommentList comments={[comment]} onReply={onReply} />);

    const replyButton = screen.getByText('回复');
    fireEvent.click(replyButton);

    expect(onReply).toHaveBeenCalledTimes(1);
    expect(onReply).toHaveBeenCalledWith({ ...comment, children: [] });
  });

  it('formats date correctly for recent comments', () => {
    const recentDate = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const comment = createComment({ createdAt: recentDate });

    render(<CommentList comments={[comment]} onReply={vi.fn()} />);

    expect(screen.getByText(/分钟前/)).toBeInTheDocument();
  });

  it('formats date correctly for comments within a week', () => {
    const dateWithinWeek = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const comment = createComment({ createdAt: dateWithinWeek });

    render(<CommentList comments={[comment]} onReply={vi.fn()} />);

    expect(screen.getByText(/天前/)).toBeInTheDocument();
  });

  it('formats date correctly for older comments', () => {
    const oldDate = new Date('2024-01-15T10:30:00Z').toISOString();
    const comment = createComment({ createdAt: oldDate });

    render(<CommentList comments={[comment]} onReply={vi.fn()} />);

    expect(screen.getByText('2024-01-15')).toBeInTheDocument();
  });

  it('does not render child comments when level exceeds 2', () => {
    const level1 = createComment({ id: 'c1', content: 'Level 1' });
    const level2 = createComment({
      id: 'c2',
      content: 'Level 2',
      parentId: 'c1',
      authorName: 'User2',
    });
    const level3 = createComment({
      id: 'c3',
      content: 'Level 3',
      parentId: 'c2',
      authorName: 'User3',
    });
    const level4 = createComment({
      id: 'c4',
      content: 'Level 4',
      parentId: 'c3',
      authorName: 'User4',
    });

    render(<CommentList comments={[level1, level2, level3, level4]} onReply={vi.fn()} />);

    expect(screen.getByText('Level 1')).toBeInTheDocument();
    expect(screen.getByText('Level 2')).toBeInTheDocument();
    expect(screen.getByText('Level 3')).toBeInTheDocument();
    expect(screen.queryByText('Level 4')).not.toBeInTheDocument();
  });
});
