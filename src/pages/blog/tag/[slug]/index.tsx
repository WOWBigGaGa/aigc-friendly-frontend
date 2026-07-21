import { useCallback, useEffect, useState } from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Alert, List, Pagination, Spin, Tag, Typography } from 'antd';
import { useParams, useSearchParams } from 'react-router';

import { GET_ARTICLES_BY_TAG, GET_TAGS } from '@/features/blog';

import { executeGraphQL } from '@/shared/graphql';

const { Title } = Typography;

interface TagType {
  id: string;
  name: string;
  slug: string;
}

interface TagArticle {
  id: string;
  title: string;
  summary: string;
  coverImage?: string | null;
  viewCount: number;
  likeCount: number;
  publishedAt: string;
}

interface TagResult {
  articles: {
    items: TagArticle[];
    total: number;
    page: number;
    pageSize: number;
    pageInfo: { hasNext: boolean };
  };
}

interface TagVariables {
  pagination: { page: number; pageSize: number };
  tagIds: string[];
}

interface TagsResult {
  tags: TagType[];
}

export function BlogTagPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TagResult | null>(null);
  const [tag, setTag] = useState<TagType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTagData = useCallback(async (tagSlug: string, page: number) => {
    setLoading(true);
    setError(null);

    try {
      const tagsResult = await executeGraphQL<TagsResult, Record<string, never>>(
        GET_TAGS.loc?.source?.body ?? '',
        {},
      );
      const foundTag = tagsResult.tags.find((t) => t.slug === tagSlug);

      if (!foundTag) {
        setTag(null);
        setData(null);
        return;
      }

      setTag(foundTag);

      const articlesResult = await executeGraphQL<TagResult, TagVariables>(
        GET_ARTICLES_BY_TAG.loc?.source?.body ?? '',
        {
          pagination: { page, pageSize: 10 },
          tagIds: [foundTag.id],
        },
      );

      setData(articlesResult);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    setCurrentPage(page);
    fetchTagData(slug!, page);
  }, [slug, searchParams.get('page'), fetchTagData]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSearchParams({ page: String(page) });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert title="加载失败" description="标签数据加载失败，请稍后重试" type="error" showIcon />
    );
  }

  if (!tag) {
    return (
      <Alert title="标签不存在" description="该标签不存在或已被删除" type="warning" showIcon />
    );
  }

  const articles = data?.articles?.items || [];

  return (
    <div className="blog-tag">
      <div
        style={{
          marginBottom: '32px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--ant-color-border)',
        }}
      >
        <Title level={1}>
          <Tag color="purple" style={{ fontSize: '18px', padding: '4px 12px' }}>
            {tag.name}
          </Tag>
        </Title>
        <div style={{ marginTop: '16px' }}>
          <Tag color="purple">{articles.length > 0 ? data?.articles?.total : 0} 篇文章</Tag>
        </div>
      </div>

      {articles.length === 0 ? (
        <Alert title="暂无文章" description="该标签下还没有发布任何文章" type="info" showIcon />
      ) : (
        <div>
          <List
            dataSource={articles}
            renderItem={(article) => (
              <List.Item
                key={article.id}
                style={{
                  padding: '20px',
                  borderBottom: '1px solid var(--ant-color-border)',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  window.location.href = `/blog/article/${article.id}`;
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: '0 0 8px 0',
                      fontSize: '18px',
                      fontWeight: '600',
                      color: 'var(--ant-color-text-primary)',
                    }}
                  >
                    {article.title}
                  </h3>
                  <p
                    style={{
                      margin: '0 0 12px 0',
                      color: 'var(--ant-color-text-secondary)',
                      lineHeight: '1.6',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {article.summary}
                  </p>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '14px',
                        color: 'var(--ant-color-text-secondary)',
                      }}
                    >
                      <ClockCircleOutlined />
                      {formatDate(article.publishedAt)}
                    </span>
                  </div>
                </div>
              </List.Item>
            )}
          />

          {data?.articles?.pageInfo && data.articles.pageInfo.hasNext && (
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Pagination
                current={currentPage}
                pageSize={10}
                total={data.articles.total}
                onChange={handlePageChange}
                showSizeChanger={false}
                showTotal={(total) => `共 ${total} 篇文章`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
