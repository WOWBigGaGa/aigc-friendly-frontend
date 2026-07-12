// src/pages/admin/login/index.tsx

import { Button, Card, Form, Input, message } from 'antd';
import { useNavigate } from 'react-router';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSubmit = async (values: { username: string; password: string }) => {
    if (values.username === 'admin' && values.password === 'admin') {
      localStorage.setItem('admin_token', 'mock_token');
      message.success('登录成功');
      navigate('/admin/dashboard');
    } else {
      message.error('用户名或密码错误');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
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
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
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