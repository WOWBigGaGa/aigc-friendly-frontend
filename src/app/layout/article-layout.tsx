// src/app/layout/article-layout.tsx

import { ArrowLeftOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';

import { useTheme } from '@/app/providers';

type ArticleLayoutProps = {
  children?: ReactNode;
};

export function ArticleLayout({ children }: ArticleLayoutProps = {}) {
  const { isDark, setIsDark } = useTheme();
  const navigate = useNavigate();

  return (
    <div className={`article-shell ${isDark ? 'dark' : ''}`}>
      <header className="article-header">
        <div className="article-header-left">
          <Button
            icon={<ArrowLeftOutlined />}
            type="text"
            onClick={() => navigate('/blog')}
          >
            返回首页
          </Button>
        </div>

        <div className="article-header-right">
          <Button
            icon={isDark ? <SunOutlined /> : <MoonOutlined />}
            shape="circle"
            type="text"
            onClick={() => setIsDark((prev) => !prev)}
          />
        </div>
      </header>

      <main className="article-content">
        {children}
      </main>

      <footer className="article-footer">
        <p>&copy; 2025 My Blog. All rights reserved.</p>
      </footer>
    </div>
  );
}