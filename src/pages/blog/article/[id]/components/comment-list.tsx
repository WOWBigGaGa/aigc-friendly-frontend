import { MessageOutlined } from '@ant-design/icons';
import { Avatar, Tooltip, Typography } from 'antd';

const { Text, Paragraph } = Typography;

interface CommentItem {
  id: string;
  articleId: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  content: string;
  parentId: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  children?: CommentItem[];
}

interface CommentListProps {
  comments: CommentItem[];
  onReply: (comment: CommentItem) => void;
}

function buildCommentTree(comments: CommentItem[]): CommentItem[] {
  const commentMap = new Map<string, CommentItem>();
  const rootComments: CommentItem[] = [];

  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, children: [] });
  });

  comments.forEach((comment) => {
    if (comment.parentId && commentMap.has(comment.parentId)) {
      const parent = commentMap.get(comment.parentId)!;
      if (!parent.children) parent.children = [];
      parent.children.push(commentMap.get(comment.id)!);
    } else {
      rootComments.push(commentMap.get(comment.id)!);
    }
  });

  return rootComments;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes <= 0 ? '刚刚' : `${minutes}分钟前`;
    }
    return `${hours}小时前`;
  } else if (days < 7) {
    return `${days}天前`;
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function CommentItemComponent({
  comment,
  onReply,
  level = 0,
}: {
  comment: CommentItem;
  onReply: (comment: CommentItem) => void;
  level?: number;
}) {
  const isApproved = comment.status === 'APPROVED';

  if (!isApproved) {
    return null;
  }

  return (
    <div
      style={{
        marginLeft: level > 0 ? `${level * 24}px` : '0',
        marginTop: level > 0 ? '12px' : '0',
        padding: '16px',
        background: 'var(--ant-color-bg-hover)',
        borderRadius: '8px',
      }}
    >
      <div style={{ display: 'flex', gap: '12px' }}>
        <Avatar src={comment.authorAvatar} alt={comment.authorName} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Text strong>{comment.authorName}</Text>
            <Text style={{ fontSize: '12px', color: 'var(--ant-color-text-secondary)' }}>
              {formatDate(comment.createdAt)}
            </Text>
          </div>
          <Paragraph style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' }}>
            {comment.content}
          </Paragraph>
          <Tooltip title="回复">
            <span
              onClick={() => onReply(comment)}
              style={{
                cursor: 'pointer',
                fontSize: '12px',
                color: 'var(--ant-color-text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <MessageOutlined />
              回复
            </span>
          </Tooltip>
        </div>
      </div>

      {comment.children && comment.children.length > 0 && level < 2 && (
        <div style={{ marginTop: '12px' }}>
          {comment.children.map((child) => (
            <CommentItemComponent
              key={child.id}
              comment={child}
              onReply={onReply}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentList({ comments, onReply }: CommentListProps) {
  const tree = buildCommentTree(comments);

  if (tree.length === 0) {
    return (
      <div
        style={{ textAlign: 'center', padding: '40px', color: 'var(--ant-color-text-secondary)' }}
      >
        暂无评论，快来发表第一条评论吧！
      </div>
    );
  }

  return (
    <div>
      {tree.map((comment) => (
        <CommentItemComponent key={comment.id} comment={comment} onReply={onReply} />
      ))}
    </div>
  );
}
