// src/pages/blog/about/index.tsx

import { Typography } from 'antd';

const { Title } = Typography;

export function BlogAboutPage() {
  return (
    <div className="blog-about">
      <Title level={1}>关于我</Title>
      <p>欢迎来到关于我页面！这里将展示博主的个人信息。</p>
    </div>
  );
}
