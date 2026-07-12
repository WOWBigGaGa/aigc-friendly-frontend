// src/pages/admin/settings/index.tsx

import { Button, Form, Input, Tabs } from 'antd';

export function AdminSettingsPage() {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then(() => {
      console.log('Settings saved');
    });
  };

  const items = [
    {
      key: 'profile',
      label: '博主信息',
      children: (
        <Form form={form} layout="vertical">
          <Form.Item label="昵称" name="nickname">
            <Input placeholder="请输入昵称" />
          </Form.Item>
          <Form.Item label="简介" name="bio">
            <Input.TextArea placeholder="请输入简介" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleSubmit}>
              保存
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'links',
      label: '友链管理',
      children: <p>友链管理功能</p>,
    },
    {
      key: 'password',
      label: '修改密码',
      children: (
        <Form layout="vertical">
          <Form.Item label="原密码" name="oldPassword">
            <Input.Password placeholder="请输入原密码" />
          </Form.Item>
          <Form.Item label="新密码" name="newPassword">
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item label="确认密码" name="confirmPassword">
            <Input.Password placeholder="请确认新密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary">修改密码</Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>系统设置</h2>
      <Tabs defaultActiveKey="profile" items={items} />
    </div>
  );
}
