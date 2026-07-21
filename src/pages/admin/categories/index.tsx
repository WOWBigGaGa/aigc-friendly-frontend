// src/pages/admin/categories/index.tsx

import { useCallback, useEffect, useState } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
  Typography,
} from 'antd';

import {
  CREATE_CATEGORY,
  DELETE_CATEGORY,
  GET_CATEGORIES,
  UPDATE_CATEGORY,
} from '@/features/blog';
import { executeGraphQL } from '@/shared/graphql';

const { Title } = Typography;
const { TextArea } = Input;

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoryFormValues {
  name: string;
  slug: string;
  description?: string;
  sort?: number | null;
}

interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  sort?: number;
}

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<CategoryFormValues>();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const result = await executeGraphQL<
        { categories: CategoryItem[] },
        Record<string, never>
      >(GET_CATEGORIES.loc?.source?.body ?? '', {});
      setCategories(result.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      message.error('加载分类失败，请稍后重试');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (category: CategoryItem) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      slug: category.slug,
      description: category.description ?? undefined,
      sort: category.sort,
    });
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingCategory(null);
  };

  const handleSubmit = useCallback(
    async (values: CategoryFormValues) => {
      setSubmitting(true);
      try {
        const input: CreateCategoryInput = {
          name: values.name,
          slug: values.slug,
        };
        if (values.description) {
          input.description = values.description;
        }
        if (typeof values.sort === 'number') {
          input.sort = values.sort;
        }

        if (editingCategory) {
          await executeGraphQL<
            { updateCategory: CategoryItem },
            { id: string; input: CreateCategoryInput }
          >(UPDATE_CATEGORY.loc?.source?.body ?? '', {
            id: editingCategory.id,
            input,
          });
          message.success('分类已更新');
        } else {
          await executeGraphQL<
            { createCategory: CategoryItem },
            { input: CreateCategoryInput }
          >(CREATE_CATEGORY.loc?.source?.body ?? '', { input });
          message.success('分类已创建');
        }
        setModalVisible(false);
        setEditingCategory(null);
        fetchCategories();
      } catch (error) {
        console.error('Failed to save category:', error);
        message.error('操作失败，请稍后重试');
      } finally {
        setSubmitting(false);
      }
    },
    [editingCategory, fetchCategories],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await executeGraphQL<{ deleteCategory: boolean }, { id: string }>(
          DELETE_CATEGORY.loc?.source?.body ?? '',
          { id },
        );
        message.success('分类已删除');
        fetchCategories();
      } catch (error) {
        console.error('Failed to delete category:', error);
        message.error('删除失败，请稍后重试');
      }
    },
    [fetchCategories],
  );

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text: string | null) => text || '-',
    },
    { title: '排序', dataIndex: 'sort', key: 'sort' },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: CategoryItem) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该分类？"
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
        <Title level={2}>分类管理</Title>
        <Button icon={<PlusOutlined />} onClick={handleCreate}>
          新建分类
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title={editingCategory ? '编辑分类' : '新建分类'}
        visible={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item
            name="slug"
            label="Slug"
            rules={[{ required: true, message: '请输入 Slug' }]}
          >
            <Input placeholder="请输入 Slug" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea placeholder="请输入分类描述" rows={3} />
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <InputNumber placeholder="请输入排序" style={{ width: '100%' }} />
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
