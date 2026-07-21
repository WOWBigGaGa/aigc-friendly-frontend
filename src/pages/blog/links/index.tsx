import { useEffect, useState } from 'react';
import { Card, Spin, Typography } from 'antd';

import { GET_FRIEND_LINKS } from '@/features/blog/infrastructure/queries';

import { executeGraphQL } from '@/shared/graphql';
import { LazyImage } from '@/shared/ui/lazy-image';

const { Title, Paragraph } = Typography;

interface FriendLink {
  id: string;
  name: string;
  url: string;
  description: string | null;
  logo: string | null;
  sort: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
        const queryBody = GET_FRIEND_LINKS.loc?.source?.body ?? '';
        const result = await executeGraphQL<{ friendLinks: FriendLink[] }, {}>(queryBody, {});
        setFriendLinks(result.friendLinks);
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
      <div className="blog-links">
        <Card className="links-header">
          <Title level={2}>友情链接</Title>
          <Paragraph>感谢以下朋友的支持与链接交换</Paragraph>
        </Card>
        <Card className="links-empty">
          <Spin size="large" tip="加载中..." />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-links">
        <Card className="links-header">
          <Title level={2}>友情链接</Title>
          <Paragraph>感谢以下朋友的支持与链接交换</Paragraph>
        </Card>
        <Card className="links-empty">
          <Paragraph>加载友链失败，请稍后重试</Paragraph>
        </Card>
      </div>
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
