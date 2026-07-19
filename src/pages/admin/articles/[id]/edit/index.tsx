import { useEffect, useState } from 'react';
import { ArrowLeftOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons';
import MDEditor from '@uiw/react-md-editor';
import { Button, Form, Input, message, Select, Switch, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router';

import {
  ADMIN_ARTICLE_BY_ID,
  ADMIN_UPDATE_ARTICLE,
  type ArticleView,
  type Category,
  GET_CATEGORIES,
} from '@/features/admin';

import { executeGraphQL } from '@/shared/graphql/request';

const { Title } = Typography;
const { TextArea } = Input;

export function AdminArticleEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (!id) {
      navigate('/admin/articles');
      return;
    }

    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [articleResult, categoriesResult] = await Promise.all([
        executeGraphQL<{ article: ArticleView | null }, { id: string }>(ADMIN_ARTICLE_BY_ID, {
          id: id!,
        }),
        executeGraphQL<{ categories: Category[] }, {}>(GET_CATEGORIES, {}),
      ]);

      if (!articleResult.article) {
        message.error('文章不存在');
        navigate('/admin/articles');
        return;
      }

      form.setFieldsValue({
        title: articleResult.article.title,
        content: articleResult.article.content,
        summary: articleResult.article.summary,
        coverImage: articleResult.article.coverImage,
        categoryId: articleResult.article.categoryId,
        isPinned: articleResult.article.isPinned,
        status: articleResult.article.status,
      });

      setCategories(categoriesResult.categories);
    } catch (error) {
      console.error('Failed to fetch article:', error);
      message.error('加载文章失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: {
    title: string;
    content: string;
    summary: string;
    coverImage?: string;
    categoryId?: string;
    isPinned?: boolean;
    status: string;
  }) => {
    if (!id) return;

    setLoading(true);
    try {
      await executeGraphQL<
        {
          updateArticle: { id: string; title: string; status: string; publishedAt: string | null };
        },
        {
          id: string;
          input: {
            title: string;
            content: string;
            summary: string;
            coverImage?: string;
            categoryId?: string;
            isPinned?: boolean;
            status?: string;
          };
        }
      >(ADMIN_UPDATE_ARTICLE, {
        id,
        input: {
          title: values.title,
          content: values.content,
          summary: values.summary,
          coverImage: values.coverImage || undefined,
          categoryId: values.categoryId || undefined,
          isPinned: values.isPinned || undefined,
          status: values.status,
        },
      });

      message.success(`文章${values.status === 'PUBLISHED' ? '发布' : '保存'}成功`);
      navigate('/admin/articles');
    } catch (error) {
      console.error('Failed to update article:', error);
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    form.setFieldsValue({ status: 'DRAFT' });
    form.submit();
  };

  const handlePublish = () => {
    form.setFieldsValue({ status: 'PUBLISHED' });
    form.submit();
  };

  if (loading) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}
      >
        <Typography.Text>加载中...</Typography.Text>
      </div>
    );
  }

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/articles')}>
            返回
          </Button>
          <Title level={2}>编辑文章</Title>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button icon={<SaveOutlined />} onClick={handleSaveDraft} loading={loading}>
            保存草稿
          </Button>
          <Button type="primary" icon={<SendOutlined />} onClick={handlePublish} loading={loading}>
            发布文章
          </Button>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="title"
          label="标题"
          rules={[
            { required: true, message: '请输入文章标题' },
            { max: 200, message: '标题不能超过200个字符' },
          ]}
        >
          <Input placeholder="请输入文章标题" size="large" />
        </Form.Item>

        <Form.Item
          name="summary"
          label="摘要"
          rules={[
            { required: true, message: '请输入文章摘要' },
            { max: 500, message: '摘要不能超过500个字符' },
          ]}
        >
          <TextArea placeholder="请输入文章摘要" rows={3} />
        </Form.Item>

        <Form.Item name="coverImage" label="封面图片">
          <Input placeholder="请输入封面图片 URL" />
        </Form.Item>

        <Form.Item name="categoryId" label="分类">
          <Select
            placeholder="请选择分类"
            options={categories.map((cat) => ({
              value: cat.id,
              label: cat.name,
            }))}
          />
        </Form.Item>

        <Form.Item name="isPinned" label="置顶" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item
          name="content"
          label="内容"
          rules={[{ required: true, message: '请输入文章内容' }]}
        >
          <MDEditor height={500} />
        </Form.Item>

        <Form.Item hidden name="status" />
      </Form>
    </div>
  );
}
