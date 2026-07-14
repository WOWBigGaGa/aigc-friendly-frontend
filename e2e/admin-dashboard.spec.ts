import { expect, test } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.setTimeout(60000);

  test('should redirect to login page when not authenticated', async ({ page }) => {
    await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/admin/login');
  });

  test('should load dashboard page when authenticated', async ({ page }) => {
    await page.addInitScript(() => {
      document.cookie = 'admin_token=mock_token; path=/';
      localStorage.setItem(
        'admin_user',
        JSON.stringify({ id: '1', username: 'admin', email: 'admin@example.com', roles: ['admin'] }),
      );
    });

    await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    expect(page.url()).toContain('/admin/dashboard');
    await page.waitForSelector('text=仪表盘', { timeout: 10000 });
  });

  test('should render statistic cards with mock data', async ({ page }) => {
    await page.addInitScript(() => {
      document.cookie = 'admin_token=mock_token; path=/';
      localStorage.setItem(
        'admin_user',
        JSON.stringify({ id: '1', username: 'admin', email: 'admin@example.com', roles: ['admin'] }),
      );
    });

    page.route('**/graphql', (route) => {
      const requestBody = JSON.parse(route.request().postData() || '{}');
      const query = requestBody.query;

      if (query.includes('dashboardStats')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              dashboardStats: {
                articleCount: 42,
                commentCount: 128,
                categoryCount: 5,
                tagCount: 20,
                totalViewCount: 15680,
                totalLikeCount: 3240,
                pendingCommentCount: 3,
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
                pageSize: 5,
              },
            },
          }),
        });
      } else if (query.includes('pendingComments')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              pendingComments: {
                items: [],
                total: 0,
                page: 1,
                pageSize: 5,
              },
            },
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    await page.waitForSelector('text=文章总数', { timeout: 10000 });
    await page.waitForSelector('text=评论总数', { timeout: 10000 });
    await page.waitForSelector('text=总阅读量', { timeout: 10000 });
    await page.waitForSelector('text=总点赞量', { timeout: 10000 });
    await page.waitForSelector('text=分类总数', { timeout: 10000 });
    await page.waitForSelector('text=标签总数', { timeout: 10000 });
  });

  test('should render recent articles table with mock data', async ({ page }) => {
    await page.addInitScript(() => {
      document.cookie = 'admin_token=mock_token; path=/';
      localStorage.setItem(
        'admin_user',
        JSON.stringify({ id: '1', username: 'admin', email: 'admin@example.com', roles: ['admin'] }),
      );
    });

    page.route('**/graphql', (route) => {
      const requestBody = JSON.parse(route.request().postData() || '{}');
      const query = requestBody.query;

      if (query.includes('dashboardStats')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              dashboardStats: {
                articleCount: 42,
                commentCount: 128,
                categoryCount: 5,
                tagCount: 20,
                totalViewCount: 15680,
                totalLikeCount: 3240,
                pendingCommentCount: 0,
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
                items: [
                  {
                    id: '1',
                    title: 'Test Article 1',
                    status: 'PUBLISHED',
                    viewCount: 100,
                    likeCount: 10,
                    publishedAt: '2024-01-01',
                    category: { id: '1', name: 'Category 1' },
                  },
                  {
                    id: '2',
                    title: 'Test Article 2',
                    status: 'DRAFT',
                    viewCount: 0,
                    likeCount: 0,
                    publishedAt: null,
                    category: { id: '2', name: 'Category 2' },
                  },
                ],
                total: 2,
                page: 1,
                pageSize: 5,
              },
            },
          }),
        });
      } else if (query.includes('pendingComments')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              pendingComments: {
                items: [],
                total: 0,
                page: 1,
                pageSize: 5,
              },
            },
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    await page.waitForSelector('text=最近文章', { timeout: 10000 });
    await page.waitForSelector('text=Test Article 1', { timeout: 10000 });
    await page.waitForSelector('text=Test Article 2', { timeout: 10000 });
  });

  test('should render pending comments table with mock data', async ({ page }) => {
    await page.addInitScript(() => {
      document.cookie = 'admin_token=mock_token; path=/';
      localStorage.setItem(
        'admin_user',
        JSON.stringify({ id: '1', username: 'admin', email: 'admin@example.com', roles: ['admin'] }),
      );
    });

    page.route('**/graphql', (route) => {
      const requestBody = JSON.parse(route.request().postData() || '{}');
      const query = requestBody.query;

      if (query.includes('dashboardStats')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              dashboardStats: {
                articleCount: 42,
                commentCount: 128,
                categoryCount: 5,
                tagCount: 20,
                totalViewCount: 15680,
                totalLikeCount: 3240,
                pendingCommentCount: 2,
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
                pageSize: 5,
              },
            },
          }),
        });
      } else if (query.includes('pendingComments')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              pendingComments: {
                items: [
                  {
                    id: '1',
                    articleId: '1',
                    authorName: 'Test User',
                    authorEmail: 'test@example.com',
                    content: 'Test comment content',
                    status: 'PENDING',
                    createdAt: '2024-01-01T00:00:00Z',
                  },
                ],
                total: 1,
                page: 1,
                pageSize: 5,
              },
            },
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    await page.waitForSelector('text=待审核评论', { timeout: 10000 });
    await page.waitForSelector('text=Test User', { timeout: 10000 });
    await page.waitForSelector('text=Test comment content', { timeout: 10000 });
  });

  test('should show empty state when no pending comments', async ({ page }) => {
    await page.addInitScript(() => {
      document.cookie = 'admin_token=mock_token; path=/';
      localStorage.setItem(
        'admin_user',
        JSON.stringify({ id: '1', username: 'admin', email: 'admin@example.com', roles: ['admin'] }),
      );
    });

    page.route('**/graphql', (route) => {
      const requestBody = JSON.parse(route.request().postData() || '{}');
      const query = requestBody.query;

      if (query.includes('dashboardStats')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              dashboardStats: {
                articleCount: 42,
                commentCount: 128,
                categoryCount: 5,
                tagCount: 20,
                totalViewCount: 15680,
                totalLikeCount: 3240,
                pendingCommentCount: 0,
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
                pageSize: 5,
              },
            },
          }),
        });
      } else if (query.includes('pendingComments')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              pendingComments: {
                items: [],
                total: 0,
                page: 1,
                pageSize: 5,
              },
            },
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    await page.waitForSelector('text=暂无待审核评论', { timeout: 10000 });
  });

  test('should handle API error gracefully', async ({ page }) => {
    await page.addInitScript(() => {
      document.cookie = 'admin_token=mock_token; path=/';
      localStorage.setItem(
        'admin_user',
        JSON.stringify({ id: '1', username: 'admin', email: 'admin@example.com', roles: ['admin'] }),
      );
    });

    page.route('**/graphql', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ errors: [{ message: 'Internal Server Error' }] }),
      });
    });

    await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    await page.waitForSelector('text=仪表盘', { timeout: 10000 });
  });

  test('should render data overview section', async ({ page }) => {
    await page.addInitScript(() => {
      document.cookie = 'admin_token=mock_token; path=/';
      localStorage.setItem(
        'admin_user',
        JSON.stringify({ id: '1', username: 'admin', email: 'admin@example.com', roles: ['admin'] }),
      );
    });

    page.route('**/graphql', (route) => {
      const requestBody = JSON.parse(route.request().postData() || '{}');
      const query = requestBody.query;

      if (query.includes('dashboardStats')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              dashboardStats: {
                articleCount: 42,
                commentCount: 128,
                categoryCount: 5,
                tagCount: 20,
                totalViewCount: 15680,
                totalLikeCount: 3240,
                pendingCommentCount: 0,
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
                pageSize: 5,
              },
            },
          }),
        });
      } else if (query.includes('pendingComments')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              pendingComments: {
                items: [],
                total: 0,
                page: 1,
                pageSize: 5,
              },
            },
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    await page.waitForSelector('text=数据概览', { timeout: 10000 });
    await page.waitForSelector('text=文章数量', { timeout: 10000 });
    await page.waitForSelector('text=评论数量', { timeout: 10000 });
    await page.waitForSelector('text=总阅读量', { timeout: 10000 });
    await page.waitForSelector('text=总点赞量', { timeout: 10000 });
  });
});