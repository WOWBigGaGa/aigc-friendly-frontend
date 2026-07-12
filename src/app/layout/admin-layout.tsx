// src/app/layout/admin-layout.tsx

import {
  BarChartOutlined,
  FileTextOutlined,
  FolderOutlined,
  PictureOutlined,
  SettingOutlined,
  TagOutlined,
  MessageOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/admin/dashboard', icon: <BarChartOutlined />, label: '仪表盘' },
  { key: '/admin/articles', icon: <FileTextOutlined />, label: '文章管理' },
  { key: '/admin/categories', icon: <FolderOutlined />, label: '分类管理' },
  { key: '/admin/tags', icon: <TagOutlined />, label: '标签管理' },
  { key: '/admin/comments', icon: <MessageOutlined />, label: '评论管理' },
  { key: '/admin/files', icon: <PictureOutlined />, label: '文件管理' },
  { key: '/admin/settings', icon: <SettingOutlined />, label: '系统设置' },
];

interface AdminLayoutProps {
  children?: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps = {}) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        theme="dark"
        width={220}
      >
        <div className="admin-logo">
          <h1 style={{ color: '#fff', fontSize: '18px', textAlign: 'center', margin: '16px 0' }}>
            管理后台
          </h1>
        </div>
        <Menu
          defaultSelectedKeys={['/admin/dashboard']}
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 16px', background: '#fff', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ marginRight: '16px' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Tooltip title="用户信息">
              <UserOutlined style={{ fontSize: '18px', color: '#666' }} />
            </Tooltip>
            <Tooltip title="退出登录">
              <Button icon={<LogoutOutlined />} onClick={handleLogout} danger />
            </Tooltip>
          </div>
        </Header>
        <Content
          style={{ margin: '24px 16px', padding: '24px', background: '#f5f5f5', minHeight: '280px' }}
        >
          {children ?? <Outlet />}
        </Content>
      </Layout>
    </Layout>
  );
}