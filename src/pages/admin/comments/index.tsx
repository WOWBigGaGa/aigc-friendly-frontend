import { useCallback, useEffect, useState } from 'react';
import { CheckOutlined, CloseOutlined, DeleteOutlined, MessageOutlined } from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';

import {
  ADMIN_ALL_COMMENTS,
  ADMIN_APPROVE_COMMENT,
  ADMIN_DELETE_COMMENT,
  ADMIN_REJECT_COMMENT,
  ADMIN_REPLY_COMMENT,
  type CommentItem,
  type PaginatedResult,
} from '@/features/admin';

import { isGraphQLIngressError } from '@/shared/graphql/errors';
import { executeGraphQL } from '@/shared/graphql/request';

const { Title } = Typography;
const { TextArea } = Input;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待审核', color: 'orange' },
  APPROVED: { label: '已通过', color: 'green' },
  REJECTED: { label: '已驳回', color: 'red' },
};

const STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'PENDING', label: '待审核' },
  { value: 'APPROVED', label: '已通过' },
  { value: 'REJECTED', label: '已驳回' },
];

export function AdminCommentsPage() {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [replyingComment, setReplyingComment] = useState<CommentItem | null>(null);
  const [replyForm] = Form.useForm();

  useEffect(() => {
    fetchComments();
  }, [currentPage, statusFilter]);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const result = await executeGraphQL<
        { allComments: PaginatedResult<CommentItem> },
        { page: number; pageSize: number; status?: string }
      >(ADMIN_ALL_COMMENTS, {
        page: currentPage,
        pageSize: 10,
        ...(statusFilter && { status: statusFilter }),
      });

      setComments(result.allComments.items);
      setTotal(result.allComments.total);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      const errorMessage = isGraphQLIngressError(error)
        ? error.userMessage
        : '加载评论失败，请稍后重试';
      message.error(errorMessage);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter]);

  const handleApprove = useCallback(
    async (id: string) => {
      try {
        await executeGraphQL<{ approveComment: { id: string; status: string } }, { id: string }>(
          ADMIN_APPROVE_COMMENT,
          { id },
        );
        message.success('评论已通过');
        fetchComments();
      } catch (error) {
        console.error('Failed to approve comment:', error);
        const errorMessage = isGraphQLIngressError(error)
          ? error.userMessage
          : '操作失败，请稍后重试';
        message.error(errorMessage);
      }
    },
    [fetchComments],
  );

  const handleReject = useCallback(
    async (id: string) => {
      try {
        await executeGraphQL<{ rejectComment: { id: string; status: string } }, { id: string }>(
          ADMIN_REJECT_COMMENT,
          { id },
        );
        message.success('评论已驳回');
        fetchComments();
      } catch (error) {
        console.error('Failed to reject comment:', error);
        const errorMessage = isGraphQLIngressError(error)
          ? error.userMessage
          : '操作失败，请稍后重试';
        message.error(errorMessage);
      }
    },
    [fetchComments],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await executeGraphQL<{ deleteComment: boolean }, { id: string }>(ADMIN_DELETE_COMMENT, {
          id,
        });
        message.success('评论已删除');
        fetchComments();
      } catch (error) {
        console.error('Failed to delete comment:', error);
        const errorMessage = isGraphQLIngressError(error)
          ? error.userMessage
          : '删除失败，请稍后重试';
        message.error(errorMessage);
      }
    },
    [fetchComments],
  );

  const handleReply = useCallback((comment: CommentItem) => {
    setReplyingComment(comment);
    setReplyModalVisible(true);
    replyForm.resetFields();
  }, []);

  const handleSubmitReply = useCallback(
    async (values: { content: string }) => {
      if (!replyingComment) return;

      try {
        await executeGraphQL<
          { replyComment: { id: string; content: string } },
          { id: string; content: string }
        >(ADMIN_REPLY_COMMENT, { id: replyingComment.id, content: values.content });
        message.success('回复成功');
        setReplyModalVisible(false);
        setReplyingComment(null);
        fetchComments();
      } catch (error) {
        console.error('Failed to reply comment:', error);
        const errorMessage = isGraphQLIngressError(error)
          ? error.userMessage
          : '回复失败，请稍后重试';
        message.error(errorMessage);
      }
    },
    [replyingComment, fetchComments],
  );

  const columns = [
    {
      title: '文章',
      dataIndex: 'articleTitle',
      key: 'articleTitle',
      width: 150,
      ellipsis: true,
      render: (title: string) => title || '-',
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
        const config = STATUS_MAP[status] || { label: status, color: 'default' };
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
          {record.status === 'APPROVED' && (
            <Button size="small" icon={<MessageOutlined />} onClick={() => handleReply(record)}>
              回复
            </Button>
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
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
        <Title level={2}>评论管理</Title>
        <Select
          value={statusFilter}
          onChange={handleStatusChange}
          options={STATUS_OPTIONS}
          style={{ width: 150 }}
        />
      </div>

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

      <Modal
        title={`回复评论 - ${replyingComment?.authorName}`}
        visible={replyModalVisible}
        onCancel={() => {
          setReplyModalVisible(false);
          setReplyingComment(null);
        }}
        footer={null}
      >
        <div style={{ marginBottom: '16px' }}>
          <Typography.Text strong>评论内容：</Typography.Text>
          <Typography.Text type="secondary">{replyingComment?.content}</Typography.Text>
        </div>
        <Form form={replyForm} layout="vertical" onFinish={handleSubmitReply}>
          <Form.Item
            name="content"
            label="回复内容"
            rules={[
              { required: true, message: '请输入回复内容' },
              { max: 500, message: '回复内容不能超过500个字符' },
            ]}
          >
            <TextArea placeholder="请输入回复内容" rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交回复
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
