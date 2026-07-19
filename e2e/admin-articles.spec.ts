import { expect, test } from '@playwright/test';

test.describe('Admin Articles Management', () => {
  test.setTimeout(60000);

  test('should redirect to login page when not authenticated', async ({ page }) => {
    await page.goto('/admin/articles', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/admin/login');
  });

  test('should load articles page when authenticated', async ({ page }) => {
    await page.addInitScript(() => {
      document.cookie = 'admin_token=mock_token; path=/';
      localStorage.setItem(
        'admin_user',
        JSON.stringify({
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          roles: ['admin'],
        }),
      );
    });

    await page.goto('/admin/articles', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    expect(page.url()).toContain('/admin/articles');
    await page.waitForSelector('text=文章管理', { timeout: 10000 });
  });

  test('should render articles table with mock data', async ({ page }) => {
    await page.addInitScript(() => {
      document.cookie = 'admin_token=mock_token; path=/';
      localStorage.setItem(
        'admin_user',
        JSON.stringify({
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          roles: ['admin'],
        }),
      );
    });

    page.route('**/graphql', (route) => {
      const requestBody = JSON.parse(route.request().postData() || '{}');
      const query = requestBody.query;

      if (query.includes('articles')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              articles: {
                items: [
                  {
                    id: '1',
                    title: 'Test Article 1',
                    status: 'PUBLISHED',
                    viewCount: 100,
                    likeCount: 10,
                    publishedAt: '2024-01-15',
                    category: { id: '1', name: '技术' },
                  },
                  {
                    id: '2',
                    title: 'Test Article 2',
                    status: 'DRAFT',
                    viewCount: 0,
                    likeCount: 0,
                    publishedAt: null,
                    category: { id: '2', name: '生活' },
                  },
                ],
                total: 2,
                page: 1,
                pageSize: 10,
              },
            },
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/admin/articles', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    await page.waitForSelector('text=文章管理', { timeout: 10000 });
    await page.waitForSelector('text=Test Article 1', { timeout: 10000 });
    await page.waitForSelector('text=Test Article 2', { timeout: 10000 });
    await page.waitForSelector('text=已发布', { timeout: 10000 });
    await page.waitForSelector('text=草稿', { timeout: 10000 });
  });

  test('should create article successfully', async ({ page }) => {
    await page.addInitScript(() => {
      document.cookie = 'admin_token=mock_token; path=/';
      localStorage.setItem(
        'admin_user',
        JSON.stringify({
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          roles: ['admin'],
        }),
      );
    });

    let createCallCount = 0;

    page.route('**/graphql', (route) => {
      const requestBody = JSON.parse(route.request().postData() || '{}');
      const query = requestBody.query;

      if (query.includes('categories')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              categories: [
                { id: '1', name: '技术', slug: 'tech', description: '', parentId: '' },
                { id: '2', name: '生活', slug: 'life', description: '', parentId: '' },
              ],
            },
          }),
        });
      } else if (query.includes('createArticle')) {
        createCallCount++;
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              createArticle: {
                id: '3',
                title: 'New Article',
                status: 'PUBLISHED',
                publishedAt: '2024-01-16',
              },
            },
          }),
        });
      } else if (query.includes('articles')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              articles: {
                items: [],
                total: 0,
                page: 1,
                pageSize: 10,
              },
            },
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/admin/articles/new', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    await page.waitForSelector('text=新建文章', { timeout: 10000 });

    await page.fill('input[placeholder="请输入文章标题"]', 'New Article');
    await page.fill('textarea[placeholder="请输入文章摘要"]', 'This is a new article summary');

    const publishButton = page.locator('text=发布文章');
    await publishButton.click();
    await page.waitForTimeout(2000);

    await page.waitForSelector('text=文章发布成功', { timeout: 5000 });
    expect(page.url()).toContain('/admin/articles');
  });

  test('should edit article successfully', async ({ page }) => {
    await page.addInitScript(() => {
      document.cookie = 'admin_token=mock_token; path=/';
      localStorage.setItem(
        'admin_user',
        JSON.stringify({
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          roles: ['admin'],
        }),
      );
    });

    let updateCallCount = 0;

    page.route('**/graphql', (route) => {
      const requestBody = JSON.parse(route.request().postData() || '{}');
      const query = requestBody.query;

      if (query.includes('article(id')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              article: {
                id: '1',
                title: 'Original Title',
                content: 'Original content',
                summary: 'Original summary',
                coverImage: '',
                status: 'DRAFT',
                categoryId: '1',
                authorId: '1',
                viewCount: 0,
                likeCount: 0,
                isPinned: false,
                publishedAt: null,
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01',
              },
            },
          }),
        });
      } else if (query.includes('categories')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              categories: [
                { id: '1', name: '技术', slug: 'tech', description: '', parentId: '' },
                { id: '2', name: '生活', slug: 'life', description: '', parentId: '' },
              ],
            },
          }),
        });
      } else if (query.includes('updateArticle')) {
        updateCallCount++;
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              updateArticle: {
                id: '1',
                title: 'Updated Title',
                status: 'PUBLISHED',
                publishedAt: '2024-01-16',
              },
            },
          }),
        });
      } else if (query.includes('articles')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              articles: {
                items: [],
                total: 0,
                page: 1,
                pageSize: 10,
              },
            },
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/admin/articles/1/edit', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    await page.waitForSelector('text=编辑文章', { timeout: 10000 });

    await page.fill('input[placeholder="请输入文章标题"]', 'Updated Title');

    const publishButton = page.locator('text=发布文章');
    await publishButton.click();
    await page.waitForTimeout(2000);

    await page.waitForSelector('text=文章发布成功', { timeout: 5000 });
    expect(page.url()).toContain('/admin/articles');
  });

  test('should delete article successfully with confirmation', async ({ page }) => {
    await page.addInitScript(() => {
      document.cookie = 'admin_token=mock_token; path=/';
      localStorage.setItem(
        'admin_user',
        JSON.stringify({
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          roles: ['admin'],
        }),
      );
    });

    let deleteCallCount = 0;

    page.route('**/graphql', (route) => {
      const requestBody = JSON.parse(route.request().postData() || '{}');
      const query = requestBody.query;

      if (query.includes('articles')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              articles: {
                items:
                  deleteCallCount === 0
                    ? [
                        {
                          id: '1',
                          title: 'Article to Delete',
                          status: 'PUBLISHED',
                          viewCount: 100,
                          likeCount: 10,
                          publishedAt: '2024-01-15',
                          category: { id: '1', name: '技术' },
                        },
                      ]
                    : [],
                total: deleteCallCount === 0 ? 1 : 0,
                page: 1,
                pageSize: 10,
              },
            },
          }),
        });
      } else if (query.includes('deleteArticle')) {
        deleteCallCount++;
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              deleteArticle: true,
            },
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/admin/articles', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const deleteButton = page.locator('text=删除');
    await deleteButton.click();
    await page.waitForTimeout(1000);

    const confirmButton = page.locator('text=确定');
    await confirmButton.click();
    await page.waitForTimeout(2000);

    await page.waitForSelector('text=文章已删除', { timeout: 5000 });
  });

  test('should toggle article status successfully', async ({ page }) => {
    await page.addInitScript(() => {
      document.cookie = 'admin_token=mock_token; path=/';
      localStorage.setItem(
        'admin_user',
        JSON.stringify({
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          roles: ['admin'],
        }),
      );
    });

    let toggleCallCount = 0;

    page.route('**/graphql', (route) => {
      const requestBody = JSON.parse(route.request().postData() || '{}');
      const query = requestBody.query;

      if (query.includes('articles')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              articles: {
                items: [
                  {
                    id: '1',
                    title: 'Draft Article',
                    status: toggleCallCount === 0 ? 'DRAFT' : 'PUBLISHED',
                    viewCount: 0,
                    likeCount: 0,
                    publishedAt: toggleCallCount === 0 ? null : '2024-01-16',
                    category: { id: '1', name: '技术' },
                  },
                ],
                total: 1,
                page: 1,
                pageSize: 10,
              },
            },
          }),
        });
      } else if (query.includes('toggleArticleStatus')) {
        toggleCallCount++;
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              toggleArticleStatus: { id: '1', status: 'PUBLISHED' },
            },
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/admin/articles', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const publishButton = page.locator('text=发布');
    await publishButton.click();
    await page.waitForTimeout(2000);

    await page.waitForSelector('text=文章已发布', { timeout: 5000 });
  });

  test('should handle API error gracefully', async ({ page }) => {
    await page.addInitScript(() => {
      document.cookie = 'admin_token=mock_token; path=/';
      localStorage.setItem(
        'admin_user',
        JSON.stringify({
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          roles: ['admin'],
        }),
      );
    });

    page.route('**/graphql', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ errors: [{ message: 'Internal Server Error' }] }),
      });
    });

    await page.goto('/admin/articles', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    await page.waitForSelector('text=文章管理', { timeout: 10000 });
  });
});
