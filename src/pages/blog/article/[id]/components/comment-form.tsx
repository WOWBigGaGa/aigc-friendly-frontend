import { useEffect, useState } from 'react';
import { Button, Form, Input, message } from 'antd';

import { CREATE_COMMENT } from '@/features/blog';

import { executeGraphQL } from '@/shared/graphql';
import { getErrorMessage } from '@/shared/graphql/error-handler';

interface ParentComment {
  id: string;
  authorName: string;
}

interface CommentFormProps {
  articleId: string;
  parentComment?: ParentComment | null;
  onSubmit: () => void;
}

interface CreateCommentVariables {
  input: {
    articleId: string;
    authorName: string;
    authorEmail: string;
    content: string;
    parentId?: string;
  };
}

export function CommentForm({ articleId, parentComment, onSubmit }: CommentFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    form.resetFields();
    if (parentComment) {
      form.setFieldsValue({
        content: `@${parentComment.authorName} `,
      });
    }
  }, [parentComment, form]);

  const handleSubmit = async (values: {
    authorName: string;
    authorEmail: string;
    content: string;
  }) => {
    setLoading(true);
    try {
      const mutationBody = CREATE_COMMENT.loc?.source?.body ?? '';
      const variables: CreateCommentVariables = {
        input: {
          articleId,
          authorName: values.authorName.trim(),
          authorEmail: values.authorEmail.trim(),
          content: values.content.trim(),
          parentId: parentComment?.id,
        },
      };

      await executeGraphQL<{ createComment: unknown }, CreateCommentVariables>(
        mutationBody,
        variables,
      );

      message.success('评论提交成功，等待审核');
      form.resetFields();
      onSubmit();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      message.error(errorMessage || '评论提交失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical" style={{ marginTop: '24px' }}>
      {parentComment && (
        <div
          style={{
            padding: '12px',
            background: 'var(--ant-color-bg-hover)',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '13px',
            color: 'var(--ant-color-text-secondary)',
          }}
        >
          回复 <strong>{parentComment.authorName}</strong>
        </div>
      )}

      <Form.Item
        name="authorName"
        label="昵称"
        rules={[
          { required: true, message: '请输入昵称' },
          { max: 50, message: '昵称不能超过50个字符' },
        ]}
      >
        <Input placeholder="请输入昵称" size="large" />
      </Form.Item>

      <Form.Item
        name="authorEmail"
        label="邮箱"
        rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' },
        ]}
      >
        <Input placeholder="请输入邮箱" size="large" />
      </Form.Item>

      <Form.Item
        name="content"
        label="评论内容"
        rules={[
          { required: true, message: '请输入评论内容' },
          { max: 2000, message: '评论内容不能超过2000个字符' },
        ]}
      >
        <Input.TextArea placeholder="请输入评论内容" rows={4} size="large" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} size="large">
          提交评论
        </Button>
      </Form.Item>
    </Form>
  );
}
