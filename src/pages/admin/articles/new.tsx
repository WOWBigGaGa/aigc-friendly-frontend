// src/pages/admin/articles/new.tsx

import { Button, Form, Input, Select } from 'antd';
import { useNavigate } from 'react-router';

const { TextArea } = Input;

export function AdminArticleNewPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then(() => {
      navigate('/admin/articles');
    });
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
        <h2>新建文章</h2>
        <Button onClick={() => navigate('/admin/articles')}>返回列表</Button>
      </div>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="标题" name="title" rules={[{ required: true, message: '请输入标题' }]}>
          <Input placeholder="请输入文章标题" />
        </Form.Item>
        <Form.Item label="摘要" name="excerpt">
          <TextArea placeholder="请输入文章摘要" rows={3} />
        </Form.Item>
        <Form.Item label="分类" name="category">
          <Select placeholder="请选择分类">
            <Select.Option value="technology">技术</Select.Option>
            <Select.Option value="life">生活</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="标签" name="tags">
          <Select mode="tags" placeholder="请输入标签" />
        </Form.Item>
        <Form.Item label="内容" name="content" rules={[{ required: true, message: '请输入内容' }]}>
          <TextArea placeholder="请输入文章内容（Markdown格式）" rows={20} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            发布文章
          </Button>
          <Button style={{ marginLeft: '8px' }}>保存草稿</Button>
        </Form.Item>
      </Form>
    </div>
  );
}
