import { useEffect, useState } from 'react';
import {
  AlertOutlined,
  CalendarOutlined,
  EyeOutlined,
  FileTextOutlined,
  HeartOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { Card, Col, List, Row, Statistic, Table, Tag, Typography } from 'antd';

import {
  ADMIN_DASHBOARD_STATS,
  ADMIN_PENDING_COMMENTS,
  ADMIN_RECENT_ARTICLES,
} from '@/features/admin';

import { executeGraphQL } from '@/shared/graphql/request';

const { Title } = Typography;

interface DashboardStats {
  articleCount: number;
  commentCount: number;
  categoryCount: number;
  tagCount: number;
  totalViewCount: number;
  totalLikeCount: number;
  pendingCommentCount: number;
}

interface ArticleItem {
  id: string;
  title: string;
  status: string;
  viewCount: number;
  likeCount: number;
  publishedAt: string;
  category: {
    id: string;
    name: string;
  } | null;
}

interface CommentItem {
  id: string;
  articleId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  status: string;
  createdAt: string;
}

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentArticles, setRecentArticles] = useState<ArticleItem[]>([]);
  const [pendingComments, setPendingComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsResult, articlesResult, commentsResult] = await Promise.all([
        executeGraphQL<{ dashboardStats: DashboardStats }, {}>(ADMIN_DASHBOARD_STATS, {}),
        executeGraphQL<{ articles: PaginatedResult<ArticleItem> }, { page: number; limit: number }>(
          ADMIN_RECENT_ARTICLES,
          { page: 1, limit: 5 },
        ),
        executeGraphQL<
          { pendingComments: PaginatedResult<CommentItem> },
          { page: number; limit: number }
        >(ADMIN_PENDING_COMMENTS, { page: 1, limit: 5 }),
      ]);

      setStats(statsResult.dashboardStats);
      setRecentArticles(articlesResult.articles.items);
      setPendingComments(commentsResult.pendingComments.items);
    } catch {
      setStats({
        articleCount: 0,
        commentCount: 0,
        categoryCount: 0,
        tagCount: 0,
        totalViewCount: 0,
        totalLikeCount: 0,
        pendingCommentCount: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: '文章总数',
      value: stats?.articleCount || 0,
      prefix: <FileTextOutlined />,
      color: '#1890ff',
    },
    {
      title: '评论总数',
      value: stats?.commentCount || 0,
      prefix: <MessageOutlined />,
      color: '#52c41a',
    },
    {
      title: '总阅读量',
      value: stats?.totalViewCount || 0,
      prefix: <EyeOutlined />,
      color: '#722ed1',
    },
    {
      title: '总点赞量',
      value: stats?.totalLikeCount || 0,
      prefix: <HeartOutlined />,
      color: '#eb2f96',
    },
    {
      title: '分类总数',
      value: stats?.categoryCount || 0,
      prefix: <CalendarOutlined />,
      color: '#fa8c16',
    },
    {
      title: '标签总数',
      value: stats?.tagCount || 0,
      prefix: <Tag />,
      color: '#13c2c2',
    },
  ];

  const articleColumns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      width: 250,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: { name: string } | null) =>
        category ? <Tag color="blue">{category.name}</Tag> : '-',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'PUBLISHED' ? 'green' : 'orange'}>
          {status === 'PUBLISHED' ? '已发布' : '草稿'}
        </Tag>
      ),
      width: 80,
    },
    {
      title: '阅读量',
      dataIndex: 'viewCount',
      key: 'viewCount',
      align: 'right' as const,
      width: 80,
    },
    {
      title: '点赞量',
      dataIndex: 'likeCount',
      key: 'likeCount',
      align: 'right' as const,
      width: 80,
    },
    {
      title: '发布时间',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      render: (date: string) => (date ? new Date(date).toLocaleDateString('zh-CN') : '-'),
      width: 120,
    },
  ];

  const commentColumns = [
    {
      title: '作者',
      dataIndex: 'authorName',
      key: 'authorName',
      width: 100,
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
      width: 150,
    },
  ];

  return (
    <div>
      <Title level={2}>仪表盘</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {statsCards.map((card) => (
          <Col span={4} key={card.title}>
            <Card>
              <Statistic
                title={card.title}
                value={card.value}
                prefix={card.prefix}
                valueStyle={{ color: card.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="最近文章" extra={<span>{recentArticles.length} 篇</span>}>
            {loading ? (
              <List loading />
            ) : (
              <Table
                dataSource={recentArticles}
                columns={articleColumns}
                rowKey="id"
                pagination={false}
                size="small"
              />
            )}
          </Card>
        </Col>

        <Col span={12}>
          <Card
            title="待审核评论"
            extra={<Tag color="orange">{stats?.pendingCommentCount || 0} 条</Tag>}
          >
            {loading ? (
              <List loading />
            ) : pendingComments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <AlertOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                <p style={{ marginTop: '16px', color: '#999' }}>暂无待审核评论</p>
              </div>
            ) : (
              <Table
                dataSource={pendingComments}
                columns={commentColumns}
                rowKey="id"
                pagination={false}
                size="small"
              />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title="数据概览">
            <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px 0' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1890ff' }}>
                  {stats?.articleCount || 0}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>文章数量</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#52c41a' }}>
                  {stats?.commentCount || 0}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>评论数量</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#722ed1' }}>
                  {stats?.totalViewCount?.toLocaleString() || 0}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>总阅读量</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#eb2f96' }}>
                  {stats?.totalLikeCount || 0}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>总点赞量</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fa8c16' }}>
                  {stats?.categoryCount || 0}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>分类数量</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#13c2c2' }}>
                  {stats?.tagCount || 0}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>标签数量</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
