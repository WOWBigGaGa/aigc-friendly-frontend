import { expect, test, chromium } from '@playwright/test';

test.describe('Admin Authentication', () => {
  test.setTimeout(60000);

  test('should redirect to login page when not authenticated', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    await context.addInitScript(() => {
      localStorage.removeItem('admin_token');
    });

    const page = await context.newPage();
    await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(3000);
    const token = await page.evaluate(() => localStorage.getItem('admin_token'));
    console.log('Test 1 Token:', token);
    console.log('Test 1 URL:', page.url());

    if (!page.url().includes('/admin/login')) {
      await page.waitForNavigation({ timeout: 15000 });
    }
    expect(page.url()).toContain('/admin/login');

    await browser.close();
  });

  test('should allow access to login page without auth', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();

    const page = await context.newPage();
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(3000);
    console.log('Test 2 URL:', page.url());

    expect(page.url()).toContain('/admin/login');
    await page.waitForSelector('text=管理后台登录', { timeout: 15000 });

    await browser.close();
  });

  test('should successfully login with correct credentials', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();

    const page = await context.newPage();
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(3000);

    const usernameInput = page.locator('input[placeholder="请输入用户名"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await usernameInput.fill('admin');
    await passwordInput.fill('admin');
    await submitButton.click();

    await page.waitForURL(/dashboard/, { timeout: 15000 });
    expect(page.url()).toContain('/admin/dashboard');

    await browser.close();
  });

  test('should stay on login page with incorrect credentials', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();

    const page = await context.newPage();
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(3000);

    const usernameInput = page.locator('input[placeholder="请输入用户名"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await usernameInput.fill('wrong');
    await passwordInput.fill('wrong');
    await submitButton.click();

    await page.waitForTimeout(3000);
    expect(page.url()).toContain('/admin/login');

    await browser.close();
  });

  test('should allow access to dashboard when authenticated', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    await context.addInitScript(() => {
      localStorage.setItem('admin_token', 'mock_token');
    });

    const page = await context.newPage();
    await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(3000);
    const token = await page.evaluate(() => localStorage.getItem('admin_token'));
    console.log('Test 5 Token:', token);
    console.log('Test 5 URL:', page.url());

    expect(page.url()).toContain('/admin/dashboard');

    await browser.close();
  });
});