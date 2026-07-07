// src/pages/blog/links/index.tsx

import { Typography } from 'antd';

const { Title } = Typography;

export function BlogLinksPage() {
  return (
    <div className="blog-links">
      <Title level={1}>友链</Title>
      <p>欢迎来到友链页面！这里将展示我的友情链接。</p>
    </div>
  );
}
