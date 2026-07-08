import { useEffect, useState } from 'react';
import { ClockCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { Alert, Input, List, Pagination, Spin, Tag, Typography } from 'antd';
import { useSearchParams } from 'react-router';

import { SEARCH_ARTICLES } from '@/features/blog';

import { executeGraphQL } from '@/shared/graphql';

const { Title, Paragraph } = Typography;

interface SearchArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface SearchResult {
  searchArticles: {
    data: SearchArticle[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}

interface SearchVariables {
  keyword: string;
  page?: number;
  pageSize?: number;
}

function highlightKeyword(text: string, keyword: string): React.ReactNode {
  if (!keyword) return text;
  const regex = new RegExp(`(${keyword})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark key={index} style={{ backgroundColor: '#ffeb3b', padding: '0 4px' }}>
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export function BlogSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<SearchResult | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setKeyword(q);
      setCurrentPage(1);
      fetchSearchResults(q, 1);
    } else {
      setData(null);
      setError(null);
    }
  }, [searchParams.get('q')]);

  const fetchSearchResults = async (searchKeyword: string, page: number) => {
    if (!searchKeyword.trim()) {
      setData(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const queryBody = SEARCH_ARTICLES.loc?.source?.body ?? '';
      const result = await executeGraphQL<SearchResult, SearchVariables>(queryBody, {
        keyword: searchKeyword,
        page,
        pageSize: 10,
      });
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (keyword.trim()) {
      setSearchParams({ q: keyword.trim(), page: '1' });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSearchParams({ q: keyword, page: String(page) });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="blog-search">
      <div style={{ marginBottom: '32px' }}>
        <Title level={1} style={{ marginBottom: '24px' }}>
          搜索
        </Title>
        <Input
          size="large"
          placeholder="输入关键词搜索文章..."
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={handleSearch}
          style={{ maxWidth: '500px' }}
          allowClear
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert
          message="搜索失败"
          description="搜索过程中发生错误，请稍后重试"
          type="error"
          showIcon
        />
      ) : !keyword.trim() ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Title level={3} style={{ color: 'var(--ant-color-text-secondary)' }}>
            请输入关键词进行搜索
          </Title>
          <Paragraph style={{ color: 'var(--ant-color-text-secondary)' }}>
            支持搜索文章标题和内容
          </Paragraph>
        </div>
      ) : data?.searchArticles?.data.length === 0 ? (
        <Alert
          message="未找到相关文章"
          description={`没有找到包含 "${keyword}" 的文章`}
          type="info"
          showIcon
        />
      ) : (
        <div>
          <Paragraph style={{ marginBottom: '16px' }}>
            找到 <strong>{data?.searchArticles?.pagination.total}</strong> 篇相关文章
          </Paragraph>

          <List
            dataSource={data?.searchArticles?.data}
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
                    {highlightKeyword(article.title, keyword)}
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
                    {highlightKeyword(article.excerpt, keyword)}
                  </p>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}
                  >
                    {article.category && <Tag color="blue">{article.category.name}</Tag>}
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

          {data?.searchArticles?.pagination && data.searchArticles.pagination.totalPages > 1 && (
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Pagination
                current={currentPage}
                pageSize={10}
                total={data.searchArticles.pagination.total}
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
