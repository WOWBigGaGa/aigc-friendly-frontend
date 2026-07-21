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
import dayjs from 'dayjs';

import {
  ADMIN_DASHBOARD_STATS,
  ADMIN_PENDING_COMMENTS,
  ADMIN_RECENT_ARTICLES,
  type ArticleItem,
  type CommentItem,
  type DashboardStats,
  type PaginatedResult,
} from '@/features/admin';

import { executeGraphQL } from '@/shared/graphql/request';

const { Title } = Typography;

const statsCards = [
  {
    title: '文章总数',
    key: 'articleCount',
    prefix: <FileTextOutlined />,
    color: '#1890ff',
  },
  {
    title: '评论总数',
    key: 'commentCount',
    prefix: <MessageOutlined />,
    color: '#52c41a',
  },
  {
    title: '总阅读量',
    key: 'totalViewCount',
    prefix: <EyeOutlined />,
    color: '#722ed1',
  },
  {
    title: '总点赞量',
    key: 'totalLikeCount',
    prefix: <HeartOutlined />,
    color: '#eb2f96',
  },
  {
    title: '分类总数',
    key: 'categoryCount',
    prefix: <CalendarOutlined />,
    color: '#fa8c16',
  },
  {
    title: '标签总数',
    key: 'tagCount',
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
    render: (date: string | null) => (date ? dayjs(date).format('YYYY-MM-DD') : '-'),
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
    render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    width: 170,
  },
];

const defaultStats: DashboardStats = {
  articleCount: 0,
  commentCount: 0,
  categoryCount: 0,
  tagCount: 0,
  totalViewCount: 0,
  totalLikeCount: 0,
  pendingCommentCount: 0,
};

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
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
        executeGraphQL<{ articles: PaginatedResult<ArticleItem> }, { page: number; pageSize: number }>(
          ADMIN_RECENT_ARTICLES,
          { page: 1, pageSize: 5 },
        ),
        executeGraphQL<
          { pendingComments: PaginatedResult<CommentItem> },
          { page: number; pageSize: number }
        >(ADMIN_PENDING_COMMENTS, { page: 1, pageSize: 5 }),
      ]);

      setStats(statsResult.dashboardStats);
      setRecentArticles(articlesResult.articles.items);
      setPendingComments(commentsResult.pendingComments.items);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setStats(defaultStats);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={2}>仪表盘</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {statsCards.map((card) => (
          <Col span={4} key={card.key}>
            <Card>
              <Statistic
                title={card.title}
                value={(stats as unknown as Record<string, number>)[card.key]}
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
          <Card title="待审核评论" extra={<Tag color="orange">{stats.pendingCommentCount} 条</Tag>}>
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
    </div>
  );
}
