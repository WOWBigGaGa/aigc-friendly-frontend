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

import { useAdminAuth } from '@/app/providers/use-admin-auth';

import styles from './admin-layout.module.css';

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
  const { logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <Layout className={styles.adminLayout}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        theme="dark"
        width={220}
      >
        <div className={styles.adminLogo}>
          <h1 className={styles.adminLogoTitle}>管理后台</h1>
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
        <Header className={styles.adminHeader}>
          <div className={styles.adminHeaderLeft}>
            <Button
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ marginRight: '16px' }}
            />
          </div>
          <div className={styles.adminHeaderRight}>
            <Tooltip title="用户信息">
              <UserOutlined className={styles.adminHeaderUserIcon} />
            </Tooltip>
            <Tooltip title="退出登录">
              <Button icon={<LogoutOutlined />} onClick={handleLogout} danger />
            </Tooltip>
          </div>
        </Header>
        <Content className={styles.adminContent}>
          {children ?? <Outlet />}
        </Content>
      </Layout>
    </Layout>
  );
}