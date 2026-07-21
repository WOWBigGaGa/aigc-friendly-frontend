// src/pages/admin/tags/index.tsx

import { useCallback, useEffect, useState } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Popconfirm, Space, Table, Typography } from 'antd';
import dayjs from 'dayjs';

import { CREATE_TAG, DELETE_TAG, GET_TAGS, UPDATE_TAG } from '@/features/blog';

import { executeGraphQL } from '@/shared/graphql';

const { Title } = Typography;

interface TagItem {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

interface TagFormValues {
  name: string;
  slug: string;
}

interface CreateTagInput {
  name: string;
  slug: string;
}

export function AdminTagsPage() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<TagFormValues>();

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const result = await executeGraphQL<{ tags: TagItem[] }, Record<string, never>>(
        GET_TAGS.loc?.source?.body ?? '',
        {},
      );
      setTags(result.tags);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      message.error('加载标签失败，请稍后重试');
      setTags([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleCreate = () => {
    setEditingTag(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (tag: TagItem) => {
    setEditingTag(tag);
    form.setFieldsValue({
      name: tag.name,
      slug: tag.slug,
    });
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingTag(null);
  };

  const handleSubmit = useCallback(
    async (values: TagFormValues) => {
      setSubmitting(true);
      try {
        const input: CreateTagInput = {
          name: values.name,
          slug: values.slug,
        };

        if (editingTag) {
          await executeGraphQL<{ updateTag: TagItem }, { id: string; input: CreateTagInput }>(
            UPDATE_TAG.loc?.source?.body ?? '',
            {
              id: editingTag.id,
              input,
            },
          );
          message.success('标签已更新');
        } else {
          await executeGraphQL<{ createTag: TagItem }, { input: CreateTagInput }>(
            CREATE_TAG.loc?.source?.body ?? '',
            { input },
          );
          message.success('标签已创建');
        }
        setModalVisible(false);
        setEditingTag(null);
        fetchTags();
      } catch (error) {
        console.error('Failed to save tag:', error);
        message.error('操作失败，请稍后重试');
      } finally {
        setSubmitting(false);
      }
    },
    [editingTag, fetchTags],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await executeGraphQL<{ deleteTag: boolean }, { id: string }>(
          DELETE_TAG.loc?.source?.body ?? '',
          { id },
        );
        message.success('标签已删除');
        fetchTags();
      } catch (error) {
        console.error('Failed to delete tag:', error);
        message.error('删除失败，请稍后重试');
      }
    },
    [fetchTags],
  );

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: TagItem) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该标签？"
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
    },
  ];

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
        <Title level={2}>标签管理</Title>
        <Button icon={<PlusOutlined />} onClick={handleCreate}>
          新建标签
        </Button>
      </div>

      <Table columns={columns} dataSource={tags} rowKey="id" loading={loading} pagination={false} />

      <Modal
        title={editingTag ? '编辑标签' : '新建标签'}
        visible={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入标签名称' }]}
          >
            <Input placeholder="请输入标签名称" />
          </Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true, message: '请输入 Slug' }]}>
            <Input placeholder="请输入 Slug" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting}>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
