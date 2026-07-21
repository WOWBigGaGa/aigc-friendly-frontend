import { ClockCircleOutlined, EyeOutlined, HeartOutlined } from '@ant-design/icons';
import { Avatar, Card, Tag } from 'antd';
import { useNavigate } from 'react-router';

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  viewCount: number;
  likeCount: number;
  publishedAt: string;
  isPinned?: boolean;
}

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/blog/article/${article.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="article-card">
      <Card hoverable onClick={handleClick} variant="borderless" bodyStyle={{ padding: '20px' }}>
        {article.isPinned && (
          <Tag color="red" style={{ marginBottom: '8px' }}>
            置顶
          </Tag>
        )}

        <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600' }}>
          {article.title}
        </h3>

        <p
          style={{
            margin: '0 0 16px 0',
            color: 'var(--ant-color-text-secondary)',
            fontSize: '14px',
            lineHeight: '1.6',
          }}
        >
          {article.summary || article.content.substring(0, 150)}...
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid var(--ant-color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar size={24} icon={<ClockCircleOutlined />} />
            <span style={{ fontSize: '12px', color: 'var(--ant-color-text-tertiary)' }}>
              {formatDate(article.publishedAt)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                color: 'var(--ant-color-text-tertiary)',
              }}
            >
              <EyeOutlined />
              {article.viewCount}
            </span>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                color: 'var(--ant-color-text-tertiary)',
              }}
            >
              <HeartOutlined />
              {article.likeCount}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
