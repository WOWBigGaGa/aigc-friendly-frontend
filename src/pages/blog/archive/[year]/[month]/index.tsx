// src/pages/blog/archive/[year]/[month]/index.tsx

import { Typography } from 'antd';
import { useParams } from 'react-router';

const { Title } = Typography;

export function BlogArchivePage() {
  const { year, month } = useParams<{ year: string; month: string }>();

  return (
    <div className="blog-archive">
      <Title level={1}>
        归档 - {year}年{month}月
      </Title>
      <p>
        这是 {year} 年 {month} 月的文章列表。
      </p>
    </div>
  );
}
