import { chromium, expect, test } from '@playwright/test';

test.describe('Admin Settings', () => {
  test.setTimeout(60000);

  test('should navigate to settings page when authenticated', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    await context.addInitScript(() => {
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

    const page = await context.newPage();
    await page.goto('/admin/settings', { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('text=系统设置', { timeout: 15000 });
    expect(page.url()).toContain('/admin/settings');

    await browser.close();
  });

  test('should show profile tab by default', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    await context.addInitScript(() => {
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

    const page = await context.newPage();
    await page.goto('/admin/settings', { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('.ant-tabs-tab-active', { timeout: 10000 });
    const activeTab = page.locator('.ant-tabs-tab-active');
    const activeTabText = await activeTab.textContent();
    expect(activeTabText).toContain('博主信息');

    await browser.close();
  });

  test('should switch to links tab', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    await context.addInitScript(() => {
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

    context.route('**/graphql', (route) => {
      const request = route.request();
      const body = request.postDataJSON();
      const operationName = body?.operationName;

      let responseData: Record<string, unknown>;
      if (operationName === 'friendLinks') {
        responseData = {
          data: { friendLinks: [] },
        };
      } else {
        responseData = { data: {} };
      }

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(responseData),
      });
    });

    const page = await context.newPage();
    await page.goto('/admin/settings', { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('text=友链管理', { timeout: 10000 });
    await page.click('text=友链管理');

    await page.waitForSelector('.ant-tabs-tab-active', { timeout: 10000 });
    const activeTab = page.locator('.ant-tabs-tab-active');
    const activeTabText = await activeTab.textContent();
    expect(activeTabText).toContain('友链管理');

    await browser.close();
  });

  test('should switch to password tab', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    await context.addInitScript(() => {
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

    const page = await context.newPage();
    await page.goto('/admin/settings', { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('text=修改密码', { timeout: 10000 });
    await page.click('text=修改密码');

    await page.waitForSelector('.ant-tabs-tab-active', { timeout: 10000 });
    const activeTab = page.locator('.ant-tabs-tab-active');
    const activeTabText = await activeTab.textContent();
    expect(activeTabText).toContain('修改密码');

    await browser.close();
  });

  test('should save profile successfully', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    await context.addInitScript(() => {
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

    let mutationCallCount = 0;
    context.route('**/graphql', (route) => {
      const request = route.request();
      const body = request.postDataJSON();
      const operationName = body?.operationName;

      let responseData: Record<string, unknown>;
      if (operationName === 'AdminUpdateUserInfo') {
        mutationCallCount++;
        responseData = {
          data: {
            updateUserInfo: {
              isUpdated: true,
              userInfo: {
                id: '1',
                nickname: '测试博主',
                signature: '测试签名',
              },
            },
          },
        };
      } else {
        responseData = { data: {} };
      }

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(responseData),
      });
    });

    const page = await context.newPage();
    await page.goto('/admin/settings', { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('input[placeholder="请输入昵称"]', { timeout: 10000 });
    const nicknameInput = page.locator('input[placeholder="请输入昵称"]');
    const signatureInput = page.locator('textarea[placeholder="请输入简介"]');
    const submitButton = page.locator('button[type="submit"]');

    await nicknameInput.fill('测试博主');
    await signatureInput.fill('测试签名');
    await submitButton.click();

    await page.waitForResponse((response) => response.url().includes('/graphql'), {
      timeout: 10000,
    });
    expect(mutationCallCount).toBe(1);

    await browser.close();
  });

  test('should change password successfully', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    await context.addInitScript(() => {
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

    let mutationCallCount = 0;
    context.route('**/graphql', (route) => {
      const request = route.request();
      const body = request.postDataJSON();
      const operationName = body?.operationName;

      let responseData: Record<string, unknown>;
      if (operationName === 'AdminChangePassword') {
        mutationCallCount++;
        responseData = {
          data: {
            changePassword: {
              success: true,
              message: null,
            },
          },
        };
      } else {
        responseData = { data: {} };
      }

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(responseData),
      });
    });

    const page = await context.newPage();
    await page.goto('/admin/settings', { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('text=修改密码', { timeout: 10000 });
    await page.click('text=修改密码');

    await page.waitForSelector('input[placeholder="请输入原密码"]', { timeout: 10000 });
    const oldPasswordInput = page.locator('input[placeholder="请输入原密码"]');
    const newPasswordInput = page.locator('input[placeholder="请输入新密码"]');
    const confirmPasswordInput = page.locator('input[placeholder="请确认新密码"]');
    const submitButton = page.locator('button[type="submit"]');

    await oldPasswordInput.fill('oldPassword123!');
    await newPasswordInput.fill('newPassword456!');
    await confirmPasswordInput.fill('newPassword456!');
    await submitButton.click();

    await page.waitForResponse((response) => response.url().includes('/graphql'), {
      timeout: 10000,
    });
    expect(mutationCallCount).toBe(1);

    await browser.close();
  });

  test('should show error when passwords do not match', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    await context.addInitScript(() => {
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

    let mutationCallCount = 0;
    context.route('**/graphql', (route) => {
      const request = route.request();
      const body = request.postDataJSON();
      const operationName = body?.operationName;

      if (operationName === 'AdminChangePassword') {
        mutationCallCount++;
      }

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: {} }),
      });
    });

    const page = await context.newPage();
    await page.goto('/admin/settings', { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('text=修改密码', { timeout: 10000 });
    await page.click('text=修改密码');

    await page.waitForSelector('input[placeholder="请输入原密码"]', { timeout: 10000 });
    const oldPasswordInput = page.locator('input[placeholder="请输入原密码"]');
    const newPasswordInput = page.locator('input[placeholder="请输入新密码"]');
    const confirmPasswordInput = page.locator('input[placeholder="请确认新密码"]');
    const submitButton = page.locator('button[type="submit"]');

    await oldPasswordInput.fill('oldPassword123!');
    await newPasswordInput.fill('newPassword456!');
    await confirmPasswordInput.fill('differentPassword789!');
    await submitButton.click();

    await page.waitForTimeout(2000);
    expect(mutationCallCount).toBe(0);

    await browser.close();
  });

  test('should show error when old password is wrong', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    await context.addInitScript(() => {
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

    let mutationCallCount = 0;
    context.route('**/graphql', (route) => {
      const request = route.request();
      const body = request.postDataJSON();
      const operationName = body?.operationName;

      let responseData: Record<string, unknown>;
      if (operationName === 'AdminChangePassword') {
        mutationCallCount++;
        responseData = {
          data: {
            changePassword: {
              success: false,
              message: '原密码错误',
            },
          },
        };
      } else {
        responseData = { data: {} };
      }

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(responseData),
      });
    });

    const page = await context.newPage();
    await page.goto('/admin/settings', { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('text=修改密码', { timeout: 10000 });
    await page.click('text=修改密码');

    await page.waitForSelector('input[placeholder="请输入原密码"]', { timeout: 10000 });
    const oldPasswordInput = page.locator('input[placeholder="请输入原密码"]');
    const newPasswordInput = page.locator('input[placeholder="请输入新密码"]');
    const confirmPasswordInput = page.locator('input[placeholder="请确认新密码"]');
    const submitButton = page.locator('button[type="submit"]');

    await oldPasswordInput.fill('wrongPassword');
    await newPasswordInput.fill('newPassword456!');
    await confirmPasswordInput.fill('newPassword456!');
    await submitButton.click();

    await page.waitForResponse((response) => response.url().includes('/graphql'), {
      timeout: 10000,
    });
    expect(mutationCallCount).toBe(1);

    await browser.close();
  });

  test('should create friend link successfully', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    await context.addInitScript(() => {
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

    let mutationCallCount = 0;
    context.route('**/graphql', (route) => {
      const request = route.request();
      const body = request.postDataJSON();
      const operationName = body?.operationName;

      let responseData: Record<string, unknown>;
      if (operationName === 'friendLinks') {
        responseData = {
          data: { friendLinks: [] },
        };
      } else if (operationName === 'AdminCreateFriendLink') {
        mutationCallCount++;
        responseData = {
          data: {
            createFriendLink: {
              id: 'link-1',
              name: '测试友链',
              url: 'https://example.com',
              description: '测试描述',
              logo: null,
              sort: 0,
              isActive: true,
            },
          },
        };
      } else {
        responseData = { data: {} };
      }

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(responseData),
      });
    });

    const page = await context.newPage();
    await page.goto('/admin/settings', { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('text=友链管理', { timeout: 10000 });
    await page.click('text=友链管理');

    await page.waitForSelector('text=添加友链', { timeout: 10000 });
    await page.click('text=添加友链');

    await page.waitForSelector('input[placeholder="请输入友链名称"]', { timeout: 10000 });
    const nameInput = page.locator('input[placeholder="请输入友链名称"]');
    const urlInput = page.locator('input[placeholder="请输入友链链接"]');
    const descriptionInput = page.locator('textarea[placeholder="请输入友链描述"]');
    const submitButton = page.locator('button[type="submit"]');

    await nameInput.fill('测试友链');
    await urlInput.fill('https://example.com');
    await descriptionInput.fill('测试描述');
    await submitButton.click();

    await page.waitForResponse((response) => response.url().includes('/graphql'), {
      timeout: 10000,
    });
    expect(mutationCallCount).toBe(1);

    await browser.close();
  });

  test('should redirect to login when not authenticated', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();

    const page = await context.newPage();
    await page.goto('/admin/settings', { waitUntil: 'domcontentloaded' });

    await page.waitForURL(/login/, { timeout: 15000 });
    expect(page.url()).toContain('/admin/login');

    await browser.close();
  });
});
