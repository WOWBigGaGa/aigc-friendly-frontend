import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Button, Popconfirm, Table, Tag, Typography, Space, message } from 'antd';
import { CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';

import {
  ADMIN_ALL_COMMENTS,
  ADMIN_APPROVE_COMMENT,
  ADMIN_REJECT_COMMENT,
  ADMIN_DELETE_COMMENT,
  type CommentItem,
  type PaginatedResult,
} from '@/features/admin';

import { executeGraphQL } from '@/shared/graphql/request';

const { Title } = Typography;

const columns = [
  {
    title: '文章',
    dataIndex: 'articleId',
    key: 'articleId',
    width: 150,
  },
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
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => {
      const statusMap = {
        PENDING: { label: '待审核', color: 'orange' },
        APPROVED: { label: '已通过', color: 'green' },
        REJECTED: { label: '已驳回', color: 'red' },
      };
      const config = statusMap[status as keyof typeof statusMap] || { label: status, color: 'default' };
      return <Tag color={config.color}>{config.label}</Tag>;
    },
    width: 100,
  },
  {
    title: '时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    width: 170,
  },
  {
    title: '操作',
    key: 'action',
    render: (_: unknown, record: CommentItem) => (
      <Space size="small">
        {record.status === 'PENDING' && (
          <>
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleApprove(record.id)}
            >
              通过
            </Button>
            <Button
              size="small"
              danger
              icon={<CloseOutlined />}
              onClick={() => handleReject(record.id)}
            >
              驳回
            </Button>
          </>
        )}
        <Popconfirm
          title="确定删除该评论？"
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
    width: 200,
  },
];

let handleApprove: (id: string) => void;
let handleReject: (id: string) => void;
let handleDelete: (id: string) => void;

export function AdminCommentsPage() {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchComments();
  }, [currentPage]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const result = await executeGraphQL<
        { allComments: PaginatedResult<CommentItem> },
        { page: number; limit: number }
      >(ADMIN_ALL_COMMENTS, { page: currentPage, limit: 10 });

      setComments(result.allComments.items);
      setTotal(result.allComments.total);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  handleApprove = async (id: string) => {
    try {
      await executeGraphQL<{ approveComment: { id: string; status: string } }, { id: string }>(
        ADMIN_APPROVE_COMMENT,
        { id },
      );
      message.success('评论已通过');
      fetchComments();
    } catch (error) {
      console.error('Failed to approve comment:', error);
      message.error('操作失败');
    }
  };

  handleReject = async (id: string) => {
    try {
      await executeGraphQL<{ rejectComment: { id: string; status: string } }, { id: string }>(
        ADMIN_REJECT_COMMENT,
        { id },
      );
      message.success('评论已驳回');
      fetchComments();
    } catch (error) {
      console.error('Failed to reject comment:', error);
      message.error('操作失败');
    }
  };

  handleDelete = async (id: string) => {
    try {
      await executeGraphQL<{ deleteComment: boolean }, { id: string }>(ADMIN_DELETE_COMMENT, { id });
      message.success('评论已删除');
      fetchComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
      message.error('操作失败');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <Title level={2}>评论管理</Title>

      <Table
        columns={columns}
        dataSource={comments}
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