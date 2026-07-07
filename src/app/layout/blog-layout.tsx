import { useMemo, useState } from 'react';
import { MenuOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Button, Tabs } from 'antd';
import type { ReactNode } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

import { useTheme } from '@/app/providers';

import { BlogSidebar } from './components/blog-sidebar';

type BlogLayoutProps = {
  children?: ReactNode;
};

const blogNavigationItems = [
  { path: '/blog', label: '首页' },
  { path: '/blog/about', label: '关于我' },
  { path: '/blog/links', label: '友链' },
];

export function BlogLayout({ children }: BlogLayoutProps = {}) {
  const { isDark, setIsDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeNavigationPath = useMemo(() => {
    return blogNavigationItems.find((item) => location.pathname.startsWith(item.path))?.path;
  }, [location.pathname]);

  const navigationTabs = useMemo(
    () => blogNavigationItems.map((item) => ({ key: item.path, label: item.label })),
    [],
  );

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className={`blog-shell ${isDark ? 'dark' : ''}`}>
      <header className="blog-header">
        <div className="blog-header-left">
          <span className="sidebar-toggle">
            <Button icon={<MenuOutlined />} shape="circle" type="text" onClick={toggleSidebar} />
          </span>
          <h1 className="blog-title" onClick={() => navigate('/blog')}>
            My Blog
          </h1>
        </div>

        <nav className="blog-nav">
          <Tabs
            activeKey={activeNavigationPath}
            items={navigationTabs}
            onChange={(path) => navigate(path)}
            size="small"
            tabBarGutter={24}
          />
        </nav>

        <div className="blog-header-right">
          <Button
            icon={isDark ? <SunOutlined /> : <MoonOutlined />}
            shape="circle"
            type="text"
            onClick={() => setIsDark((prev) => !prev)}
          />
        </div>
      </header>

      <div className="blog-content">
        <BlogSidebar isOpen={isSidebarOpen} />

        <main className="blog-main">{children ?? <Outlet />}</main>
      </div>

      <footer className="blog-footer">
        <p>&copy; 2025 My Blog. All rights reserved.</p>
      </footer>
    </div>
  );
}
