import { useState } from 'react';
import { Button, Card, Form, Input, message } from 'antd';
import { useNavigate } from 'react-router';

import { useAdminAuth } from '@/app/providers/use-admin-auth';

import { ADMIN_LOGIN } from '@/features/admin';

import { executeGraphQL } from '@/shared/graphql/request';

type AdminLoginMutationResponse = {
  login: {
    accessToken: string;
    refreshToken: string;
    accountId: number;
    role: string;
    userInfo: {
      id: number;
      accountId: number;
      nickname: string;
      email: string;
      avatarUrl: string;
    };
  };
};

type AdminLoginMutationVariables = {
  loginName: string;
  loginPassword: string;
  type: string;
  audience: string;
};

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { login } = useAdminAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const data = await executeGraphQL<AdminLoginMutationResponse, AdminLoginMutationVariables>(
        ADMIN_LOGIN,
        {
          loginName: values.username,
          loginPassword: values.password,
          type: 'PASSWORD',
          audience: 'DESKTOP',
        },
      );
      const { accessToken, userInfo } = data.login;
      login(accessToken, {
        id: String(userInfo.id),
        username: userInfo.nickname,
        email: userInfo.email,
        roles: [data.login.role],
      });
      message.success('登录成功');
      navigate('/admin/dashboard');
    } catch {
      message.error('用户名或密码错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f5f5f5',
      }}
    >
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>管理后台登录</h2>
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#999' }}>
          默认用户名: admin, 密码: admin
        </p>
      </Card>
    </div>
  );
}
