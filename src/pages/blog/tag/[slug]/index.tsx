// src/pages/blog/tag/[slug]/index.tsx

import { Typography } from 'antd';
import { useParams } from 'react-router';

const { Title } = Typography;

export function BlogTagPage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="blog-tag">
      <Title level={1}>标签 - {slug}</Title>
      <p>这是标签 "{slug}" 下的文章列表。</p>
    </div>
  );
}
