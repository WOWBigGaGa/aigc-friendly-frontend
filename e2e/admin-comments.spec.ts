import { expect, test } from '@playwright/test';

test.describe('Admin Comments Management', () => {
  test.setTimeout(60000);

  test('should redirect to login page when not authenticated', async ({ page }) => {
    await page.goto('/admin/comments', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/admin/login');
  });

  test('should load comments page when authenticated', async ({ page }) => {
    await page.addInitScript(() => {
      document.cookie = 'admin_token=mock_token; path=/';
      localStorage.setItem(
        'admin_user',
        JSON.stringify({ id: '1', username: 'admin', email: 'admin@example.com', roles: ['admin'] }),
      );
    });

    await page.goto('/admin/comments', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    expect(page.url()).toContain('/admin/comments');
    await page.waitForSelector('text=评论管理', { timeout: 10000 });
  });

  test('should render comments table with mock data', async ({ page }) => {
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

      if (query.includes('allComments')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              allComments: {
                items: [
                  {
                    id: '1',
                    articleId: 'article-1',
                    authorName: 'Test User',
                    authorEmail: 'test@example.com',
                    content: 'This is a test comment',
                    status: 'PENDING',
                    createdAt: '2024-01-15T10:30:00Z',
                  },
                  {
                    id: '2',
                    articleId: 'article-2',
                    authorName: 'Another User',
                    authorEmail: 'another@example.com',
                    content: 'Another test comment',
                    status: 'APPROVED',
                    createdAt: '2024-01-14T09:00:00Z',
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

    await page.goto('/admin/comments', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    await page.waitForSelector('text=评论管理', { timeout: 10000 });
    await page.waitForSelector('text=Test User', { timeout: 10000 });
    await page.waitForSelector('text=Another User', { timeout: 10000 });
    await page.waitForSelector('text=待审核', { timeout: 10000 });
    await page.waitForSelector('text=已通过', { timeout: 10000 });
  });

  test('should show approve and reject buttons for pending comments', async ({ page }) => {
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

      if (query.includes('allComments')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              allComments: {
                items: [
                  {
                    id: '1',
                    articleId: 'article-1',
                    authorName: 'Test User',
                    authorEmail: 'test@example.com',
                    content: 'Pending comment',
                    status: 'PENDING',
                    createdAt: '2024-01-15T10:30:00Z',
                  },
                ],
                total: 1,
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

    await page.goto('/admin/comments', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    await page.waitForSelector('text=通过', { timeout: 10000 });
    await page.waitForSelector('text=驳回', { timeout: 10000 });
  });

  test('should approve comment successfully', async ({ page }) => {
    await page.addInitScript(() => {
      document.cookie = 'admin_token=mock_token; path=/';
      localStorage.setItem(
        'admin_user',
        JSON.stringify({ id: '1', username: 'admin', email: 'admin@example.com', roles: ['admin'] }),
      );
    });

    let approveCallCount = 0;

    page.route('**/graphql', (route) => {
      const requestBody = JSON.parse(route.request().postData() || '{}');
      const query = requestBody.query;

      if (query.includes('allComments')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              allComments: {
                items:
                  approveCallCount === 0
                    ? [
                        {
                          id: '1',
                          articleId: 'article-1',
                          authorName: 'Test User',
                          authorEmail: 'test@example.com',
                          content: 'Pending comment',
                          status: 'PENDING',
                          createdAt: '2024-01-15T10:30:00Z',
                        },
                      ]
                    : [],
                total: approveCallCount === 0 ? 1 : 0,
                page: 1,
                pageSize: 10,
              },
            },
          }),
        });
      } else if (query.includes('approveComment')) {
        approveCallCount++;
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              approveComment: { id: '1', status: 'APPROVED' },
            },
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/admin/comments', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const approveButton = page.locator('text=通过');
    await approveButton.click();
    await page.waitForTimeout(2000);

    await page.waitForSelector('text=评论已通过', { timeout: 5000 });
  });

  test('should reject comment successfully', async ({ page }) => {
    await page.addInitScript(() => {
      document.cookie = 'admin_token=mock_token; path=/';
      localStorage.setItem(
        'admin_user',
        JSON.stringify({ id: '1', username: 'admin', email: 'admin@example.com', roles: ['admin'] }),
      );
    });

    let rejectCallCount = 0;

    page.route('**/graphql', (route) => {
      const requestBody = JSON.parse(route.request().postData() || '{}');
      const query = requestBody.query;

      if (query.includes('allComments')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              allComments: {
                items:
                  rejectCallCount === 0
                    ? [
                        {
                          id: '1',
                          articleId: 'article-1',
                          authorName: 'Test User',
                          authorEmail: 'test@example.com',
                          content: 'Pending comment',
                          status: 'PENDING',
                          createdAt: '2024-01-15T10:30:00Z',
                        },
                      ]
                    : [],
                total: rejectCallCount === 0 ? 1 : 0,
                page: 1,
                pageSize: 10,
              },
            },
          }),
        });
      } else if (query.includes('rejectComment')) {
        rejectCallCount++;
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              rejectComment: { id: '1', status: 'REJECTED' },
            },
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/admin/comments', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const rejectButton = page.locator('text=驳回');
    await rejectButton.click();
    await page.waitForTimeout(2000);

    await page.waitForSelector('text=评论已驳回', { timeout: 5000 });
  });

  test('should delete comment successfully with confirmation', async ({ page }) => {
    await page.addInitScript(() => {
      document.cookie = 'admin_token=mock_token; path=/';
      localStorage.setItem(
        'admin_user',
        JSON.stringify({ id: '1', username: 'admin', email: 'admin@example.com', roles: ['admin'] }),
      );
    });

    let deleteCallCount = 0;

    page.route('**/graphql', (route) => {
      const requestBody = JSON.parse(route.request().postData() || '{}');
      const query = requestBody.query;

      if (query.includes('allComments')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              allComments: {
                items:
                  deleteCallCount === 0
                    ? [
                        {
                          id: '1',
                          articleId: 'article-1',
                          authorName: 'Test User',
                          authorEmail: 'test@example.com',
                          content: 'Approved comment',
                          status: 'APPROVED',
                          createdAt: '2024-01-15T10:30:00Z',
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
      } else if (query.includes('deleteComment')) {
        deleteCallCount++;
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              deleteComment: true,
            },
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/admin/comments', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const deleteButton = page.locator('text=删除');
    await deleteButton.click();
    await page.waitForTimeout(1000);

    const confirmButton = page.locator('text=确定');
    await confirmButton.click();
    await page.waitForTimeout(2000);

    await page.waitForSelector('text=评论已删除', { timeout: 5000 });
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

    await page.goto('/admin/comments', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    await page.waitForSelector('text=评论管理', { timeout: 10000 });
  });
});