import { useCallback, useEffect, useState } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, message, Popconfirm, Space, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router';

import {
  ADMIN_DELETE_ARTICLE,
  ADMIN_RECENT_ARTICLES,
  ADMIN_TOGGLE_ARTICLE_STATUS,
  type ArticleItem,
  type PaginatedResult,
} from '@/features/admin';

import { executeGraphQL } from '@/shared/graphql/request';

const { Title } = Typography;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PUBLISHED: { label: '已发布', color: 'green' },
  DRAFT: { label: '草稿', color: 'orange' },
};

export function AdminArticlesPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchArticles();
  }, [currentPage]);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const result = await executeGraphQL<
        { articles: PaginatedResult<ArticleItem> },
        { page: number; limit: number }
      >(ADMIN_RECENT_ARTICLES, { page: currentPage, limit: 10 });

      setArticles(result.articles.items);
      setTotal(result.articles.total);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await executeGraphQL<{ deleteArticle: boolean }, { id: string }>(ADMIN_DELETE_ARTICLE, {
          id,
        });
        message.success('文章已删除');
        fetchArticles();
      } catch (error) {
        console.error('Failed to delete article:', error);
        message.error('操作失败');
      }
    },
    [fetchArticles],
  );

  const handleToggleStatus = useCallback(
    async (id: string, currentStatus: string) => {
      try {
        const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
        await executeGraphQL<
          { toggleArticleStatus: { id: string; status: string } },
          { id: string; status: string }
        >(ADMIN_TOGGLE_ARTICLE_STATUS, { id, status: newStatus });
        message.success(`文章已${newStatus === 'PUBLISHED' ? '发布' : '设为草稿'}`);
        fetchArticles();
      } catch (error) {
        console.error('Failed to toggle article status:', error);
        message.error('操作失败');
      }
    },
    [fetchArticles],
  );

  const columns = [
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
      render: (status: string) => {
        const config = STATUS_MAP[status] || { label: status, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
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
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: ArticleItem) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/articles/${record.id}/edit`)}
          >
            编辑
          </Button>
          <Button size="small" onClick={() => handleToggleStatus(record.id, record.status)}>
            {record.status === 'PUBLISHED' ? '设为草稿' : '发布'}
          </Button>
          <Popconfirm
            title="确定删除该文章？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
      width: 220,
    },
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <Title level={2}>文章管理</Title>
        <Button icon={<PlusOutlined />} onClick={() => navigate('/admin/articles/new')}>
          新建文章
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={articles}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          total,
          pageSize: 10,
          onChange: handlePageChange,
          showSizeChanger: false,
        }}
      />
    </div>
  );
}
