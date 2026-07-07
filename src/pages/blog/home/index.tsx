import { useState } from 'react';

import { ArticleList } from './components/article-list';

export function BlogHomePage() {
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="blog-home">
      <ArticleList page={currentPage} pageSize={10} onPageChange={handlePageChange} />
    </div>
  );
}
