import { useEffect, useRef, useState } from 'react';
import { ClockCircleOutlined, EyeOutlined, HeartOutlined } from '@ant-design/icons';
import { Divider, Spin, Tag, Typography } from 'antd';
import ReactMarkdown from 'react-markdown';

import {
  GET_ADJACENT_ARTICLES,
  GET_ARTICLE_BY_ID,
  GET_COMMENTS,
  INCREMENT_LIKE_COUNT,
  INCREMENT_VIEW_COUNT,
} from '@/features/blog';

import { executeGraphQL } from '@/shared/graphql';

import { CommentForm } from './comment-form';
import { CommentList } from './comment-list';

const { Title, Paragraph } = Typography;

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  viewCount: number;
  likeCount: number;
  publishedAt: string;
  category?: Category;
  tags: Tag[];
}

interface AdjacentArticle {
  id: string;
  title: string;
  slug: string;
}

interface AdjacentArticles {
  prev?: AdjacentArticle;
  next?: AdjacentArticle;
}

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface Comment {
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
}

interface ParentComment {
  id: string;
  authorName: string;
}

export function ArticleDetail({ articleId }: { articleId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [adjacentArticles, setAdjacentArticles] = useState<AdjacentArticles | null>(null);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeHeading, setActiveHeading] = useState<string>('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<Error | null>(null);
  const [parentComment, setParentComment] = useState<ParentComment | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const extractHeadings = (content: string) => {
    const headingRegex = /^(#{2,4})\s+(.+)$/gm;
    const extractedHeadings: Heading[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      extractedHeadings.push({ id, text, level });
    }

    setHeadings(extractedHeadings);
  };

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryBody = GET_ARTICLE_BY_ID.loc?.source?.body ?? '';
        const adjacentBody = GET_ADJACENT_ARTICLES.loc?.source?.body ?? '';

        const [articleResult, adjacentResult] = await Promise.all([
          executeGraphQL<{ article: Article }, { id: string }>(queryBody, { id: articleId }),
          executeGraphQL<{ adjacentArticles: AdjacentArticles }, { id: string }>(adjacentBody, {
            id: articleId,
          }),
        ]);

        setArticle(articleResult.article);
        setAdjacentArticles(adjacentResult.adjacentArticles);
        extractHeadings(articleResult.article.content);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    const incrementViewCount = async () => {
      try {
        const mutationBody = INCREMENT_VIEW_COUNT.loc?.source?.body ?? '';
        await executeGraphQL<{ incrementViewCount: Article }, { id: string }>(mutationBody, {
          id: articleId,
        });
      } catch {
        console.warn('Failed to increment view count');
      }
    };

    fetchArticle();
    incrementViewCount();
  }, [articleId]);

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    setCommentsLoading(true);
    setCommentsError(null);
    try {
      const queryBody = GET_COMMENTS.loc?.source?.body ?? '';
      const result = await executeGraphQL<
        { comments: { items: Comment[] } },
        { articleId: string; page: number; pageSize: number }
      >(queryBody, { articleId, page: 1, pageSize: 50 });
      setComments(result.comments.items);
    } catch (err) {
      setCommentsError(err as Error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleReply = (comment: Comment) => {
    setParentComment({ id: comment.id, authorName: comment.authorName });
  };

  const handleCommentSubmit = () => {
    setParentComment(null);
    fetchComments();
  };

  useEffect(() => {
    if (!contentRef.current || headings.length === 0) return;

    const headingElements = headings
      .map((heading) => {
        const element = document.getElementById(heading.id);
        return element ? { element, id: heading.id } : null;
      })
      .filter(Boolean);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            if (id) {
              setActiveHeading(id);
            }
          }
        });
      },
      {
        rootMargin: '-100px 0px -50% 0px',
      },
    );

    headingElements.forEach((item) => {
      if (item?.element) {
        observerRef.current!.observe(item.element);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [headings]);

  const handleHeadingClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    if (href) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLike = async () => {
    try {
      const mutationBody = INCREMENT_LIKE_COUNT.loc?.source?.body ?? '';
      const result = await executeGraphQL<{ incrementLikeCount: Article }, { id: string }>(
        mutationBody,
        { id: articleId },
      );
      setArticle({
        ...article!,
        likeCount: result.incrementLikeCount.likeCount,
      });
    } catch (err) {
      console.warn('Failed to increment like count');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  if (loading) {
    return (
      <div
        data-testid="article-loading"
        className="article-loading"
        style={{ textAlign: 'center', padding: '40px' }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div
        data-testid="article-error"
        className="article-error"
        style={{ textAlign: 'center', padding: '40px' }}
      >
        <Title level={2}>文章加载失败</Title>
        <Paragraph>文章不存在或加载出错，请稍后重试。</Paragraph>
      </div>
    );
  }

  const tocVisible = headings.length > 0;

  return (
    <div className="article-detail" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <article>
        <header className="article-header" style={{ marginBottom: '32px' }}>
          <Title level={1} style={{ marginBottom: '16px' }}>
            {article.title}
          </Title>

          <div
            className="article-meta"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            {article.category && (
              <Tag color="blue" key={article.category.id}>
                {article.category.name}
              </Tag>
            )}

            {article.tags.map((tag) => (
              <Tag key={tag.id}>{tag.name}</Tag>
            ))}

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

            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px',
                color: 'var(--ant-color-text-secondary)',
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
                fontSize: '14px',
                color: 'var(--ant-color-text-secondary)',
                cursor: 'pointer',
              }}
              onClick={handleLike}
            >
              <HeartOutlined />
              {article.likeCount}
            </span>
          </div>
        </header>

        <Divider />

        <div style={{ display: 'flex', gap: '24px' }}>
          {tocVisible && (
            <aside
              className="article-toc"
              style={{
                width: '200px',
                flexShrink: 0,
                position: 'sticky',
                top: '20px',
                maxHeight: 'calc(100vh - 100px)',
                overflowY: 'auto',
              }}
            >
              <Title level={4} style={{ marginBottom: '16px' }}>
                文章目录
              </Title>
              <div data-testid="anchor">
                {headings.map((heading) => (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    onClick={handleHeadingClick}
                    className={`ant-anchor-link ${activeHeading === heading.id ? 'active' : ''}`}
                    data-testid="anchor-link"
                    style={{
                      display: 'block',
                      fontSize: heading.level === 2 ? '14px' : '13px',
                      padding: '4px 0',
                      paddingLeft:
                        heading.level === 3 ? '12px' : heading.level === 4 ? '24px' : '0',
                      fontWeight: activeHeading === heading.id ? '600' : '400',
                      color:
                        activeHeading === heading.id
                          ? 'var(--ant-color-primary)'
                          : 'var(--ant-color-text-secondary)',
                      textDecoration: 'none',
                    }}
                  >
                    {heading.text}
                  </a>
                ))}
              </div>
            </aside>
          )}

          <main ref={contentRef} className="article-content" style={{ flex: 1 }}>
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <Title
                    id={
                      children
                        ? String(children)
                            .toLowerCase()
                            .replace(/\s+/g, '-')
                            .replace(/[^a-z0-9-]/g, '')
                        : ''
                    }
                    level={2}
                    style={{ marginBottom: '16px', marginTop: '32px' }}
                  >
                    {children}
                  </Title>
                ),
                h3: ({ children }) => (
                  <Title
                    id={
                      children
                        ? String(children)
                            .toLowerCase()
                            .replace(/\s+/g, '-')
                            .replace(/[^a-z0-9-]/g, '')
                        : ''
                    }
                    level={3}
                    style={{ marginBottom: '12px', marginTop: '24px' }}
                  >
                    {children}
                  </Title>
                ),
                h4: ({ children }) => (
                  <Title
                    id={
                      children
                        ? String(children)
                            .toLowerCase()
                            .replace(/\s+/g, '-')
                            .replace(/[^a-z0-9-]/g, '')
                        : ''
                    }
                    level={4}
                    style={{ marginBottom: '8px', marginTop: '16px' }}
                  >
                    {children}
                  </Title>
                ),
                p: ({ children }) => (
                  <Paragraph style={{ lineHeight: '1.8', marginBottom: '16px', fontSize: '15px' }}>
                    {children}
                  </Paragraph>
                ),
                ul: ({ children }) => (
                  <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol style={{ marginBottom: '16px', paddingLeft: '24px' }}>{children}</ol>
                ),
                li: ({ children }) => (
                  <li style={{ marginBottom: '8px', lineHeight: '1.8' }}>{children}</li>
                ),
                code: ({ className, children }) => {
                  const isBlock = className?.includes('language-');
                  if (isBlock) {
                    return (
                      <pre
                        style={{
                          background: 'var(--ant-color-bg-base)',
                          padding: '16px',
                          borderRadius: '8px',
                          overflowX: 'auto',
                          marginBottom: '16px',
                          fontSize: '14px',
                        }}
                      >
                        <code>{children}</code>
                      </pre>
                    );
                  }
                  return (
                    <code
                      style={{
                        background: 'var(--ant-color-bg-hover)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.9em',
                      }}
                    >
                      {children}
                    </code>
                  );
                },
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--ant-color-primary)', textDecoration: 'underline' }}
                  >
                    {children}
                  </a>
                ),
                blockquote: ({ children }) => (
                  <blockquote
                    style={{
                      borderLeft: '4px solid var(--ant-color-primary)',
                      paddingLeft: '16px',
                      margin: '16px 0',
                      color: 'var(--ant-color-text-secondary)',
                      fontStyle: 'italic',
                    }}
                  >
                    {children}
                  </blockquote>
                ),
                hr: () => <Divider style={{ margin: '24px 0' }} />,
                table: ({ children }) => (
                  <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        border: '1px solid var(--ant-color-border)',
                      }}
                    >
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th
                    style={{
                      border: '1px solid var(--ant-color-border)',
                      padding: '8px 12px',
                      background: 'var(--ant-color-bg-hover)',
                      textAlign: 'left',
                      fontWeight: '600',
                    }}
                  >
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td
                    style={{
                      border: '1px solid var(--ant-color-border)',
                      padding: '8px 12px',
                    }}
                  >
                    {children}
                  </td>
                ),
              }}
            >
              {article.content}
            </ReactMarkdown>
          </main>
        </div>

        <Divider />

        <nav
          className="article-navigation"
          style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}
        >
          {adjacentArticles?.prev && (
            <a
              href={`/blog/article/${adjacentArticles.prev.id}`}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: 'var(--ant-color-bg-hover)',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'var(--ant-color-text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '12px', color: 'var(--ant-color-text-secondary)' }}>
                上一篇
              </span>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {adjacentArticles.prev.title}
              </span>
            </a>
          )}

          {adjacentArticles?.next && (
            <a
              href={`/blog/article/${adjacentArticles.next.id}`}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: 'var(--ant-color-bg-hover)',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'var(--ant-color-text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'flex-end',
              }}
            >
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {adjacentArticles.next.title}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--ant-color-text-secondary)' }}>
                下一篇
              </span>
            </a>
          )}

          {!adjacentArticles?.prev && !adjacentArticles?.next && (
            <div style={{ flex: 1, textAlign: 'center', color: 'var(--ant-color-text-secondary)' }}>
              没有更多文章
            </div>
          )}
        </nav>

        <Divider />

        <section style={{ marginTop: '32px' }}>
          <Title level={2} style={{ marginBottom: '24px' }}>
            评论 ({comments.length})
          </Title>

          {commentsLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin />
            </div>
          ) : commentsError ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--ant-color-error)' }}>
              评论加载失败，请稍后重试
            </div>
          ) : (
            <>
              <CommentList comments={comments} onReply={handleReply} />

              <Divider />

              <Title level={3} style={{ marginBottom: '24px' }}>
                发表评论
              </Title>
              <CommentForm
                articleId={articleId}
                parentComment={parentComment}
                onSubmit={handleCommentSubmit}
              />
            </>
          )}
        </section>
      </article>
    </div>
  );
}
