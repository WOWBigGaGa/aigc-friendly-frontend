import { expect, test } from '@playwright/test';

test.describe('Blog Pages', () => {
  test.setTimeout(60000);

  test('should load home page', async ({ page }) => {
    await page.goto('/blog', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h1:has-text("My Blog")', { timeout: 10000 });
    const title = await page.title();
    expect(title).toContain('AIGC Friendly Frontend');
  });

  test('should navigate to links page', async ({ page }) => {
    await page.goto('/blog', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h1:has-text("My Blog")', { timeout: 10000 });
    await page.locator('text=友链').click();
    await page.waitForURL(/links/, { timeout: 10000 });
    expect(page.url()).toContain('links');
  });

  test('should navigate to about page', async ({ page }) => {
    await page.goto('/blog', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h1:has-text("My Blog")', { timeout: 10000 });
    await page.locator('text=关于我').click();
    await page.waitForURL(/about/, { timeout: 10000 });
    expect(page.url()).toContain('about');
  });

  test('should navigate to search page', async ({ page }) => {
    await page.goto('/blog/search', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h1:has-text("My Blog")', { timeout: 10000 });
    expect(page.url()).toContain('search');
  });
});
