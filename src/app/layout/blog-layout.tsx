// src/app/layout/blog-layout.tsx

import { useMemo, useState } from 'react';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Button, Tabs } from 'antd';
import type { ReactNode } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

import { useTheme } from '@/app/providers';

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
  const [isSidebarOpen] = useState(false);

  const activeNavigationPath = useMemo(() => {
    return blogNavigationItems.find((item) => location.pathname.startsWith(item.path))?.path;
  }, [location.pathname]);

  const navigationTabs = useMemo(
    () => blogNavigationItems.map((item) => ({ key: item.path, label: item.label })),
    [],
  );

  return (
    <div className={`blog-shell ${isDark ? 'dark' : ''}`}>
      <header className="blog-header">
        <div className="blog-header-left">
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
        <aside className={`blog-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          {/* TODO: 后续替换为GraphQL查询获取真实分类数据 */}
          <div className="sidebar-section">
            <h3>分类</h3>
            <ul className="sidebar-list">
              <li onClick={() => navigate('/blog/category/tech')}>技术</li>
              <li onClick={() => navigate('/blog/category/life')}>生活</li>
              <li onClick={() => navigate('/blog/category/reading')}>阅读</li>
            </ul>
          </div>
          {/* TODO: 后续替换为GraphQL查询获取真实标签数据 */}
          <div className="sidebar-section">
            <h3>标签</h3>
            <ul className="sidebar-list">
              <li onClick={() => navigate('/blog/tag/react')}>React</li>
              <li onClick={() => navigate('/blog/tag/typescript')}>TypeScript</li>
              <li onClick={() => navigate('/blog/tag/node')}>Node.js</li>
            </ul>
          </div>
          {/* TODO: 后续替换为GraphQL查询获取真实归档数据 */}
          <div className="sidebar-section">
            <h3>归档</h3>
            <ul className="sidebar-list">
              <li onClick={() => navigate('/blog/archive/2025/01')}>2025年1月</li>
              <li onClick={() => navigate('/blog/archive/2024/12')}>2024年12月</li>
            </ul>
          </div>
        </aside>

        <main className="blog-main">{children ?? <Outlet />}</main>
      </div>

      <footer className="blog-footer">
        <p>&copy; 2025 My Blog. All rights reserved.</p>
      </footer>
    </div>
  );
}
