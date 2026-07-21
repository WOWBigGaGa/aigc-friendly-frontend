import { useEffect, useState } from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Alert, List, Pagination, Spin, Tag, Typography } from 'antd';
import { useParams, useSearchParams } from 'react-router';

import { GET_ARTICLES_BY_CATEGORY, GET_CATEGORIES } from '@/features/blog';

import { executeGraphQL } from '@/shared/graphql';

const { Title, Paragraph } = Typography;

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

interface CategoryArticle {
  id: string;
  title: string;
  summary: string;
  coverImage?: string | null;
  viewCount: number;
  likeCount: number;
  publishedAt: string;
}

interface CategoryResult {
  articles: {
    items: CategoryArticle[];
    total: number;
    page: number;
    pageSize: number;
    pageInfo: { hasNext: boolean };
  };
}

interface CategoryVariables {
  pagination: { page: number; pageSize: number };
  categoryId: string;
}

interface CategoriesResult {
  categories: Category[];
}

export function BlogCategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<CategoryResult | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCategoryData = async (categorySlug: string, page: number) => {
    setLoading(true);
    setError(null);

    try {
      const categoriesResult = await executeGraphQL<CategoriesResult, Record<string, never>>(
        GET_CATEGORIES.loc?.source?.body ?? '',
        {},
      );
      const foundCategory = categoriesResult.categories.find((c) => c.slug === categorySlug);

      if (!foundCategory) {
        setCategory(null);
        setData(null);
        return;
      }

      setCategory(foundCategory);

      const articlesResult = await executeGraphQL<CategoryResult, CategoryVariables>(
        GET_ARTICLES_BY_CATEGORY.loc?.source?.body ?? '',
        {
          pagination: { page, pageSize: 10 },
          categoryId: foundCategory.id,
        },
      );

      setData(articlesResult);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    setCurrentPage(page);
    fetchCategoryData(slug!, page);
  }, [slug, searchParams.get('page')]);

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
      <Alert title="加载失败" description="分类数据加载失败，请稍后重试" type="error" showIcon />
    );
  }

  if (!category) {
    return (
      <Alert title="分类不存在" description="该分类不存在或已被删除" type="warning" showIcon />
    );
  }

  const articles = data?.articles?.items || [];

  return (
    <div className="blog-category">
      <div
        style={{
          marginBottom: '32px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--ant-color-border)',
        }}
      >
        <Title level={1}>{category.name}</Title>
        {category.description && (
          <Paragraph style={{ fontSize: '16px', color: 'var(--ant-color-text-secondary)' }}>
            {category.description}
          </Paragraph>
        )}
        <div style={{ marginTop: '16px' }}>
          <Tag color="blue">{articles.length > 0 ? data?.articles?.total : 0} 篇文章</Tag>
        </div>
      </div>

      {articles.length === 0 ? (
        <Alert title="暂无文章" description="该分类下还没有发布任何文章" type="info" showIcon />
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
