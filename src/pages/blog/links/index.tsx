import { useEffect, useState } from 'react';
import { Alert, Card, Spin, Typography } from 'antd';

import { GET_ACTIVE_FRIEND_LINKS } from '@/features/blog';

import { executeGraphQL } from '@/shared/graphql';
import { LazyImage } from '@/shared/ui/lazy-image';

const { Title, Paragraph } = Typography;

interface FriendLink {
  id: string;
  name: string;
  url: string;
  description: string | null;
  logo: string | null;
}

interface FriendLinksQueryResult {
  activeFriendLinks: FriendLink[];
}

export function BlogLinksPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [friendLinks, setFriendLinks] = useState<FriendLink[]>([]);

  useEffect(() => {
    const fetchFriendLinks = async () => {
      setLoading(true);
      setError(null);

      try {
        const queryBody = GET_ACTIVE_FRIEND_LINKS.loc?.source?.body ?? '';
        const result = await executeGraphQL<FriendLinksQueryResult, Record<string, never>>(
          queryBody,
          {},
        );
        setFriendLinks(result.activeFriendLinks);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriendLinks();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert message="加载失败" description="友链列表加载失败，请稍后重试" type="error" showIcon />
    );
  }

  return (
    <div className="blog-links">
      <Card className="links-header">
        <Title level={2}>友情链接</Title>
        <Paragraph>感谢以下朋友的支持与链接交换</Paragraph>
      </Card>

      {friendLinks.length === 0 ? (
        <Card className="links-empty">
          <Paragraph>暂无友链，期待您的加入！</Paragraph>
        </Card>
      ) : (
        <div className="links-grid">
          {friendLinks.map((link) => (
            <Card
              key={link.id}
              className="link-card"
              hoverable
              onClick={() => {
                const anchor = document.createElement('a');
                anchor.href = link.url;
                anchor.target = '_blank';
                anchor.rel = 'noopener noreferrer';
                anchor.click();
              }}
            >
              <div className="link-content">
                {link.logo && (
                  <div className="link-logo">
                    <LazyImage
                      src={link.logo}
                      alt={link.name}
                      style={{ width: '64px', height: '64px' }}
                      placeholderStyle={{ width: '64px', height: '64px' }}
                    />
                  </div>
                )}
                <div className="link-info">
                  <Title level={4} className="link-name">
                    {link.name}
                  </Title>
                  {link.description && (
                    <Paragraph className="link-description">{link.description}</Paragraph>
                  )}
                  <Paragraph className="link-url">{link.url}</Paragraph>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
