import { test, expect } from '@playwright/test';
test('shell navigation, field validation and real retry', async ({ page }, testInfo) => {
  let available = false;
  await page.route('http://127.0.0.1:4119/**', route => {
    if (route.request().url().endsWith('/health/ready')) return route.fulfill({ status: available ? 200 : 503, json: { status: available ? 'ok' : 'unavailable', service: 'complyos-api' } });
    return route.fulfill({ json: { data: [], page: 1, limit: 5, total: 0 } });
  });
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
  await expect(page.getByText(/A required service is unavailable/)).toBeVisible();
  available = true;
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByText('PostgreSQL and Redis are connected.')).toBeVisible();
  await page.getByRole('button', { name: 'Send sample job' }).click();
  await expect(page.getByText('Enter at least 2 characters.')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('dashboard.png'), fullPage: true });
  if (testInfo.project.name === 'mobile') await page.getByRole('button', { name: 'Open menu' }).click();
  await page.getByRole('link', { name: 'Evidence', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Evidence', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Evidence', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

