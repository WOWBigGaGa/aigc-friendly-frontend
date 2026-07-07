import { useEffect, useState } from 'react';
import { Alert, List, Pagination, Spin } from 'antd';

import { GET_ARTICLES } from '@/features/blog';

import { executeGraphQL } from '@/shared/graphql';

import { type Article, ArticleCard } from './article-card';

interface ArticleListProps {
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

interface ArticlesQueryVariables {
  page?: number;
  pageSize?: number;
}

interface ArticlesQueryResult {
  articles: {
    data: Article[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}

export function ArticleList({ page = 1, pageSize = 10, onPageChange }: ArticleListProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<ArticlesQueryResult | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);

      try {
        const queryBody = GET_ARTICLES.loc?.source?.body ?? '';
        const result = await executeGraphQL<ArticlesQueryResult, ArticlesQueryVariables>(
          queryBody,
          {
            page,
            pageSize,
          },
        );
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [page, pageSize]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert message="加载失败" description="文章列表加载失败，请稍后重试" type="error" showIcon />
    );
  }

  const articles = data?.articles?.data || [];
  const pagination = data?.articles?.pagination;

  if (articles.length === 0) {
    return <Alert message="暂无文章" description="还没有发布任何文章" type="info" showIcon />;
  }

  const pinnedArticles = articles.filter((article: Article) => article.isPinned);
  const normalArticles = articles.filter((article: Article) => !article.isPinned);

  const handlePageChange = (newPage: number) => {
    onPageChange?.(newPage);
  };

  return (
    <div className="article-list">
      {pinnedArticles.length > 0 && (
        <div className="pinned-articles" style={{ marginBottom: '24px' }}>
          <h2
            style={{
              margin: '0 0 16px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--ant-color-primary)',
            }}
          >
            置顶文章
          </h2>
          <List
            dataSource={pinnedArticles}
            renderItem={(articleItem) => (
              <List.Item>
                <ArticleCard article={articleItem as Article} />
              </List.Item>
            )}
            style={{ gap: '16px' }}
          />
        </div>
      )}

      <div className="normal-articles">
        <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>最新文章</h2>
        <List
          dataSource={normalArticles}
          renderItem={(articleItem) => (
            <List.Item>
              <ArticleCard article={articleItem as Article} />
            </List.Item>
          )}
          style={{ gap: '16px' }}
        />
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Pagination
            current={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={handlePageChange}
            showSizeChanger={false}
            showTotal={(total) => `共 ${total} 篇文章`}
          />
        </div>
      )}
    </div>
  );
}
