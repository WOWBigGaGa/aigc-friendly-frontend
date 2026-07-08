import { useEffect, useState } from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Alert, List, Pagination, Spin, Typography } from 'antd';
import { useParams, useSearchParams } from 'react-router';

import { GET_ARCHIVES } from '@/features/blog';

import { executeGraphQL } from '@/shared/graphql';

const { Title, Paragraph } = Typography;

interface Archive {
  year: number;
  month: number;
  count: number;
}

interface ArchivesResult {
  archives: Archive[];
}

interface ArchiveArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
}

interface ArchiveArticlesResult {
  articles: {
    data: ArchiveArticle[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}

interface ArchiveVariables {
  page?: number;
  pageSize?: number;
  year?: number;
  month?: number;
}

export function BlogArchivePage() {
  const { year, month } = useParams<{ year: string; month: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<ArchiveArticlesResult | null>(null);
  const [archives, setArchives] = useState<Archive[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    setCurrentPage(page);
    fetchArchiveData(parseInt(year!), parseInt(month!), page);
  }, [year, month, searchParams.get('page')]);

  const fetchArchiveData = async (archiveYear: number, archiveMonth: number, page: number) => {
    setLoading(true);
    setError(null);

    try {
      const [articlesResult, archivesResult] = await Promise.all([
        executeGraphQL<ArchiveArticlesResult, ArchiveVariables>(
          `
            query GetArticlesByDate($page: Int, $pageSize: Int, $year: Int, $month: Int) {
              articles(page: $page, pageSize: $pageSize, filter: {year: $year, month: $month}) {
                data {
                  id
                  title
                  slug
                  excerpt
                  publishedAt
                }
                pagination {
                  page
                  pageSize
                  total
                  totalPages
                }
              }
            }
          `,
          { page, pageSize: 10, year: archiveYear, month: archiveMonth },
        ),
        executeGraphQL<ArchivesResult, {}>(GET_ARCHIVES.loc?.source?.body ?? '', {}),
      ]);

      setData(articlesResult);
      setArchives(archivesResult.archives);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSearchParams({ page: String(page) });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const archiveYear = parseInt(year || '0');
  const archiveMonth = parseInt(month || '0');

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert message="加载失败" description="归档数据加载失败，请稍后重试" type="error" showIcon />
    );
  }

  const articles = data?.articles?.data || [];
  const currentArchive = archives.find((a) => a.year === archiveYear && a.month === archiveMonth);

  return (
    <div className="blog-archive">
      <div
        style={{
          marginBottom: '32px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--ant-color-border)',
        }}
      >
        <Title level={1}>
          {archiveYear}年{archiveMonth}月
        </Title>
        <Paragraph style={{ fontSize: '16px', color: 'var(--ant-color-text-secondary)' }}>
          共 {currentArchive?.count || 0} 篇文章
        </Paragraph>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>归档目录</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {archives.map((archive) => {
            const isActive = archive.year === archiveYear && archive.month === archiveMonth;
            return (
              <button
                key={`${archive.year}-${archive.month}`}
                onClick={() => {
                  window.location.href = `/blog/archive/${archive.year}/${String(archive.month).padStart(2, '0')}`;
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: '1px solid var(--ant-color-border)',
                  background: isActive ? 'var(--ant-color-primary)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--ant-color-text-primary)',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                {archive.year}/{String(archive.month).padStart(2, '0')} ({archive.count})
              </button>
            );
          })}
        </div>
      </div>

      {articles.length === 0 ? (
        <Alert message="暂无文章" description="该月份还没有发布任何文章" type="info" showIcon />
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
                    {article.excerpt}
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

          {data?.articles?.pagination && data.articles.pagination.totalPages > 1 && (
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Pagination
                current={currentPage}
                pageSize={10}
                total={data.articles.pagination.total}
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
