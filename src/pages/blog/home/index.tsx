// src/pages/blog/home/index.tsx

import { Typography } from 'antd';

const { Title } = Typography;

export function BlogHomePage() {
  return (
    <div className="blog-home">
      <Title level={1}>博客首页</Title>
      <p>欢迎来到我的博客！这里将展示最新的文章列表。</p>
    </div>
  );
}