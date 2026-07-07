// src/pages/blog/article/[id]/index.tsx

import { Typography } from 'antd';
import { useParams } from 'react-router';

const { Title } = Typography;

export function BlogArticlePage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="blog-article">
      <Title level={1}>文章详情 - {id}</Title>
      <p>这是文章 {id} 的详情页面。</p>
    </div>
  );
}