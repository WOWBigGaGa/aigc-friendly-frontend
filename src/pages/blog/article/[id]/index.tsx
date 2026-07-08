import { useParams } from 'react-router';

import { ArticleDetail } from './components/article-detail';

export function BlogArticlePage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h1>文章不存在</h1>
        <p>请提供有效的文章 ID</p>
      </div>
    );
  }

  return <ArticleDetail articleId={id} />;
}