// src/pages/blog/category/[slug]/index.tsx

import { Typography } from 'antd';
import { useParams } from 'react-router';

const { Title } = Typography;

export function BlogCategoryPage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="blog-category">
      <Title level={1}>分类 - {slug}</Title>
      <p>这是分类 "{slug}" 下的文章列表。</p>
    </div>
  );
}