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
  Tabs,
  Typography,
} from 'antd';

import {
  ADMIN_CHANGE_PASSWORD,
  ADMIN_CREATE_FRIEND_LINK,
  ADMIN_DELETE_FRIEND_LINK,
  ADMIN_UPDATE_FRIEND_LINK,
  ADMIN_UPDATE_USER_INFO,
} from '@/features/admin';
import { GET_FRIEND_LINKS } from '@/features/blog';

import { executeGraphQL } from '@/shared/graphql';

const { Title } = Typography;
const { TextArea } = Input;

interface FriendLinkItem {
  id: string;
  name: string;
  url: string;
  description: string | null;
  logo: string | null;
  sort: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FriendLinkFormValues {
  name: string;
  url: string;
  description?: string;
  logo?: string;
  sort?: number;
}

interface ProfileFormValues {
  nickname: string;
  signature: string;
}

interface PasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function AdminSettingsPage() {
  const [profileForm] = Form.useForm<ProfileFormValues>();
  const [passwordForm] = Form.useForm<PasswordFormValues>();
  const [friendLinks, setFriendLinks] = useState<FriendLinkItem[]>([]);
  const [friendLinkModalOpen, setFriendLinkModalOpen] = useState(false);
  const [editingFriendLink, setEditingFriendLink] = useState<FriendLinkItem | null>(null);
  const [friendLinkForm] = Form.useForm<FriendLinkFormValues>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchFriendLinks = useCallback(async () => {
    setLoading(true);
    try {
      const result = await executeGraphQL<{ friendLinks: FriendLinkItem[] }, Record<string, never>>(
        GET_FRIEND_LINKS.loc?.source?.body ?? '',
        {},
      );
      setFriendLinks(result.friendLinks);
    } catch (error) {
      console.error('Failed to fetch friend links:', error);
      message.error('加载友链失败，请稍后重试');
      setFriendLinks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFriendLinks();
  }, [fetchFriendLinks]);

  const handleSaveProfile = useCallback(async (values: ProfileFormValues) => {
    setSubmitting(true);
    try {
      await executeGraphQL<
        { updateUserInfo: { isUpdated: boolean } },
        { input: { nickname?: string; signature?: string } }
      >(ADMIN_UPDATE_USER_INFO, {
        input: { nickname: values.nickname, signature: values.signature },
      });
      message.success('博主信息已保存');
    } catch (error) {
      console.error('Failed to update profile:', error);
      message.error('保存失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  }, []);

  const handleChangePassword = useCallback(
    async (values: PasswordFormValues) => {
      if (values.newPassword !== values.confirmPassword) {
        message.error('两次输入的密码不一致');
        return;
      }

      setSubmitting(true);
      try {
        const result = await executeGraphQL<
          { changePassword: { success: boolean; message?: string | null } },
          { input: { oldPassword: string; newPassword: string } }
        >(ADMIN_CHANGE_PASSWORD, {
          input: { oldPassword: values.oldPassword, newPassword: values.newPassword },
        });

        if (result.changePassword.success) {
          message.success('密码修改成功，请重新登录');
          passwordForm.resetFields();
        } else {
          message.error(result.changePassword.message || '修改密码失败');
        }
      } catch (error) {
        console.error('Failed to change password:', error);
        message.error('修改密码失败，请稍后重试');
      } finally {
        setSubmitting(false);
      }
    },
    [passwordForm],
  );

  const handleCreateFriendLink = () => {
    setEditingFriendLink(null);
    friendLinkForm.resetFields();
    setFriendLinkModalOpen(true);
  };

  const handleEditFriendLink = (link: FriendLinkItem) => {
    setEditingFriendLink(link);
    friendLinkForm.setFieldsValue({
      name: link.name,
      url: link.url,
      description: link.description ?? undefined,
      logo: link.logo ?? undefined,
      sort: link.sort,
    });
    setFriendLinkModalOpen(true);
  };

  const handleFriendLinkModalCancel = () => {
    setFriendLinkModalOpen(false);
    setEditingFriendLink(null);
  };

  const handleSaveFriendLink = useCallback(
    async (values: FriendLinkFormValues) => {
      setSubmitting(true);
      try {
        if (editingFriendLink) {
          await executeGraphQL<
            { updateFriendLink: FriendLinkItem },
            {
              id: string;
              name?: string;
              url?: string;
              description?: string;
              logo?: string;
              sort?: number;
            }
          >(ADMIN_UPDATE_FRIEND_LINK, {
            id: editingFriendLink.id,
            name: values.name,
            url: values.url,
            description: values.description || undefined,
            logo: values.logo || undefined,
            sort: values.sort,
          });
          message.success('友链已更新');
        } else {
          await executeGraphQL<
            { createFriendLink: FriendLinkItem },
            { name: string; url: string; description?: string; logo?: string; sort?: number }
          >(ADMIN_CREATE_FRIEND_LINK, {
            name: values.name,
            url: values.url,
            description: values.description || undefined,
            logo: values.logo || undefined,
            sort: values.sort,
          });
          message.success('友链已创建');
        }
        setFriendLinkModalOpen(false);
        setEditingFriendLink(null);
        fetchFriendLinks();
      } catch (error) {
        console.error('Failed to save friend link:', error);
        message.error('操作失败，请稍后重试');
      } finally {
        setSubmitting(false);
      }
    },
    [editingFriendLink, fetchFriendLinks],
  );

  const handleDeleteFriendLink = useCallback(
    async (id: string) => {
      try {
        await executeGraphQL<{ deleteFriendLink: boolean }, { id: string }>(
          ADMIN_DELETE_FRIEND_LINK,
          { id },
        );
        message.success('友链已删除');
        fetchFriendLinks();
      } catch (error) {
        console.error('Failed to delete friend link:', error);
        message.error('删除失败，请稍后重试');
      }
    },
    [fetchFriendLinks],
  );

  const friendLinkColumns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    {
      title: '链接',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text: string | null) => text || '-',
    },
    { title: '排序', dataIndex: 'sort', key: 'sort' },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (isActive ? '启用' : '禁用'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: FriendLinkItem) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEditFriendLink(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该友链？"
            onConfirm={() => handleDeleteFriendLink(record.id)}
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

  const items = [
    {
      key: 'profile',
      label: '博主信息',
      children: (
        <Form form={profileForm} layout="vertical" onFinish={handleSaveProfile}>
          <Form.Item
            name="nickname"
            label="昵称"
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input placeholder="请输入昵称" />
          </Form.Item>
          <Form.Item name="signature" label="简介">
            <TextArea placeholder="请输入简介" rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting}>
              保存
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'links',
      label: '友链管理',
      children: (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}
          >
            <Title level={3}>友链列表</Title>
            <Button icon={<PlusOutlined />} onClick={handleCreateFriendLink}>
              添加友链
            </Button>
          </div>
          <Table
            columns={friendLinkColumns}
            dataSource={friendLinks}
            rowKey="id"
            loading={loading}
            pagination={false}
          />
        </div>
      ),
    },
    {
      key: 'password',
      label: '修改密码',
      children: (
        <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
          <Form.Item
            name="oldPassword"
            label="原密码"
            rules={[{ required: true, message: '请输入原密码' }]}
          >
            <Input.Password placeholder="请输入原密码" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度不能少于6位' },
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            rules={[{ required: true, message: '请确认新密码' }]}
          >
            <Input.Password placeholder="请确认新密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting}>
              修改密码
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>系统设置</Title>
      <Tabs defaultActiveKey="profile" items={items} />

      <Modal
        title={editingFriendLink ? '编辑友链' : '添加友链'}
        open={friendLinkModalOpen}
        onCancel={handleFriendLinkModalCancel}
        footer={null}
      >
        <Form form={friendLinkForm} layout="vertical" onFinish={handleSaveFriendLink}>
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入友链名称' }]}
          >
            <Input placeholder="请输入友链名称" />
          </Form.Item>
          <Form.Item
            name="url"
            label="链接"
            rules={[{ required: true, message: '请输入友链链接' }]}
          >
            <Input placeholder="请输入友链链接" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea placeholder="请输入友链描述" rows={3} />
          </Form.Item>
          <Form.Item name="logo" label="Logo">
            <Input placeholder="请输入 Logo URL" />
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
